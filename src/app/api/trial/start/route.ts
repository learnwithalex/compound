import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema";

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  await db.insert(userSettings).values({ userId, trialStartedAt: now })
    .onConflictDoUpdate({ target: userSettings.userId, set: { trialStartedAt: now } });

  return NextResponse.json({ ok: true });
}
