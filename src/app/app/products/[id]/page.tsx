import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { singleProductMetrics, fmtMrr } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { milestoneFor, radarSignals } from "@/lib/insights";
import { TrendChart } from "@/app/app/trend-chart";
import { MiniChart } from "@/app/app/mini-chart";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const result = await singleProductMetrics(userId, id);
  if (!result) redirect("/app");

  const { product: p, lastSyncedAt, currency } = result;
  const icon = productIcon(p.label, p.provider);
  const up = p.mrrChange30d > 0;
  const down = p.mrrChange30d < 0;
  const color = p.color || "#5e6ad2";

  const series = p.history.map((h) => ({ date: h.date, value: h.mrrCents }));
  const milestone = milestoneFor(p.mrrCents);
  const signals = radarSignals([p]);

  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "never";

  return (
    <div className="py-10 pb-20">
      {/* Back */}
      <a href="/app" className="mb-8 inline-flex items-center gap-1.5 text-[12px] font-medium text-lx-muted hover:text-lx-text">
        ← Portfolio
      </a>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <img
          src={icon}
          alt={p.label}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          style={{ border: "1px solid #ece9e3" }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            {p.label}
          </h1>
          <p className="mt-0.5 text-[13px] text-lx-muted capitalize">
            {p.provider} · {p.activeSubscriptions.toLocaleString()} active subscriptions · synced {fmtDate(lastSyncedAt)}
          </p>
        </div>
      </div>

      {/* Hero stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="MRR" value={fmtMrr(p.mrrCents)} />
        <StatTile label="ARR" value={fmtMrr(p.arrCents)} />
        <StatTile label="Active subs" value={p.activeSubscriptions.toLocaleString()} />
        <StatTile
          label="30d change"
          value={`${up ? "+" : ""}${p.mrrChange30d.toFixed(1)}%`}
          valueColor={up ? "#10b981" : down ? "#e3493c" : "#9c9894"}
        />
      </div>

      {/* MRR trend chart */}
      <section className="mb-6 rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
            MRR trend · last 90 days
          </p>
          {series.length > 1 && (
            <span className={`text-[12px] font-semibold tabular-nums ${up ? "text-lx-green" : down ? "text-lx-red" : "text-lx-faint"}`}>
              {up ? "+" : ""}{p.mrrChange30d.toFixed(1)}% this period
            </span>
          )}
        </div>
        {series.length > 1 ? (
          <TrendChart series={series} height={280} color={color} />
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-lg text-[13px] text-lx-faint" style={{ background: "#f7f5f1" }}>
            Sync daily to build your trend
          </div>
        )}
      </section>

      {/* Movement breakdown */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <MovementTile label="New MRR" value={fmtMrr(p.newMrrCents)} color="#10b981" bg="rgba(16,185,129,0.07)" />
        <MovementTile label="Churned MRR" value={fmtMrr(p.churnedMrrCents)} color="#e3493c" bg="rgba(227,73,60,0.07)" />
        <MovementTile label="Expansion MRR" value={fmtMrr(p.expansionMrrCents)} color="#5e6ad2" bg="rgba(94,106,210,0.07)" />
      </div>

      {/* Churn signals */}
      {signals.length > 0 && (
        <section className="mb-6 rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Health signals</p>
          <div className="space-y-2">
            {signals.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: s.severity === "red" ? "rgba(227,73,60,0.07)" : "rgba(245,158,11,0.07)" }}>
                <span className="text-[15px]">{s.severity === "red" ? "🔴" : "🟡"}</span>
                <span className="text-[13px] font-medium text-lx-text">{s.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Milestone */}
      <section className="rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
          Next milestone · {milestone.crossed} crossed
        </p>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[14px] font-semibold text-lx-text">
            {fmtMrr(milestone.prevCents)} → {fmtMrr(milestone.nextCents)} MRR
          </span>
          <span className="text-[12px] text-lx-muted">{milestone.pct.toFixed(0)}% · {fmtMrr(milestone.toGoCents)} to go</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(milestone.pct, 100)}%`, background: color }}
          />
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4" style={{ border: "1px solid #ddd9d0" }}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      <p className="text-[22px] font-bold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em", color: valueColor }}>
        {value}
      </p>
    </div>
  );
}

function MovementTile({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: bg, border: `1px solid ${color}22` }}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color }}>{label}</p>
      <p className="text-[20px] font-bold tabular-nums" style={{ color, letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}
