import { NextResponse } from "next/server";
import { db } from "@/db";
import { userIdFromSession, appUrl } from "@/lib/auth";
import { portfolioMetrics } from "@/lib/metrics";
import { generateBrief } from "@/lib/brief";
import { fmtMrr } from "@/lib/format";

function briefHtml(brief: Awaited<ReturnType<typeof generateBrief>>, metrics: Awaited<ReturnType<typeof portfolioMetrics>>): string {
  const MOOD_EMOJI = { growing: "🚀", steady: "🙂", shrinking: "📉" } as const;
  const stamp = new Date(brief.generatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const calloutRows = brief.callouts.map((c) => `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:${c.kind === "win" ? "#0f9b6c" : "#c8392c"};font-weight:600;">${c.kind === "win" ? "✓" : "⚠"} ${c.title}</td>
    </tr>
    <tr><td style="padding:0 0 10px;font-size:12px;color:#5c5c5c;">${c.detail}</td></tr>
  `).join("");

  const actionRows = brief.actions.map((a, i) => `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#1a1a1a;font-weight:600;">${i + 1}. ${a.title}</td>
    </tr>
    <tr><td style="padding:0 0 10px;font-size:12px;color:#5c5c5c;">${a.detail}</td></tr>
  `).join("");

  const productRows = [...metrics.products]
    .sort((a, b) => b.mrrCents - a.mrrCents)
    .map((p) => {
      const up = p.mrrChange30d > 0;
      const color = up ? "#0f9b6c" : p.mrrChange30d < 0 ? "#c8392c" : "#9a9a9a";
      return `<tr>
        <td style="padding:5px 0;font-size:13px;color:#1a1a1a;">${p.label}</td>
        <td style="padding:5px 0;font-size:13px;color:#1a1a1a;text-align:right;font-variant-numeric:tabular-nums;">${fmtMrr(p.mrrCents)}</td>
        <td style="padding:5px 0;font-size:12px;color:${color};text-align:right;padding-left:12px;">${up ? "+" : ""}${p.mrrChange30d.toFixed(1)}%</td>
      </tr>`;
    }).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <!-- Header -->
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:16px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">compound</span>
          <span style="font-size:16px;font-weight:700;color:#ff5c00;">.</span>
          <span style="font-size:11px;color:#9a9a9a;margin-left:8px;">Weekly briefing · ${stamp}</span>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background:#fff;border:1px solid #ebebeb;border-radius:6px;padding:24px 28px;margin-bottom:12px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">
            ${MOOD_EMOJI[brief.mood]} ${brief.mood === "growing" ? "Growing" : brief.mood === "steady" ? "Holding steady" : "Shrinking"}
          </p>
          <h1 style="margin:8px 0 12px;font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;line-height:1.25;">${brief.headline}</h1>
          <p style="margin:0;font-size:13px;color:#5c5c5c;line-height:1.6;">${brief.summary}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid #f0f0f0;padding-top:16px;">
            <tr>
              <td style="text-align:center;padding:8px 4px;">
                <p style="margin:0;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">MRR</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a1a;">${fmtMrr(metrics.totalMrrCents)}</p>
              </td>
              <td style="text-align:center;padding:8px 4px;">
                <p style="margin:0;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">ARR</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a1a;">${fmtMrr(metrics.totalArrCents)}</p>
              </td>
              <td style="text-align:center;padding:8px 4px;">
                <p style="margin:0;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">Net new · 30d</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:${metrics.netNewMrrCents >= 0 ? "#0f9b6c" : "#c8392c"};">${metrics.netNewMrrCents >= 0 ? "+" : "−"}${fmtMrr(Math.abs(metrics.netNewMrrCents))}</p>
              </td>
              <td style="text-align:center;padding:8px 4px;">
                <p style="margin:0;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">Subs</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a1a;">${metrics.totalActiveSubscriptions.toLocaleString()}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="height:12px;"></td></tr>

        ${calloutRows.length ? `
        <!-- Callouts -->
        <tr><td style="background:#fff;border:1px solid #ebebeb;border-radius:6px;padding:20px 28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">What stood out</p>
          <table width="100%" cellpadding="0" cellspacing="0">${calloutRows}</table>
        </td></tr>
        <tr><td style="height:12px;"></td></tr>
        ` : ""}

        ${actionRows.length ? `
        <!-- Actions -->
        <tr><td style="background:#fff;border:1px solid #ebebeb;border-radius:6px;padding:20px 28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">Do this week</p>
          <table width="100%" cellpadding="0" cellspacing="0">${actionRows}</table>
        </td></tr>
        <tr><td style="height:12px;"></td></tr>
        ` : ""}

        <!-- Products -->
        <tr><td style="background:#fff;border:1px solid #ebebeb;border-radius:6px;padding:20px 28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9a9a9a;">Products</p>
          <table width="100%" cellpadding="0" cellspacing="0">${productRows}</table>
        </td></tr>

        <tr><td style="height:24px;"></td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:0 0 8px;">
          <a href="${appUrl()}/app" style="font-size:12px;color:#5e6ad2;text-decoration:none;">Open compound →</a>
          <span style="margin:0 8px;color:#d0d0d0;">·</span>
          <a href="${appUrl()}/app/settings" style="font-size:12px;color:#9a9a9a;text-decoration:none;">Manage digest settings</a>
        </td></tr>
        <tr><td style="text-align:center;">
          <p style="margin:0;font-size:11px;color:#b0aba3;">Written by Claude from your live numbers. Figures are the source of truth.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const metrics = await portfolioMetrics(userId);
  if (metrics.products.length === 0) return NextResponse.json({ error: "no_data" }, { status: 400 });

  const brief = await generateBrief(metrics);
  const html = briefHtml(brief, metrics);

  const apiKey = process.env.ORIZON_EMAIL_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "email_not_configured" }, { status: 503 });

  const base = process.env.ORIZON_EMAIL_API_URL?.trim() || "https://api.orizon.ng";
  const res = await fetch(`${base}/v1/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Compound <noreply@send.orizon.ng>",
      to: user.email,
      subject: `${brief.headline} — compound weekly`,
      html,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "send_failed", status: res.status }, { status: 502 });
  return NextResponse.json({ ok: true });
}
