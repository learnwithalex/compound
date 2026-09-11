import { NextResponse } from "next/server";
import { userIdFromSessionOrToken } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, fmtDollars } from "@/lib/metrics";

// Agent-friendly read endpoint: GET /api/portfolio
// Auth: session cookie (browser) or Authorization: Bearer cmp_... (agent).
// Returns the full portfolio snapshot as JSON, ready to paste into an
// agent prompt or fetch from a script.
export async function GET(req: Request) {
  const userId = await userIdFromSessionOrToken(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const metrics = await portfolioMetrics(userId);

  return NextResponse.json({
    totalMrr: fmtMrr(metrics.totalMrrCents),
    totalMrrCents: metrics.totalMrrCents,
    totalArr: fmtMrr(metrics.totalArrCents),
    totalActiveSubscriptions: metrics.totalActiveSubscriptions,
    netNewMrr30d: `${metrics.netNewMrrCents >= 0 ? "+" : "-"}${fmtDollars(Math.abs(metrics.netNewMrrCents))}`,
    products: metrics.products.map((p) => ({
      name: p.label,
      provider: p.provider,
      mrr: fmtMrr(p.mrrCents),
      mrrCents: p.mrrCents,
      arr: fmtMrr(p.arrCents),
      activeSubscriptions: p.activeSubscriptions,
      change30dPct: Number(p.mrrChange30d.toFixed(1)),
      newMrr: fmtMrr(p.newMrrCents),
      churnedMrr: fmtMrr(p.churnedMrrCents),
      history: p.history,
    })),
  });
}
