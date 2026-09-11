import { NextResponse } from "next/server";
import { db } from "@/db";
import { appUrl } from "@/lib/auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";

const DEMO_EMAIL = "demo@booked.app";

// Creates a real session scoped to the demo org. Not a bypass: the demo user
// has its own org with no real financial data. Disabled in production when
// NODE_ENV is "production" and DEMO_LOGIN_ENABLED is not explicitly "true".
export async function GET(req: Request) {
  const enabled =
    process.env.NODE_ENV !== "production" ||
    process.env.DEMO_LOGIN_ENABLED === "true";

  if (!enabled) {
    return NextResponse.json({ error: "demo login is not enabled" }, { status: 403 });
  }

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, DEMO_EMAIL),
  });

  const base = appUrl();

  if (!user) {
    return NextResponse.redirect(`${base}/login?error=demo-not-seeded`);
  }

  const session = await createSessionToken(user.id);
  await setSessionCookie(session);
  return NextResponse.redirect(`${base}/app`);
}
