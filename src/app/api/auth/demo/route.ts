import { NextResponse } from "next/server";
import { db } from "@/db";
import { appUrl, createSessionToken, setSessionCookie } from "@/lib/auth";

const DEMO_EMAIL = "demo@compound.so";

export async function GET() {
  const enabled = process.env.NODE_ENV !== "production" || process.env.DEMO_LOGIN_ENABLED === "true";
  if (!enabled) return NextResponse.json({ error: "demo not enabled" }, { status: 403 });

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, DEMO_EMAIL) });
  const base = appUrl();
  if (!user) return NextResponse.redirect(`${base}/login?error=demo-not-seeded`);

  const session = await createSessionToken(user.id);
  await setSessionCookie(session);
  return NextResponse.redirect(`${base}/app`);
}
