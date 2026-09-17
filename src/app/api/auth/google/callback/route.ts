import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { appUrl, createSessionToken, sessionHtmlRedirect } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const base = appUrl();
  const jar = await cookies();
  const { searchParams } = new URL(req.url);

  const state = searchParams.get("state");
  const storedState = jar.get("oauth_state")?.value;
  jar.delete("oauth_state");
  if (!state || state !== storedState) {
    // If the user already has a valid session (e.g. Back-button replay of the
    // callback after a successful login), send them to the app instead of an error.
    const sessionToken = jar.get("session")?.value;
    if (sessionToken) {
      const existing = await db.query.sessions.findFirst({
        where: (s, { eq, gt, and }) => and(eq(s.token, sessionToken), gt(s.expiresAt, new Date())),
      });
      if (existing) return NextResponse.redirect(`${base}/app`);
    }
    return NextResponse.redirect(`${base}/login?error=oauth_state`);
  }

  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${base}/login?error=oauth_denied`);

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${base}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return NextResponse.redirect(`${base}/login?error=oauth_token`);
  const { access_token } = await tokenRes.json();

  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!infoRes.ok) return NextResponse.redirect(`${base}/login?error=oauth_userinfo`);
  const { email } = await infoRes.json();
  if (!email) return NextResponse.redirect(`${base}/login?error=oauth_email`);

  const clean = email.trim().toLowerCase();
  let user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, clean) });
  if (!user) {
    const [created] = await db.insert(users).values({ email: clean }).returning();
    user = created;
  }

  const session = await createSessionToken(user.id);
  return sessionHtmlRedirect(session, `${base}/app`);
}
