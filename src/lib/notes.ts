import fs from "fs";
import path from "path";

const notesDir = path.join(process.cwd(), "content/notes");

export type Note = {
  date: string;
  url: string;
  title: string;
  source: string;
  commentary: string;
  publishedAt?: string | null;
};

export function getAllNotes(): Note[] {
  if (!fs.existsSync(notesDir)) return [];
  const files = fs.readdirSync(notesDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(notesDir, f), "utf-8")) as Note;
      } catch {
        return null;
      }
    })
    .filter((n): n is Note => n !== null && typeof n.url === "string" && typeof n.commentary === "string")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getLatestNotes(limit: number): Note[] {
  return getAllNotes().slice(0, limit);
}
