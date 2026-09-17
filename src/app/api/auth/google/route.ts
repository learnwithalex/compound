import { appUrl } from "@/lib/auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return Response.json({ error: "Google auth not configured" }, { status: 503 });

  const state = crypto.randomUUID();
  const secure = process.env.NODE_ENV === "production";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  // Use location.replace() so /api/auth/google is not added to browser history.
  const html = `<!doctype html><html><head><script>window.location.replace(${JSON.stringify(googleUrl)})</script></head><body></body></html>`;
  const res = new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  res.headers.append(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=lax; Max-Age=600${secure ? "; Secure" : ""}`,
  );
  console.log("[oauth-init] state:", state, "set-cookie header:", res.headers.get("set-cookie"));
  return res;
}
