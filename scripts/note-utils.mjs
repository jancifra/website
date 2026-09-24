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
