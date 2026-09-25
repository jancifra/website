#!/usr/bin/env node
// One-off backfill for days the daily-note workflow missed. For each Mon/Wed/Fri
// in [BACKFILL_FROM, BACKFILL_TO] without a note, builds the candidate list the
// daily job would have seen: the configured feeds plus their WordPress per-day
// archive feeds (/YYYY/MM/DD/feed/) for the 72h before that date. Then runs the
// same pick as generate-note.mjs. DRY_RUN=1 prints candidate counts per date
// without calling the API.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { buildShortlist, fetchFeedItems, loadPastNoteUrls, loadRecentNotes, pickNote } from "./note-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const NOTES_DIR = path.join(ROOT, "content/notes");
const SOURCES_PATH = path.join(NOTES_DIR, "sources.json");
const PROFILE_PATH = path.join(NOTES_DIR, "profile.md");

const MODEL = "claude-sonnet-4-6";
const LOOKBACK_HOURS = 72;
// Fewer feeds have archives than the daily job has live feeds, so allow more
// per source to keep the shortlist a similar size.
const MAX_PER_FEED = 15;
const SHORTLIST_SIZE = 60;
const RECENT_CONTEXT_NOTES = 10;
const PUBLISH_DAYS = new Set([1, 3, 5]); // Mon, Wed, Fri (UTC), matching the cron
const DAY_MS = 24 * 3600 * 1000;

function log(...args) {
  console.error("[backfill-notes]", ...args);
}

function parseDateArg(name) {
  const v = process.env[name];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v ?? "")) {
    log(`${name} must be set to YYYY-MM-DD (got "${v ?? ""}").`);
    process.exit(1);
  }
  return v;
}

function publishDates(from, to) {
  const dates = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
    if (PUBLISH_DAYS.has(new Date(t).getUTCDay())) dates.push(new Date(t).toISOString().slice(0, 10));
  }
  return dates;
}

function dayArchiveUrl(feedUrl, day) {
  const [y, m, d] = day.split("-");
  return `${new URL(feedUrl).origin}/${y}/${m}/${d}/feed/`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(parser, feed, url) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchFeedItems(parser, feed, url);
    } catch (err) {
      if (!/Status code 429/.test(err.message) || attempt >= 2) throw err;
      await sleep(15000 * (attempt + 1));
    }
  }
}

// Fetches are shared across dates (their 72h windows overlap). Day archives
// 404 on days without posts, so a feed is only treated as having no archives
// after several failures and no success.
const ARCHIVE_GIVE_UP_AFTER = 3;

function makeCandidateFetcher(parser, feeds) {
  const cache = new Map();
  const archiveOk = new Set();
  const archiveFailures = new Map();
  const noArchive = (feed) => !archiveOk.has(feed.name) && (archiveFailures.get(feed.name) ?? 0) >= ARCHIVE_GIVE_UP_AFTER;

  function fetchOnce(feed, url, isArchive) {
    if (!cache.has(url)) {
      cache.set(
        url,
        fetchWithRetry(parser, feed, url).then(
          (items) => {
            if (isArchive) archiveOk.add(feed.name);
            return items;
          },
          (err) => {
            if (isArchive) archiveFailures.set(feed.name, (archiveFailures.get(feed.name) ?? 0) + 1);
            else log(`feed failed: ${feed.name} (${url}) — ${err.message}`);
            return [];
          },
        ),
      );
    }
    return cache.get(url);
  }

  return async function candidatesFor(days) {
    const lists = await Promise.all(
      feeds.map(async (feed) => {
        const items = [...(await fetchOnce(feed, feed.url, false))];
        for (const day of days) {
          if (noArchive(feed)) break;
          items.push(...(await fetchOnce(feed, dayArchiveUrl(feed.url, day), true)));
        }
        return items;
      }),
    );
    return lists.flat();
  };
}

function countBySource(items) {
  const counts = new Map();
  for (const it of items) counts.set(it.source, (counts.get(it.source) ?? 0) + 1);
  return [...counts].map(([s, n]) => `${s} ${n}`).join(", ");
}

async function main() {
  const from = parseDateArg("BACKFILL_FROM");
  const to = parseDateArg("BACKFILL_TO");
  const dryRun = !!process.env.DRY_RUN && process.env.DRY_RUN !== "0" && process.env.DRY_RUN !== "false";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && !dryRun) {
    log("ANTHROPIC_API_KEY not set — aborting.");
    process.exit(1);
  }

  const dates = publishDates(from, to).filter((d) => !fs.existsSync(path.join(NOTES_DIR, `${d}.json`)));
  log(`${dates.length} Mon/Wed/Fri dates without a note between ${from} and ${to}: ${dates.join(", ")}`);

  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf-8"));
  const profile = fs.readFileSync(PROFILE_PATH, "utf-8");
  const candidatesFor = makeCandidateFetcher(new Parser({ timeout: 15000 }), sources.feeds);
  const client = dryRun ? null : new Anthropic({ apiKey });
  let written = 0;

  // Sequential on purpose: each note's diversity context includes the ones
  // backfilled just before it.
  for (const date of dates) {
    const dayStart = Date.parse(`${date}T00:00:00Z`);
    const windowStart = dayStart - LOOKBACK_HOURS * 3600 * 1000;
    const windowEnd = dayStart + DAY_MS - 1;
    const days = [];
    for (let t = windowStart; t <= windowEnd; t += DAY_MS) days.push(new Date(t).toISOString().slice(0, 10));

    const { shortlist } = buildShortlist(await candidatesFor(days), {
      pastUrls: loadPastNoteUrls(NOTES_DIR),
      windowStart,
      windowEnd,
      requireDate: true,
      maxPerFeed: MAX_PER_FEED,
      size: SHORTLIST_SIZE,
    });

    log(`${date}: ${shortlist.length} candidates (${countBySource(shortlist) || "none"})`);
    if (dryRun || shortlist.length === 0) continue;

    try {
      const note = await pickNote({
        client,
        model: MODEL,
        profile,
        recentNotes: loadRecentNotes(NOTES_DIR, RECENT_CONTEXT_NOTES, date),
        shortlist,
        date,
        log: (...args) => log(`${date}:`, ...args),
        extraRules: [
          `This note is backfilled for ${date}. Write the commentary as of that date: don't mention or hint at anything that happened afterwards, including how the story played out.`,
        ],
      });
      if (!note) continue;
      fs.writeFileSync(path.join(NOTES_DIR, `${date}.json`), JSON.stringify(note, null, 2) + "\n");
      written++;
      log(`${date}: wrote "${note.title}" (${note.source})`);
    } catch (err) {
      // Auth/billing problems won't fix themselves on the next date.
      if (err instanceof Anthropic.APIError && [400, 401, 403].includes(err.status)) {
        log(`FATAL on ${date}:`, err.message);
        break;
      }
      log(`${date}: failed — ${err.message}`);
    }
  }

  log(`Done: ${written} of ${dates.length} notes written.`);

  // Exit explicitly: rss-parser and the Anthropic SDK can leave keep-alive
  // sockets open.
  process.exit(0);
}

main().catch((err) => {
  log("FATAL:", err.message);
  console.error(err);
  process.exit(1);
});
