// Magic-link auth. Request a link → Orizon's transactional email API delivers
// it → clicking it consumes the token and creates a session. No passwords in v1.
//
// Dev mode: outside production, requestLink() returns the URL directly so
// login works end-to-end locally without a mail provider. That path must
// never be reachable in production — returning the link to the caller means
// anyone can sign in as anyone. It is gated on NODE_ENV, not on the absence
// of an API key: keying it off missing config fails OPEN, so a blank key
// in production silently turns the whole login into a bypass.

import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db, loginTokens, users } from "@/db";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Distinguishes "the caller typed a bad address" from "this server is
// misconfigured", so the route can answer 400 vs 500 instead of blaming the
// user for our own missing config.
export class InvalidEmailError extends Error {}

export function appUrl() {
  // An unset APP_URL and an empty one must behave the same: `??` alone would
  // let "" through and email a host-less relative link that no client resolves.
  const configured = process.env.APP_URL?.trim();
  return (configured || "http://localhost:3000").replace(/\/$/, "");
}

// Orizon's transactional email API is Resend-shaped, so this is a plain POST
// rather than an SDK. The `from` domain must be verified for THIS team —
// the platform's own send.orizon.ng is not, and reusing it returns 403
// domain_not_verified. Surface the provider's error body: a silent failure
// here looks exactly like a user who never got the email.
async function sendLoginEmail(apiKey: string, to: string, url: string) {
  const base = process.env.ORIZON_EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  const res = await fetch(`${base}/v1/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Booked <noreply@send.orizon.ng>",
      to,
      subject: "Your Booked login link",
      html: `<p>Click to sign in to Booked. This link expires in 15 minutes.</p><p><a href="${url}">Sign in to Booked</a></p>`,
    }),
  });
  if (!res.ok) {
    throw new Error(`email send failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
}

export async function requestLink(email: string): Promise<{ devUrl: string | null }> {
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) throw new InvalidEmailError("invalid email");

  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, clean),
  });
  const user =
    existing ?? (await db.insert(users).values({ email: clean }).returning()).at(0)!;

  const token = `ml_${randomBytes(32).toString("base64url")}`;
  await db.insert(loginTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const url = `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;

  const apiKey = process.env.ORIZON_EMAIL_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("email is not configured: ORIZON_EMAIL_API_KEY is required in production");
    }
    return { devUrl: url };
  }

  await sendLoginEmail(apiKey, clean, url);
  return { devUrl: null };
}

export async function verifyToken(token: string) {
  const row = await db.query.loginTokens.findFirst({
    where: (t, { eq }) => eq(t.token, token),
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  if (row.token.startsWith("sess_")) return null; // sessions aren't login links
  await db.update(loginTokens).set({ usedAt: new Date() }).where(eq(loginTokens.id, row.id));
  return row;
}
