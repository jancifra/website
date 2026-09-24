#!/usr/bin/env node
// One-off backfill for days the daily-note workflow missed. For each Mon/Wed/Fri
// in [BACKFILL_FROM, BACKFILL_TO] without a note, Claude searches the web for
// articles published in the 72h before that date and picks one, using the same
// curator profile and diversity rules as generate-note.mjs. Picks are verified
// (URL came from the search results, page loads, publish date is in the window)
// before a note is written.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { canonicalizeUrl, extractJson, loadPastNoteUrls, loadRecentNotes } from "./note-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const NOTES_DIR = path.join(ROOT, "content/notes");
const PROFILE_PATH = path.join(NOTES_DIR, "profile.md");

const MODEL = "claude-sonnet-4-6";
const LOOKBACK_HOURS = 72;
const RECENT_CONTEXT_NOTES = 10;
const MAX_ATTEMPTS = 3;
const MAX_PAUSE_RESUMES = 3;
const MAX_SEARCHES_PER_REQUEST = 8;
// Web-search turns can run for minutes; stream so the connection stays active,
// and cap each request so one stuck call can't eat the job.
const REQUEST_TIMEOUT_MS = 10 * 60 * 1000;
// Stop starting new dates after this, so the workflow still gets to open a PR
// with what's done before the job timeout. Re-run for the remaining dates.
const TIME_BUDGET_MS = Number(process.env.BACKFILL_BUDGET_MINUTES || 100) * 60 * 1000;
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

// Best-effort publish date from the article HTML: OpenGraph/article meta,
// JSON-LD datePublished, or the first <time datetime>.
function extractPublishedDate(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/(article:published_time|og:published_time|pubdate|publish[-_]?date|date\.published|parsely-pub-date|sailthru\.date)/i.test(tag)) continue;
    const content = tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
    if (content && Number.isFinite(Date.parse(content))) return new Date(content);
  }
  const ld = html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1];
  if (ld && Number.isFinite(Date.parse(ld))) return new Date(ld);
  const time = html.match(/<time\b[^>]*datetime\s*=\s*["']([^"']+)["']/i)?.[1];
  if (time && Number.isFinite(Date.parse(time))) return new Date(time);
  return null;
}

async function fetchArticle(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const html = res.ok ? await res.text() : "";
    return { status: res.status, html };
  } catch (err) {
    return { status: 0, html: "", error: err.message };
  }
}

function collectSearchResults(content, into) {
  for (const block of content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const r of block.content) {
      if (r.type === "web_search_result") into.set(canonicalizeUrl(r.url), r);
    }
  }
}

function extractText(content) {
  return content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// Returns { ok: true, publishedAt } or { ok: false, reason } for the model to act on.
async function verifyPick(pick, { searchResults, pastUrls, windowStart, windowEnd }) {
  const canon = canonicalizeUrl(pick.url);
  const result = searchResults.get(canon);
  if (!result) return { ok: false, reason: `"${pick.url}" did not appear in your web search results. Only pick URLs returned by a search.` };
  if (pastUrls.has(canon)) return { ok: false, reason: `"${pick.url}" has already been posted as a note.` };
  if (typeof pick.commentary !== "string" || pick.commentary.trim().length < 10) {
    return { ok: false, reason: "Commentary is missing or too short." };
  }

  const page = await fetchArticle(result.url);
  if (page.status === 0 || page.status === 404 || page.status === 410 || page.status >= 500) {
    return { ok: false, reason: `"${result.url}" did not load (${page.error ?? `HTTP ${page.status}`}). Pick a different article.` };
  }

  // Sites that block bots (401/403/429) give no HTML; fall back to the search index's page age.
  const pageAge = result.page_age && Number.isFinite(Date.parse(result.page_age)) ? new Date(result.page_age) : null;
  const published = extractPublishedDate(page.html) ?? pageAge;
  if (!published) {
    return { ok: false, reason: `Could not verify when "${result.url}" was published. Pick an article with a clear publication date.` };
  }
  if (published < windowStart || published > windowEnd) {
    return {
      ok: false,
      reason: `"${result.url}" was published ${published.toISOString().slice(0, 10)}, outside the ${windowStart.toISOString().slice(0, 10)} – ${windowEnd.toISOString().slice(0, 10)} window.`,
    };
  }
  return { ok: true, url: canonicalizeUrl(result.url), publishedAt: published.toISOString() };
}

function buildSystemPrompt(profile, recentNotes, date, windowStartDay) {
  const recentBlock = recentNotes.length
    ? `Notes posted before ${date} (most recent first):

${recentNotes
  .map((n) => `- [${n.date}] "${n.title}" (${n.source}) — ${n.commentary}`)
  .join("\n")}

Diversity rules:
- Do NOT pick a near-duplicate of any recent note above — same company's same funding round, same regulation's same vote, same product's same launch, same deal seen from a different outlet. A different angle on a still-developing story is OK only if it adds substantively new information.
- Prefer topical variety. If the last few notes leaned heavily into one theme (e.g. AI funding, or EU regulation), tilt this pick toward an under-represented theme from the curator profile (regulation, antitrust/M&A, big tech strategy, CEE ecosystem, operating playbooks, etc.).
- It's better to skip than to repeat. If nothing clears the bar, output {"skip": true, "reason": "..."}.`
    : "No prior notes — first post.";

  return `${profile}

---

${recentBlock}

---

You are backfilling the note for ${date}, a day the daily pipeline missed. Pick ONE article to post as that day's note.

Rules:
- Use web search to find candidates. The article MUST have been published between ${windowStartDay} and ${date} (inclusive). Include dates or month names in your queries so results come from that window, and check publication dates in the results.
- Search broadly across the topics in the curator profile — don't settle on the first result. Prefer the original reporting outlet over aggregators.
- The "url" you return MUST be copied verbatim from your search results. Do not invent or rewrite URLs.
- Write the commentary as if it is ${date}: do not mention or hint at anything that happened after that date, including how the story later played out.
- Commentary: 1–2 sentences, max 50 words, in the voice described above.
- "source" is the publication's name (e.g. "Sifted", "Financial Times").

When done searching, output ONLY a JSON object, no prose around it. Schema:
{"url": "...", "title": "<article headline>", "source": "...", "commentary": "..."}
or {"skip": true, "reason": "<one short sentence>"}.`;
}

async function runTurn(client, system, messages, searchResults) {
  for (let resumes = 0; ; resumes++) {
    const response = await client.messages
      .stream(
        {
          model: MODEL,
          max_tokens: 4000,
          system,
          tools: [{ type: "web_search_20260209", name: "web_search", max_uses: MAX_SEARCHES_PER_REQUEST }],
          messages,
        },
        { timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 },
      )
      .finalMessage();
    const u = response.usage;
    log(
      `  request: stop=${response.stop_reason} in=${u.input_tokens + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)} out=${u.output_tokens} searches=${u.server_tool_use?.web_search_requests ?? 0}`,
    );
    collectSearchResults(response.content, searchResults);
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "pause_turn" || resumes >= MAX_PAUSE_RESUMES) return response;
  }
}

