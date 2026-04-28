"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef } from "react";
import { submitContact, type ContactState } from "./actions";

declare global {
  interface Window {
    turnstile?: {
      reset: (widget?: string | HTMLElement) => void;
    };
  }
}

const initialState: ContactState = { ok: false };

const topics = [
  "Partnership / collaboration",
  "Investment opportunity",
  "Board / advisory mandate",
  "Founder advice",
  "Speaking / press",
  "Other",
];

export default function ContactForm({ siteKey }: { siteKey: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error && widgetRef.current) {
      window.turnstile?.reset(widgetRef.current);
    }
  }, [state]);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-8 text-center">
        <h2 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Message sent</h2>
        <p className="text-emerald-800 dark:text-emerald-200">
          Thanks for reaching out. I&apos;ll get back to you personally — usually within a few days.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form action={formAction} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Name" name="name" required maxLength={100} autoComplete="name" />
          <Field label="Email" name="email" type="email" required maxLength={200} autoComplete="email" />
        </div>
        <Field label="Company / organization" name="company" maxLength={200} autoComplete="organization" optional />
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1.5">
            What&apos;s this about? <span className="text-zinc-400 dark:text-zinc-500 font-normal">(optional)</span>
          </label>
          <select
            id="topic"
            name="topic"
            defaultValue=""
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">Choose a topic…</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={20}
            maxLength={5000}
            rows={7}
            placeholder="A few lines about what you're working on and what you're hoping to discuss."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-y"
          />
        </div>

        {/* Honeypot — hidden from humans, attractive to dumb bots */}
        <div aria-hidden="true" className="hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div ref={widgetRef} className="cf-turnstile" data-sitekey={siteKey} />

        {state.error && (
          <div role="alert" className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {state.error}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Sending…" : "Send message"}
          </button>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Protected by Cloudflare Turnstile.
          </p>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  optional = false,
  maxLength,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1.5">
        {label}
        {optional && <span className="text-zinc-400 dark:text-zinc-500 font-normal"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
      />
    </div>
  );
}
