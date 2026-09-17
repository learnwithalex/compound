import { db } from "@/db";
import { users, sessions, magicLinks, apiTokens } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { createHash } from "crypto";

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newApiToken(): { token: string; prefix: string } {
  const token = "cmp_" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return { token, prefix: token.slice(0, 10) };
}

// Resolve a Bearer token (Authorization: Bearer cmp_...) to a user id.
// Returns null for missing, unknown, or revoked tokens.
export async function userIdFromApiToken(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token.startsWith("cmp_")) return null;
  const row = await db.query.apiTokens.findFirst({
    where: (t, { eq, and, isNull }) => and(eq(t.tokenHash, hashApiToken(token)), isNull(t.revokedAt)),
  });
  if (!row) return null;
  await db.update(apiTokens).set({ lastUsedAt: new Date() }).where(eq(apiTokens.id, row.id));
  return row.userId;
}

// Either session cookie (browser) or Bearer token (agent). Browser first.
export async function userIdFromSessionOrToken(req?: Request): Promise<string | null> {
  const fromSession = await userIdFromSession();
  if (fromSession) return fromSession;
  if (req) return userIdFromApiToken(req);
  return null;
}

export function appUrl() {
  const configured = process.env.APP_URL?.trim();
  return (configured || "http://localhost:3000").replace(/\/$/, "");
}

export async function userIdFromSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get("session")?.value;
  if (!token) return null;
  const row = await db.query.sessions.findFirst({
    where: (s, { eq, gt, and }) => and(eq(s.token, token), gt(s.expiresAt, new Date())),
  });
  return row?.userId ?? null;
}

export async function createSessionToken(userId: string): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({ token, userId, expiresAt });
  return token;
}

const SESSION_COOKIE = {
  name: "session",
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE.name, token, {
    ...SESSION_COOKIE,
    secure: process.env.NODE_ENV === "production",
  });
}

export function applySessionCookie(response: Response, token: string): Response {
  const secure = process.env.NODE_ENV === "production";
  const attrs = [
    `${SESSION_COOKIE.name}=${token}`,
    `Path=${SESSION_COOKIE.path}`,
    `Max-Age=${SESSION_COOKIE.maxAge}`,
    `SameSite=${SESSION_COOKIE.sameSite}`,
    "HttpOnly",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
  response.headers.append("Set-Cookie", attrs);
  return response;
}

export async function requestLink(email: string): Promise<{ devUrl: string | null }> {
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) throw new Error("invalid email");

  let user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, clean) });
  if (!user) {
    const [created] = await db.insert(users).values({ email: clean }).returning();
    user = created;
  }

  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
  await db.insert(magicLinks).values({ token, email: clean, expiresAt });

  const url = `${appUrl()}/api/auth/verify?token=${token}`;

  const apiKey = process.env.ORIZON_EMAIL_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new Error("ORIZON_EMAIL_API_KEY required");
    return { devUrl: url };
  }

  const base = process.env.ORIZON_EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  const res = await fetch(`${base}/v1/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Compound <noreply@send.orizon.ng>",
      to: clean,
      subject: "Your Compound login link",
      html: `<p>Sign in to Compound — link expires in 15 minutes.</p><p><a href="${url}">${url}</a></p>`,
    }),
  });
  if (!res.ok) throw new Error(`email failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return { devUrl: null };
}

export async function verifyToken(token: string): Promise<string | null> {
  const link = await db.query.magicLinks.findFirst({
    where: (m, { eq, and, isNull, gt }) =>
      and(eq(m.token, token), isNull(m.usedAt), gt(m.expiresAt, new Date())),
  });
  if (!link) return null;
  await db.update(magicLinks).set({ usedAt: new Date() }).where(eq(magicLinks.token, token));
  let user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, link.email) });
  if (!user) {
    const [created] = await db.insert(users).values({ email: link.email }).returning();
    user = created;
  }
  return user.id;
}
