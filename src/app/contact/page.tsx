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
      </main>
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-zinc-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Jan Cifra
        </div>
      </footer>
    </div>
  );
}
