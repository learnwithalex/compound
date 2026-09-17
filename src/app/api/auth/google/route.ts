import { NextResponse } from "next/server";
import { appUrl } from "@/lib/auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Google auth not configured" }, { status: 503 });

  const state = crypto.randomUUID();
  const secure = process.env.NODE_ENV === "production";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  // Append directly to avoid the cookies().set() + redirect header-drop bug
  res.headers.append(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=lax; Max-Age=600${secure ? "; Secure" : ""}`,
  );
  return res;
}
