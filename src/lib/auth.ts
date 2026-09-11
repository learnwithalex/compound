import { db } from "@/db";
import { users, sessions, magicLinks } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

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

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
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
