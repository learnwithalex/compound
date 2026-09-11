// Session + request auth. Cookie holds an opaque token; server maps it to
// a user. Tokens never leave the server except inside the HttpOnly cookie.

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db, loginTokens } from "@/db";

const COOKIE = "booked_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Server-side session store. v1 keeps it in memory per instance + persists
// nothing: the LoginToken row IS the session (single-use upgrade to a
// long-lived token row). Table reuse avoids a second token table.
export async function createSessionToken(userId: string): Promise<string> {
  const token = `sess_${randomBytes(32).toString("base64url")}`;
  await db.insert(loginTokens).values({
    userId,
    token,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export async function userIdFromSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = await db.query.loginTokens.findFirst({
    where: (t, { eq }) => eq(t.token, token),
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  return row.userId;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export { COOKIE };
