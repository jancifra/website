#!/usr/bin/env node
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

// Covers the longest gap between scheduled runs (Fri → Mon).
const LOOKBACK_HOURS = 72;
const MAX_PER_FEED = 6;
const SHORTLIST_SIZE = 60;
const RECENT_CONTEXT_NOTES = 10;
const MODEL = "claude-sonnet-4-6";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function log(...args) {
  console.error("[generate-note]", ...args);
}

async function main() {
  const date = todayDate();
  const force = !!process.env.FORCE_NOTE && process.env.FORCE_NOTE !== "0" && process.env.FORCE_NOTE !== "false";

  const outFilename = force
    ? `test-${date}-${Date.now()}.json`
    : `${date}.json`;
  const outPath = path.join(NOTES_DIR, outFilename);

  if (!force && fs.existsSync(outPath)) {
    log(`Note for ${date} already exists at ${outPath}, skipping.`);
    process.exit(0);
  }
  if (force) log("FORCE_NOTE set — generating test note that will not render on /notes.");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log("ANTHROPIC_API_KEY not set — aborting.");
    process.exit(1);
  }

  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf-8"));
  const profile = fs.readFileSync(PROFILE_PATH, "utf-8");

  const pastUrls = loadPastNoteUrls(NOTES_DIR);
  const recentNotes = loadRecentNotes(NOTES_DIR, RECENT_CONTEXT_NOTES);
  log(`${pastUrls.size} past notes loaded for dedupe; ${recentNotes.length} recent notes for diversity context.`);

  const parser = new Parser({ timeout: 15000 });
  const cutoff = Date.now() - LOOKBACK_HOURS * 3600 * 1000;

  const allItems = (
    await Promise.all(
      sources.feeds.map((f) =>
        fetchFeedItems(parser, f).catch((err) => {
          log(`feed failed: ${f.name} (${f.url}) — ${err.message}`);
          return [];
        }),
      ),
    )
  ).flat();

  const { fresh, shortlist } = buildShortlist(allItems, {
    pastUrls,
    windowStart: cutoff,
    maxPerFeed: MAX_PER_FEED,
    size: SHORTLIST_SIZE,
  });

  log(`${allItems.length} total items fetched, ${fresh.length} fresh after dedupe + recency.`);

  if (shortlist.length === 0) {
    log("No fresh candidates — nothing to pick.");
    process.exit(0);
  }

  log(`Sending ${shortlist.length} candidates to Claude (${MODEL})…`);

  const client = new Anthropic({ apiKey });
  const note = await pickNote({ client, model: MODEL, profile, recentNotes, shortlist, date, log });
  if (!note) process.exit(0);

  fs.mkdirSync(NOTES_DIR, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(note, null, 2) + "\n");
  log(`Wrote ${outPath}`);

  if (process.env.GITHUB_OUTPUT) {
    const lines = [
      `note_path=${outPath}`,
      `note_title=${note.title.replace(/[\r\n]+/g, " ")}`,
      `note_date=${note.date}`,
      `note_source=${note.source}`,
    ].join("\n");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, lines + "\n");
  }

  // Exit explicitly: rss-parser and the Anthropic SDK can leave keep-alive
  // sockets open, which otherwise keeps the event loop alive and hangs the
  // process (and the CI step) until the job's 6h timeout.
  process.exit(0);
}

main().catch((err) => {
  log("FATAL:", err.message);
  console.error(err);
  process.exit(1);
});
