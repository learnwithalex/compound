import { NextRequest, NextResponse } from "next/server";
import { syncAll } from "@/lib/sync-all";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await syncAll();
  return NextResponse.json({ ok: true });
}
