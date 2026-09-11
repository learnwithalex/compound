import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics, fmtMrr, fmtDollars } from "@/lib/metrics";
import { AnalyzeButton } from "./analyze-button";
import { MiniChart } from "./mini-chart";

export default async function AppPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const metrics = await portfolioMetrics(userId);
  const hasData = metrics.products.length > 0;

  const netNewSign = metrics.netNewMrrCents >= 0 ? "+" : "-";
  const netNewColor = metrics.netNewMrrCents >= 0 ? "text-lx-green" : "text-lx-red";

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-lx-faint">Overview</div>
          <h1 className="mt-1 text-[20px] font-semibold tracking-tight text-lx-text">
            Your portfolio
          </h1>
        </div>
        {hasData && <AnalyzeButton />}
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Top metrics */}
          <div className="mb-6 grid grid-cols-4 divide-x divide-lx-border overflow-hidden rounded-md border border-lx-border" style={{ background: "#1c1c22" }}>
            <Metric label="Total MRR" value={fmtMrr(metrics.totalMrrCents)} color="text-lx-text" />
            <Metric label="ARR" value={fmtMrr(metrics.totalArrCents)} color="text-lx-muted" />
            <Metric label="Net new MRR (30d)" value={`${netNewSign}${fmtMrr(Math.abs(metrics.netNewMrrCents))}`} color={netNewColor} />
            <Metric label="Active subs" value={String(metrics.totalActiveSubscriptions)} color="text-lx-text" />
          </div>

          {/* Product cards */}
          <div className="mb-4 text-[11px] font-medium uppercase tracking-widest text-lx-faint">Products</div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {metrics.products.map((p) => {
              const change = p.mrrChange30d;
              const changeColor = change > 0 ? "text-lx-green" : change < 0 ? "text-lx-red" : "text-lx-faint";
              const changeLabel = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
              return (
                <div key={p.connectionId} className="rounded-md border border-lx-border p-4" style={{ background: "#1c1c22" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-[13px] font-semibold text-lx-text">{p.label}</span>
                    <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium text-lx-faint" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {p.provider}
                    </span>
                  </div>

                  <div className="mb-1 text-[22px] font-semibold tabular-nums text-lx-text">
                    {fmtMrr(p.mrrCents)}
                    <span className="ml-1 text-[12px] font-normal text-lx-faint">/ mo</span>
                  </div>

                  <div className={`mb-3 text-[12px] tabular-nums ${changeColor}`}>{changeLabel} 30d</div>

                  {p.history.length > 1 && (
                    <MiniChart data={p.history.map((h) => h.mrrCents)} color={p.color} />
                  )}

                  <div className="mt-3 grid grid-cols-3 gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Stat label="New" value={fmtMrr(p.newMrrCents)} color="text-lx-green" />
                    <Stat label="Churned" value={fmtMrr(p.churnedMrrCents)} color="text-lx-red" />
                    <Stat label="Subs" value={String(p.activeSubscriptions)} color="text-lx-muted" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-lx-faint">{label}</div>
      <div className={`text-[17px] font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-[10px] text-lx-faint">{label}</div>
      <div className={`text-[12px] font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 text-[32px]">📊</div>
      <h2 className="mb-2 text-[16px] font-semibold text-lx-text">Connect your first product</h2>
      <p className="mb-5 max-w-sm text-[13px] text-lx-muted">
        Add a Stripe or Lemon Squeezy API key to see your MRR, churn, and growth across all your products in one place.
      </p>
      <a
        href="/app/connect"
        className="rounded px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
        style={{ background: "#5e6ad2" }}
      >
        Connect a product →
      </a>
    </div>
  );
}
