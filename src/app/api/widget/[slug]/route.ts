import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { portfolioMetrics } from "@/lib/metrics";
import { fmtMrr } from "@/lib/format";

export const revalidate = 300;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const settings = await db.query.userSettings.findFirst({
    where: (s, { eq }) => eq(s.publicSlug, slug),
  });
  if (!settings || !settings.publicPageEnabled) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const metrics = await portfolioMetrics(settings.userId);

  return NextResponse.json({
    mrr: settings.publicShowMrr ? fmtMrr(metrics.totalMrrCents) : null,
    mrrCents: settings.publicShowMrr ? metrics.totalMrrCents : null,
    netNewMrrCents: settings.publicShowMrr ? metrics.netNewMrrCents : null,
    activeSubscriptions: metrics.totalActiveSubscriptions,
    products: settings.publicShowProducts
      ? metrics.products.map((p) => ({ label: p.label, mrrCents: p.mrrCents, mrrChange30d: p.mrrChange30d }))
      : null,
  }, {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=300" },
  });
}
