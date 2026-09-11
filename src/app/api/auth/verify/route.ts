import { NextResponse } from "next/server";
import { verifyToken, appUrl } from "@/lib/auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { primaryOrgForUser, seedBaseRules, seedOrgForUser } from "@/db/seed-org";
import { db } from "@/db";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const base = appUrl();
  const login = await verifyToken(token);
  if (!login) {
    return NextResponse.redirect(`${base}/login?error=invalid`);
  }

  const me = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, login.userId),
  });
  if (!me) return NextResponse.redirect(`${base}/login?error=invalid`);

  // First login creates the org + chart + base rules.
  const existing = await primaryOrgForUser(me.id);
  if (!existing) {
    const { org } = await seedOrgForUser(me.email, `${me.email.split("@")[0]}'s books`);
    await seedBaseRules(org.id);
  }

  const session = await createSessionToken(me.id);
  await setSessionCookie(session);
  return NextResponse.redirect(`${base}/app`);
}
