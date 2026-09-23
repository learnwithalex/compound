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
  console.log("[session] token from cookie:", token ? token.slice(0, 8) + "…" : "NONE");
  if (!token) return null;
  const row = await db.query.sessions.findFirst({
    where: (s, { eq, gt, and }) => and(eq(s.token, token), gt(s.expiresAt, new Date())),
  });
  console.log("[session] db lookup:", row ? "FOUND userId=" + row.userId : "NOT FOUND");
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

// Use a 200 HTML response + location.replace() instead of a 302 redirect.
// Caddy strips Set-Cookie from 302 responses. location.replace() also removes
// the callback URL from browser history, preventing a Back-button re-request
// that would fail (oauth_state cookie already deleted after first callback).
export function sessionHtmlRedirect(token: string, destination: string): Response {
  const safe = JSON.stringify(destination);
  const html = `<!doctype html><html><head><script>window.location.replace(${safe})</script></head><body></body></html>`;
  return applySessionCookie(
    new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, private" } }),
    token
  );
}

function magicLinkEmail(url: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sign in to Compound</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
              <img src="${appUrl()}/logo-mark.png" width="28" height="24" alt="Compound" style="display:block;"/>
            </td>
            <td style="vertical-align:middle;padding-left:10px;">
              <span style="font-size:15px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">compound</span><span style="color:#ff5c00;font-size:15px;font-weight:700;">.</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border:1px solid #e8e5e0;border-radius:8px;padding:36px 40px;">

          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.025em;line-height:1.2;">
            Your sign-in link
          </h1>
          <p style="margin:0 0 28px;font-size:14px;color:#6b6b6b;line-height:1.6;">
            Click the button below to sign in to Compound as <strong style="color:#1a1a1a;">${email}</strong>. This link expires in 15 minutes and can only be used once.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#03301D;border-radius:6px;">
              <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                Sign in to Compound →
              </a>
            </td></tr>
          </table>

          <!-- Divider -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="border-top:1px solid #f0ede8;"></td>
            </tr>
          </table>

          <p style="margin:0 0 6px;font-size:12px;color:#9a9a9a;line-height:1.5;">
            Button not working? Paste this link into your browser:
          </p>
          <p style="margin:0;font-size:11px;color:#5e6ad2;word-break:break-all;line-height:1.5;">
            ${url}
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:#b0aba3;line-height:1.5;">
            If you didn't request this link, you can safely ignore this email.
          </p>
          <p style="margin:0;font-size:11px;color:#b0aba3;">
            © ${new Date().getFullYear()} Compound · <a href="https://usecompound.xyz" style="color:#b0aba3;text-decoration:underline;">usecompound.xyz</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

  const apiKey = process.env.EMAIL_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new Error("EMAIL_API_KEY required");
    return { devUrl: url };
  }

  const res = await fetch("https://api.orizon.ng/v1/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Compound <compound@send.orizon.ng>",
      to: [clean],
      reply_to: ["hello@usecompound.xyz"],
      subject: "Your sign-in link for Compound",
      html: magicLinkEmail(url, clean),
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
