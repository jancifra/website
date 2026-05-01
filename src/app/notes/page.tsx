import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getAllNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Daily links and short commentary on tech, AI, regulation, VC, and the businesses Jan Cifra finds interesting.",
  alternates: {
    canonical: "/notes",
    types: {
      "application/rss+xml": [{ url: "/notes/rss.xml", title: "Jan Cifra · Notes" }],
    },
  },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function NotesPage() {
  const notes = getAllNotes();

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <Link href="/" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2">Notes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            One link a day. Tech, AI, regulation, VC, and the moves of the companies that matter.
          </p>
          <a
            href="/notes/rss.xml"
            className="inline-block mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            RSS →
          </a>
        </div>

        {notes.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">Nothing yet — first note coming soon.</p>
        ) : (
          <div className="space-y-10">
            {notes.map((n) => (
              <article key={n.date} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-32 shrink-0 text-sm text-zinc-400 dark:text-zinc-500 pt-0.5">
                  {formatDate(n.date)}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline underline-offset-4 break-words"
                  >
                    {n.title}
                  </a>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    {n.source} · {hostname(n.url)}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{n.commentary}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Jan Cifra
        </div>
      </footer>
    </div>
  );
}
