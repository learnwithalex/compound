import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { appUrl } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  const token = jar.get("session")?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  const secure = process.env.NODE_ENV === "production";
  const loginUrl = `${appUrl()}/login`;

  // 200 HTML + meta-refresh so Caddy doesn't strip the Set-Cookie deletion header
  const html = `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${loginUrl}"></head><body></body></html>`;
  const res = new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  // Expire the session cookie
  res.headers.append(
    "Set-Cookie",
    `session=; Path=/; HttpOnly; SameSite=lax; Max-Age=0${secure ? "; Secure" : ""}`,
  );
  return res;
}
