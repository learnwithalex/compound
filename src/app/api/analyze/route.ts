import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr } from "@/lib/metrics";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const metrics = await portfolioMetrics(userId);

  if (metrics.products.length === 0) {
    return NextResponse.json({ analysis: "No products connected yet. Add a Stripe or Lemon Squeezy connection to see your analysis." });
  }

  const productSummaries = metrics.products.map((p) => {
    const trend = p.mrrChange30d > 0 ? `+${p.mrrChange30d.toFixed(1)}%` : `${p.mrrChange30d.toFixed(1)}%`;
    return `- ${p.label} (${p.provider}): MRR ${fmtMrr(p.mrrCents)}, ${p.activeSubscriptions} active subs, ${trend} 30-day change. New MRR: ${fmtMrr(p.newMrrCents)}, Churned: ${fmtMrr(p.churnedMrrCents)}`;
  }).join("\n");

  const prompt = `You are a CFO analyst for an indie hacker with ${metrics.products.length} product${metrics.products.length > 1 ? "s" : ""}.

Portfolio snapshot:
- Total MRR: ${fmtMrr(metrics.totalMrrCents)}
- Total ARR: ${fmtMrr(metrics.totalArrCents)}
- Net new MRR (30d): ${fmtMrr(metrics.netNewMrrCents)}
- Total active subscriptions: ${metrics.totalActiveSubscriptions}

Products:
${productSummaries}

Write a concise CFO-style briefing (3-5 sentences) that:
1. States what the numbers mean in plain English
2. Calls out what's working and what needs attention
3. Gives one specific actionable recommendation

Be direct. No fluff. Write like you're texting a busy founder, not writing a board report.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const analysis = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ analysis });
}
