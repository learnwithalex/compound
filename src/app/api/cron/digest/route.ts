import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sendDigest } from "@/lib/digest-email";

// Weekday matching: JS Date.getDay() returns 0=Sun … 6=Sat
// userSettings.digestDay stores 1=Mon … 7=Sun (ISO weekday)
function todayIsoWeekday(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 7 : d;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const weekday = todayIsoWeekday();

  const eligibleSettings = await db.query.userSettings.findMany({
    where: (s, { eq, and }) => and(eq(s.digestEnabled, true), eq(s.digestDay, weekday)),
  });

  const results: { userId: string; ok: boolean; error?: string }[] = [];

  for (const settings of eligibleSettings) {
    const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, settings.userId) });
    if (!user || !user.email) {
      results.push({ userId: settings.userId, ok: false, error: "no_email" });
      continue;
    }
    const result = await sendDigest({ id: user.id, email: user.email });
    results.push({ userId: user.id, ...result });
  }

  return NextResponse.json({ sent: results.filter((r) => r.ok).length, total: results.length, results });
}
