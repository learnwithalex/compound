import { notFound } from "next/navigation";
import { db } from "@/db";
import { portfolioMetrics } from "@/lib/metrics";
import { fmtMrr } from "@/lib/format";

export const revalidate = 300;

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const settings = await db.query.userSettings.findFirst({
    where: (s, { eq }) => eq(s.publicSlug, slug),
  });
  if (!settings || !settings.publicPageEnabled) notFound();

  const metrics = await portfolioMetrics(settings.userId);

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`* { margin:0; padding:0; box-sizing:border-box; font-family: system-ui, sans-serif; } body { background: #fff; }`}</style>
      </head>
      <body>
        <div style={{ border: "1px solid #ebebeb", borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a8a39b", marginBottom: 4 }}>Monthly Recurring Revenue</p>
            {settings.publicShowMrr && (
              <p style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.03em", tabularNums: "tabular-nums" } as React.CSSProperties}>
                {fmtMrr(metrics.totalMrrCents)}
              </p>
            )}
            <p style={{ fontSize: 11, color: metrics.netNewMrrCents >= 0 ? "#0f9b6c" : "#c8392c", marginTop: 2, fontWeight: 600 }}>
              {metrics.netNewMrrCents >= 0 ? "+" : "−"}{fmtMrr(Math.abs(metrics.netNewMrrCents))} · 30d
            </p>
          </div>
          <a href="https://usecompound.xyz" target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#c0bdb8", textDecoration: "none" }}>
            compound ↗
          </a>
        </div>
      </body>
    </html>
  );
}
