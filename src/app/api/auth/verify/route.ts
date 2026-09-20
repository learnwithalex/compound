import { NextResponse } from "next/server";
import { verifyToken, appUrl, createSessionToken, sessionHtmlRedirect } from "@/lib/auth";
import { track } from "@/lib/track";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const base = appUrl();
  const userId = await verifyToken(token);
  if (!userId) return NextResponse.redirect(`${base}/login?error=invalid`);
  track("user.signed_in", { userId, method: "magic_link" });
  const session = await createSessionToken(userId);
  return sessionHtmlRedirect(session, `${base}/app`);
}
