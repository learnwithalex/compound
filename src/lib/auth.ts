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
              <svg width="28" height="24" viewBox="0 0 48 41" xmlns="http://www.w3.org/2000/svg">
                <path d="M39.8278 33.3026L39.8308 33.3061L33.3607 38.9831C32.0341 40.1758 30.3188 40.8515 28.5307 40.8849L28.5157 40.8852H6.3433C5.52252 40.9197 4.70461 40.766 3.9529 40.4361C3.18789 40.1004 2.51205 39.5912 1.97981 38.9489C1.44755 38.3069 1.07385 37.55 0.888129 36.7388C0.705857 35.9416 0.709812 35.1125 0.900558 34.3168L2.60764 25.6248C2.75949 24.8681 3.16084 24.1833 3.74828 23.6792L3.83198 23.6074C3.65027 23.3331 3.51734 23.0292 3.43941 22.709C3.33602 22.2843 3.3324 21.8424 3.42763 21.4174L5.13811 12.7091L5.14074 12.6968C5.47362 11.1342 6.31209 9.72339 7.52782 8.68041L13.4516 3.48275C13.7257 3.16967 14.0266 2.87803 14.3521 2.61141C15.6488 1.54924 17.2624 0.944386 18.9409 0.890845L18.9688 0.889954L41.1681 0.953502C41.988 0.919415 42.8049 1.07313 43.5558 1.40267C44.3209 1.73844 44.9967 2.24759 45.5289 2.88973C46.0611 3.53177 46.4349 4.28874 46.6206 5.10019C46.8031 5.89771 46.7988 6.72616 46.6084 7.52144L42.3681 29.1669L42.362 29.1933C41.9896 30.8017 41.0994 32.2445 39.8278 33.3026Z" fill="#03301D"/>
                <path d="M40.8216 2.95355C41.4048 2.92412 41.9868 3.03161 42.5211 3.26725C43.0554 3.50288 43.5272 3.86014 43.8988 4.31063C44.2703 4.76113 44.5313 5.29225 44.661 5.86162C44.7906 6.43099 44.7853 7.02284 44.6454 7.58977L40.4233 29.2491C40.1268 30.536 39.4127 31.6886 38.3925 32.5273C37.3723 33.3659 36.1032 33.8434 34.7832 33.8853H12.6929C12.1096 33.9143 11.5275 33.8068 10.993 33.5712C10.4585 33.3356 9.98642 32.9785 9.61431 32.5282C9.24221 32.078 8.98033 31.5471 8.84959 30.9778C8.71885 30.4086 8.72283 29.8165 8.86121 29.2491L10.566 20.4866C10.6659 20.0589 10.9045 19.6763 11.2445 19.3983C11.5845 19.1202 12.0069 18.9623 12.446 18.9492C16.4769 19.0926 20.3485 19.3952 23.9572 20.6937L24.7538 25.7043C24.7733 25.8253 24.8371 25.9346 24.9328 26.0112C25.0285 26.0877 25.1492 26.126 25.2716 26.1185C25.4122 26.1161 25.5496 26.0765 25.6699 26.0038C25.7902 25.931 25.8892 25.8277 25.9567 25.7043L28.6811 20.6937L34.13 18.9731C34.2618 18.9309 34.3804 18.8551 34.474 18.7532C34.5676 18.6512 34.633 18.5266 34.6637 18.3916C34.6949 18.2723 34.6802 18.1456 34.6228 18.0365C34.5653 17.9274 34.4691 17.8439 34.353 17.8021L29.5733 16.0894L28.7767 11.079C28.7573 10.9573 28.6938 10.847 28.5983 10.7691C28.5028 10.6913 28.382 10.6513 28.2589 10.6567C28.1175 10.66 27.9795 10.7008 27.8591 10.775C27.7387 10.8492 27.6402 10.9541 27.5738 11.079L24.8494 16.0894C20.8987 17.2226 16.8109 17.8071 12.7009 17.8261C12.5036 17.8429 12.3052 17.8124 12.1219 17.7376C11.9386 17.6627 11.7757 17.5456 11.6466 17.3955C11.5175 17.2454 11.4259 17.0667 11.3793 16.8743C11.3327 16.6819 11.3324 16.481 11.3785 16.2885L13.0833 7.52598C13.3782 6.23972 14.0907 5.0873 15.1096 4.2486C16.1285 3.40989 17.3964 2.93224 18.7154 2.88995L40.8216 2.95355Z" fill="#AF02ED"/>
              </svg>
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

  const apiKey = process.env.ORIZON_EMAIL_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") throw new Error("ORIZON_EMAIL_API_KEY required");
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
