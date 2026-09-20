import { NextResponse } from "next/server";
import { db } from "@/db";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics } from "@/lib/metrics";
import { generateBrief } from "@/lib/brief";
import { buildDigestHtml } from "@/lib/digest-email";

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });
  if (!user || !user.email) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const metrics = await portfolioMetrics(userId);
  if (metrics.products.length === 0) return NextResponse.json({ error: "no_data" }, { status: 400 });

  const brief = await generateBrief(metrics);
  const html = buildDigestHtml(brief, metrics);

  const apiKey = process.env.ORIZON_EMAIL_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "email_not_configured" }, { status: 503 });

  const base = process.env.ORIZON_EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  const res = await fetch(`${base}/v1/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Compound <compound@send.orizon.ng>",
      to: [user.email],
      reply_to: ["hello@usecompound.xyz"],
      subject: `${brief.headline} — compound weekly`,
      html,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "send_failed", status: res.status }, { status: 502 });
  return NextResponse.json({ ok: true });
}
