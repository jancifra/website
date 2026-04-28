import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Get in touch · Jan Cifra",
  description: "Reach out for partnerships, board mandates, investments, or founder advice.",
};

export default function ContactPage() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      <Nav />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <Link href="/" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            ← Back
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mt-6 mb-3">Get in touch</h1>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Founders, boards, investors, and partners — drop me a few lines about what you&apos;re working on and what you&apos;re hoping to discuss. I read every message and reply personally.
          </p>
        </div>

        <ContactForm siteKey={siteKey} />

        <div className="mt-12 flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
          <span className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">or</span>
          <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            Prefer LinkedIn? Send a connection request and a short note.
          </p>
          <a
            href="https://www.linkedin.com/in/jancifra"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Connect on LinkedIn →
          </a>
        </div>
      </main>
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Jan Cifra
        </div>
      </footer>
    </div>
  );
}