async function backfillDate(client, profile, date) {
  const windowStart = new Date(Date.parse(`${date}T00:00:00Z`) - LOOKBACK_HOURS * 3600 * 1000);
  const windowEnd = new Date(Date.parse(`${date}T23:59:59Z`));
  const windowStartDay = windowStart.toISOString().slice(0, 10);

  const pastUrls = loadPastNoteUrls(NOTES_DIR);
  const recentNotes = loadRecentNotes(NOTES_DIR, RECENT_CONTEXT_NOTES, date);
  const system = buildSystemPrompt(profile, recentNotes, date, windowStartDay);
  const searchResults = new Map();
  const messages = [
    {
      role: "user",
      content: `Note date: ${date}. Find articles published ${windowStartDay} – ${date} and pick one.`,
    },
  ];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await runTurn(client, system, messages, searchResults);
    if (response.stop_reason === "pause_turn") {
      log(`${date}: turn still paused after ${MAX_PAUSE_RESUMES} resumes, giving up on this date.`);
      return null;
    }

    let pick;
    try {
      pick = extractJson(extractText(response.content));
    } catch (err) {
      log(`${date}: could not parse model output (${err.message.slice(0, 200)}).`);
      messages.push({ role: "user", content: "Output ONLY the JSON object described in the instructions." });
      continue;
    }
    if (pick.skip) {
      log(`${date}: Claude chose to skip: ${pick.reason}`);
      return null;
    }

    const check = await verifyPick(pick, { searchResults, pastUrls, windowStart, windowEnd });
    if (check.ok) {
      return {
        date,
        url: check.url,
        title: String(pick.title ?? "").trim() || searchResults.get(check.url)?.title || "(untitled)",
        source: String(pick.source ?? "").trim(),
        commentary: pick.commentary.trim(),
        publishedAt: check.publishedAt,
      };
    }
    log(`${date}: attempt ${attempt} rejected — ${check.reason}`);
    messages.push({
      role: "user",
      content: `${check.reason}\n\nPick a different article (search again if needed) and output ONLY the JSON object as before, or {"skip": true, "reason": "..."}.`,
    });
  }
  log(`${date}: no verifiable pick after ${MAX_ATTEMPTS} attempts, skipping.`);
  return null;
}

async function main() {
  const from = parseDateArg("BACKFILL_FROM");
  const to = parseDateArg("BACKFILL_TO");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log("ANTHROPIC_API_KEY not set — aborting.");
    process.exit(1);
  }

  const dates = publishDates(from, to).filter((d) => !fs.existsSync(path.join(NOTES_DIR, `${d}.json`)));
  log(`${dates.length} Mon/Wed/Fri dates without a note between ${from} and ${to}: ${dates.join(", ")}`);

  const profile = fs.readFileSync(PROFILE_PATH, "utf-8");
  const client = new Anthropic({ apiKey });
  const written = [];
  let failures = 0;

  // Sequential on purpose: each note's diversity context includes the ones
  // backfilled just before it.
  const startedAt = Date.now();
  for (const [i, date] of dates.entries()) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      log(`Time budget reached; not started: ${dates.slice(i).join(", ")}. Re-run for these.`);
      break;
    }
    const dateStartedAt = Date.now();
    try {
      const note = await backfillDate(client, profile, date);
      log(`${date}: took ${Math.round((Date.now() - dateStartedAt) / 1000)}s`);
      if (!note) continue;
      const outPath = path.join(NOTES_DIR, `${date}.json`);
      fs.writeFileSync(outPath, JSON.stringify(note, null, 2) + "\n");
      written.push(note);
      log(`${date}: wrote "${note.title}" (${note.source}, published ${note.publishedAt.slice(0, 10)})`);
    } catch (err) {
      // Auth/billing problems won't fix themselves on the next date.
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError || err instanceof Anthropic.BadRequestError) {
        log(`FATAL on ${date}:`, err.message);
        break;
      }
      failures++;
      log(`${date}: failed — ${err.message}`);
    }
  }

  log(`Done: ${written.length} of ${dates.length} notes written, ${failures} errors.`);

  // Exit explicitly: the Anthropic SDK can leave keep-alive sockets open.
  process.exit(0);
}

main().catch((err) => {
  log("FATAL:", err.message);
  console.error(err);
  process.exit(1);
});
