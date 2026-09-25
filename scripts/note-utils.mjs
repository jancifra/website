import fs from "node:fs";
import path from "node:path";

const NOTE_FILE_RE = /^\d{4}-\d{2}-\d{2}\.json$/;

// Tracking params we strip so the LLM doesn't have a reason to "clean up" the
// URL we hand it (and so different feed surfacings of the same article dedupe).
const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^mc_/i,
  /^_ga$/i,
  /^_gl$/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^dclid$/i,
  /^yclid$/i,
  /^igshid$/i,
  /^vero_/i,
  /^ref$/i,
  /^ref_src$/i,
  /^ref_url$/i,
];

export function canonicalizeUrl(raw) {
  if (!raw) return raw;
  try {
    const u = new URL(raw);
    const keep = [];
    for (const [k, v] of u.searchParams.entries()) {
      if (TRACKING_PARAM_PATTERNS.some((p) => p.test(k))) continue;
      keep.push([k, v]);
    }
    u.search = "";
    for (const [k, v] of keep) u.searchParams.append(k, v);
    u.hash = "";
    return u.toString();
  } catch {
    return raw;
  }
}

export function loadPastNoteUrls(notesDir) {
  if (!fs.existsSync(notesDir)) return new Set();
  const set = new Set();
  for (const f of fs.readdirSync(notesDir)) {
    if (!NOTE_FILE_RE.test(f)) continue;
    try {
      const note = JSON.parse(fs.readFileSync(path.join(notesDir, f), "utf-8"));
      if (note.url) set.add(canonicalizeUrl(note.url));
    } catch {}
  }
  return set;
}

// Most recent notes first. With `beforeDate`, only notes dated strictly before
// it (so a backfilled note only sees what existed "at the time").
export function loadRecentNotes(notesDir, limit, beforeDate = null) {
  if (!fs.existsSync(notesDir)) return [];
  const files = fs
    .readdirSync(notesDir)
    .filter((f) => NOTE_FILE_RE.test(f))
    .filter((f) => !beforeDate || f.slice(0, 10) < beforeDate)
    .sort()
    .reverse()
    .slice(0, limit);
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(notesDir, f), "utf-8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function extractJson(text) {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in model response: " + text);

  // Fast path: a complete, well-formed object (greedy to the last brace).
  const greedy = text.slice(start).match(/\{[\s\S]*\}/);
  if (greedy) {
    try {
      return JSON.parse(greedy[0]);
    } catch {
      // fall through to truncation repair
    }
  }

  // The model sometimes emits a long reasoning preamble and the JSON gets cut
  // off mid-string by max_tokens. Repair a truncated trailing object by closing
  // an open string and any unclosed braces, so a mostly-complete pick (commentary
  // is the last field) still yields a usable note instead of a hard failure.
  let inString = false;
  let escaped = false;
  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }

  let candidate = end === -1 ? text.slice(start) : text.slice(start, end + 1);
  if (end === -1) {
    if (inString) candidate += '"';
    candidate += "}".repeat(Math.max(depth, 1));
  }
  return JSON.parse(candidate);
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

// `url` defaults to the feed's own URL; the backfill passes day-archive URLs.
// Throws on fetch/parse failure so callers can decide how loud to be.
export async function fetchFeedItems(parser, feed, url = feed.url) {
  const parsed = await parser.parseURL(url);
  return (parsed.items ?? []).map((item) => {
    let link = item.link;
    if (feed.name === "Techmeme") {
      const sourceUrl = extractTechmemeSourceUrl(item);
      if (sourceUrl) link = sourceUrl;
    }
    return {
      url: canonicalizeUrl(link),
      title: (item.title ?? "").trim() || "(untitled)",
      source: feed.name,
      publishedAt: item.isoDate ?? item.pubDate ?? null,
      summary: ((item.contentSnippet ?? item.content ?? "") + "").replace(/\s+/g, " ").trim().slice(0, 400),
    };
  });
}

// Dedupes against past notes and by URL, keeps items published in
// [windowStart, windowEnd] (either bound optional), caps each source, and returns
// the most recent `size`. Undated items pass unless `requireDate`.
export function buildShortlist(items, { pastUrls, windowStart = null, windowEnd = null, requireDate = false, maxPerFeed, size }) {
  const seen = new Set();
  const fresh = items
    .filter((it) => it.url)
    .filter((it) => !pastUrls.has(it.url))
    .filter((it) => (seen.has(it.url) ? false : seen.add(it.url)))
    .filter((it) => {
      const t = it.publishedAt ? new Date(it.publishedAt).getTime() : NaN;
      if (!Number.isFinite(t)) return !requireDate;
      return (!windowStart || t >= windowStart) && (!windowEnd || t <= windowEnd);
    });

  const bySource = new Map();
  for (const it of fresh) {
    const arr = bySource.get(it.source) ?? [];
    if (arr.length < maxPerFeed) {
      arr.push(it);
      bySource.set(it.source, arr);
    }
  }
  const shortlist = [...bySource.values()].flat();
  shortlist.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });
  return { fresh, shortlist: shortlist.slice(0, size) };
}

// Asks Claude to pick one candidate for `date`. Returns the note object, or
// null when Claude skips or can't return a URL from the list. `extraRules`
// are appended to the rule list (the backfill uses it to forbid hindsight).
export async function pickNote({ client, model, profile, recentNotes, shortlist, date, log, extraRules = [] }) {
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
${extraRules.map((r) => `- ${r}\n`).join("")}
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

  function findMatch(url) {
    if (!url) return null;
    const canon = canonicalizeUrl(url);
    return (
      shortlist.find((c) => c.url === url) ??
      shortlist.find((c) => canonicalizeUrl(c.url) === canon) ??
      null
    );
  }

  function extractText(resp) {
    return resp.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  const initialUserMessage = {
    role: "user",
    content: `Today's date: ${date}.\n\nCandidates:\n${candidatePayload}`,
  };

  let response = await client.messages.create({
    model,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [initialUserMessage],
  });

  let parsed = extractJson(extractText(response));

  if (parsed.skip) {
    log("Claude chose to skip:", parsed.reason);
    return null;
  }

  let matched = findMatch(parsed.url);

  if (!matched) {
    log(`Returned URL not in candidate list: ${parsed.url}. Retrying with explicit URL list.`);
    const validUrls = shortlist.map((c) => `- ${c.url}`).join("\n");
    response = await client.messages.create({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        initialUserMessage,
        { role: "assistant", content: extractText(response) },
        {
          role: "user",
          content: `The URL "${parsed.url}" is NOT in the candidate list. Do not invent or guess URLs from headlines. Pick a different article whose URL appears verbatim in this list:\n\n${validUrls}\n\nOutput ONLY the JSON object as before, with a url copied verbatim from the list above (or {"skip": true, "reason": "..."}).`,
        },
      ],
    });
    parsed = extractJson(extractText(response));
    if (parsed.skip) {
      log("Claude chose to skip on retry:", parsed.reason);
      return null;
    }
    matched = findMatch(parsed.url);
  }

  if (!matched) {
    log(`Retry also returned a URL not in candidate list: ${parsed.url}. Skipping rather than failing.`);
    return null;
  }

  if (typeof parsed.commentary !== "string" || parsed.commentary.trim().length < 10) {
    throw new Error("Missing or too-short commentary");
  }

  return {
    date,
    url: matched.url,
    title: matched.title,
    source: matched.source,
    commentary: parsed.commentary.trim(),
    publishedAt: matched.publishedAt ?? null,
  };
}
