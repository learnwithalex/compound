import { NextResponse } from "next/server";
import { verifyToken, appUrl, createSessionToken, applySessionCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const base = appUrl();
  const userId = await verifyToken(token);
  if (!userId) return NextResponse.redirect(`${base}/login?error=invalid`);
  const session = await createSessionToken(userId);
  return applySessionCookie(NextResponse.redirect(`${base}/app`), session);
}
