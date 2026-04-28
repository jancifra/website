"use server";

import { Resend } from "resend";

export type ContactState = {
  ok: boolean;
  error?: string;
};

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get("website")) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const token = String(formData.get("cf-turnstile-response") ?? "");

  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "Please enter your name (2–100 characters)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (company.length > 200) {
    return { ok: false, error: "Company name is too long." };
  }
  if (topic.length > 100) {
    return { ok: false, error: "Topic is too long." };
  }
  if (message.length < 20 || message.length > 5000) {
    return { ok: false, error: "Message must be between 20 and 5000 characters." };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return { ok: false, error: "Server is not configured. Please email contact@cifra.co directly." };
  }
  if (!token) {
    return { ok: false, error: "Please complete the verification challenge." };
  }

  try {
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const verifyData = (await verifyRes.json()) as { success: boolean };
    if (!verifyData.success) {
      return { ok: false, error: "Verification failed. Please try again." };
    }
  } catch (err) {
    console.error("Turnstile verify failed:", err);
    return { ok: false, error: "Verification service unavailable. Please try again shortly." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? "contact@cifra.co";
  const from = process.env.CONTACT_FROM_EMAIL ?? "noreply@cifra.co";
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return { ok: false, error: "Server is not configured. Please email contact@cifra.co directly." };
  }

  const resend = new Resend(apiKey);
  const subjectPrefix = topic ? `[${topic}] ` : "";

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `${subjectPrefix}New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "—"}`,
        `Topic: ${topic || "—"}`,
        "",
        message,
      ].join("\n"),
    });
    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: "Failed to send. Please try again or email contact@cifra.co directly." };
    }
  } catch (err) {
    console.error("Resend exception:", err);
    return { ok: false, error: "Failed to send. Please try again or email contact@cifra.co directly." };
  }

  return { ok: true };
}
