#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const NOTES_DIR = path.join(ROOT, "content/notes");
const SOURCES_PATH = path.join(NOTES_DIR, "sources.json");
const PROFILE_PATH = path.join(NOTES_DIR, "profile.md");

const LOOKBACK_HOURS = 48;
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

function extractTechmemeSourceUrl(item) {
  // Techmeme RSS <link> goes to a discussion page; the source URL is the first
  // non-techmeme href in the (uppercase) HTML content.
  const html = String(item.content ?? "");
  const matches = [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)];
  for (const m of matches) {
    const u = m[1];
    if (!/techmeme\.com/i.test(u)) return u;
  }
  return null;
}

async function fetchFeed(parser, feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    return (parsed.items ?? []).map((item) => {
      let url = item.link;
      if (feed.name === "Techmeme") {
        const sourceUrl = extractTechmemeSourceUrl(item);
        if (sourceUrl) url = sourceUrl;
      }
      return {
        url,
        title: (item.title ?? "").trim() || "(untitled)",
        source: feed.name,
        publishedAt: item.isoDate ?? item.pubDate ?? null,
        summary: ((item.contentSnippet ?? item.content ?? "") + "").replace(/\s+/g, " ").trim().slice(0, 400),
      };
    });
  } catch (err) {
    log(`feed failed: ${feed.name} (${feed.url}) — ${err.message}`);
    return [];
  }
}

function loadPastNoteUrls() {
  if (!fs.existsSync(NOTES_DIR)) return new Set();
  const set = new Set();
  for (const f of fs.readdirSync(NOTES_DIR)) {
    if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(f)) continue;
    try {
      const note = JSON.parse(fs.readFileSync(path.join(NOTES_DIR, f), "utf-8"));
      if (note.url) set.add(note.url);
    } catch {}
  }
  return set;
}

function loadRecentNotes(limit) {
  if (!fs.existsSync(NOTES_DIR)) return [];
  const files = fs
    .readdirSync(NOTES_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .slice(0, limit);
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(NOTES_DIR, f), "utf-8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function extractJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON object found in model response: " + text);
  return JSON.parse(m[0]);
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

  const pastUrls = loadPastNoteUrls();
  const recentNotes = loadRecentNotes(RECENT_CONTEXT_NOTES);
  log(`${pastUrls.size} past notes loaded for dedupe; ${recentNotes.length} recent notes for diversity context.`);

  const parser = new Parser({ timeout: 15000 });
  const cutoff = Date.now() - LOOKBACK_HOURS * 3600 * 1000;

  const allItems = (await Promise.all(sources.feeds.map((f) => fetchFeed(parser, f)))).flat();

  const fresh = allItems
    .filter((it) => it.url)
    .filter((it) => !pastUrls.has(it.url))
    .filter((it) => {
      if (!it.publishedAt) return true;
      const t = new Date(it.publishedAt).getTime();
      return Number.isFinite(t) ? t >= cutoff : true;
    });

  log(`${allItems.length} total items fetched, ${fresh.length} fresh after dedupe + recency.`);

  const bySource = new Map();
  for (const it of fresh) {
    const arr = bySource.get(it.source) ?? [];
    if (arr.length < MAX_PER_FEED) {
      arr.push(it);
      bySource.set(it.source, arr);
    }
  }
  let shortlist = [...bySource.values()].flat();
  shortlist.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });
  shortlist = shortlist.slice(0, SHORTLIST_SIZE);

  if (shortlist.length === 0) {
    log("No fresh candidates — nothing to pick.");
    process.exit(0);
  }

  log(`Sending ${shortlist.length} candidates to Claude (${MODEL})…`);

  const recentBlock = recentNotes.length
    ? `Recently posted notes (most recent first):

${recentNotes
  .map((n) => `- [${n.date}] "${n.title}" (${n.source}) — ${n.commentary}`)
  .join("\n")}

Diversity rules:
- Do NOT pick a near-duplicate of any recent note above — same company's same funding round, same regulation's same vote, same product's same launch, same deal seen from a different outlet. A different angle on a still-developing story is OK only if it adds substantively new information.
- Prefer topical variety. If the last few notes leaned heavily into one theme (e.g. AI funding, or EU regulation), tilt today's pick toward an under-represented theme from the curator profile (regulation, antitrust/M&A, big tech strategy, CEE ecosystem, operating playbooks, etc.).
- It's better to skip than to repeat. If the only "good" candidate is a follow-up to yesterday's story and nothing else clears the bar, output {"skip": true, "reason": "..."}.`
    : "No prior notes — first post.";

  const systemPrompt = `${profile}

---

${recentBlock}

---

You are picking ONE article from the candidate list below for today's note.

Rules:
- The "url" you return MUST be one of the candidate URLs verbatim. Do not invent or rewrite URLs.
- Commentary: 1–2 sentences, max 50 words, in the voice described above.
- If nothing in the list is genuinely interesting per the topic and quality bar, OR everything is a near-duplicate of recent notes, output {"skip": true, "reason": "<one short sentence>"}.

Output ONLY a JSON object, no prose around it. Schema:
{"url": "...", "title": "...", "source": "...", "commentary": "..."}`;

  const candidatePayload = JSON.stringify(
    shortlist.map((c) => ({
      url: c.url,
      title: c.title,
      source: c.source,
      summary: c.summary,
    })),
    null,
    2,
  );

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Today's date: ${date}.\n\nCandidates:\n${candidatePayload}`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const parsed = extractJson(text);

  if (parsed.skip) {
    log("Claude chose to skip:", parsed.reason);
    process.exit(0);
  }

  const matched = shortlist.find((c) => c.url === parsed.url);
  if (!matched) {
    throw new Error(`Returned URL not in candidate list: ${parsed.url}`);
  }
  if (typeof parsed.commentary !== "string" || parsed.commentary.trim().length < 10) {
    throw new Error("Missing or too-short commentary");
  }

  const note = {
    date,
    url: matched.url,
    title: matched.title,
    source: matched.source,
    commentary: parsed.commentary.trim(),
    publishedAt: matched.publishedAt ?? null,
  };

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
}

main().catch((err) => {
  log("FATAL:", err.message);
  console.error(err);
  process.exit(1);
});
