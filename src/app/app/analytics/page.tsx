import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { fmtMrr } from "@/lib/metrics";
import {
  loadSubs, cohortRetention, coreMetrics, lifecycleFunnel,
  segmentByPlan, segmentByCountry, segmentBySource, segmentByProduct,
  type CohortRow, type Segment,
} from "@/lib/analytics";

export default async function AnalyticsPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const subs = await loadSubs(userId);

  if (subs.length === 0) {
    return (
      <div className="py-10">
        <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Analytics</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center" style={{ border: "1px solid #ddd9d0" }}>
          <p className="text-[15px] font-semibold text-lx-text">No customer data yet</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-lx-muted">
            Cohorts, LTV and retention are built from individual subscriptions. Connect a product and run a sync to populate them.
          </p>
          <a href="/app/connect" className="mt-6 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white" style={{ background: "#5e6ad2" }}>
            Connect a product →
          </a>
        </div>
      </div>
    );
  }

  const m = coreMetrics(subs);
  const cohorts = cohortRetention(subs).slice(-13);
  const funnel = lifecycleFunnel(subs);

  return (
    <div className="py-10 pb-20">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Analytics</h1>
        <p className="mt-1 text-[14px] text-lx-muted">
          Cohort retention, unit economics and segments across {subs.length.toLocaleString()} subscriptions.
        </p>
      </div>

      {/* Unit economics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="ARPA" value={fmtMrr(m.arpaCents)} sub="avg revenue per account" />
        <Tile label="LTV" value={fmtMrr(m.ltvCents)} sub={`${m.avgLifetimeMonths.toFixed(1)} mo average lifetime`} />
        <Tile label="Monthly churn" value={`${m.monthlyChurnPct.toFixed(1)}%`} sub="customers lost, last 30d"
              valueColor={m.monthlyChurnPct > 5 ? "#e3493c" : undefined} />
        <Tile label="Quick ratio" value={m.quickRatio === null ? "∞" : m.quickRatio.toFixed(1)}
              sub="new MRR per $1 churned"
              valueColor={m.quickRatio !== null && m.quickRatio < 1 ? "#e3493c" : "#10b981"} />
      </div>

      {/* Cohort retention */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #ddd9d0" }}>
        <div className="flex items-baseline justify-between px-7 pb-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">MRR cohort retention</p>
          <p className="text-[11px] text-lx-faint">% of signup-month MRR still active</p>
        </div>
        <CohortGrid rows={cohorts} />
      </section>

      {/* Funnel + acquisition */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Subscription lifecycle</p>
          <div className="space-y-3">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-lx-text">{f.label}</span>
                  <span className="text-[12px] tabular-nums text-lx-muted">
                    {f.count.toLocaleString()} · {f.pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
                  <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: "#5e6ad2" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <SegmentCard
          title="Acquisition source"
          note="Only present when stamped onto the provider record"
          segments={segmentBySource(subs)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SegmentCard title="By plan" segments={segmentByPlan(subs)} />
        <SegmentCard title="By country" segments={segmentByCountry(subs).slice(0, 8)} />
        <SegmentCard title="By product" segments={segmentByProduct(subs)} />
      </div>
    </div>
  );
}

/* ============================================================ cohort grid */

function heat(pct: number): string {
  // Single-hue ramp: stronger purple = more MRR retained.
  const a = 0.06 + (Math.min(100, pct) / 100) * 0.62;
  return `rgba(94,106,210,${a.toFixed(3)})`;
}

function CohortGrid({ rows }: { rows: CohortRow[] }) {
  if (rows.length === 0) {
    return <div className="px-7 pb-7 text-[13px] text-lx-faint">Not enough history yet.</div>;
  }
  const cols = Math.max(...rows.map((r) => r.retention.length));

  return (
    <div className="overflow-x-auto px-7 pb-7">
      <table className="w-full border-separate" style={{ borderSpacing: "3px" }}>
        <thead>
          <tr>
            <th className="pb-1 pr-3 text-left text-[10px] font-semibold uppercase tracking-wider text-lx-faint">Cohort</th>
            <th className="pb-1 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-lx-faint">Subs</th>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} className="pb-1 text-center text-[10px] font-semibold tabular-nums text-lx-faint" style={{ minWidth: 42 }}>
                m{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cohort}>
              <td className="whitespace-nowrap pr-3 text-[12px] font-semibold text-lx-text">{r.label}</td>
              <td className="pr-3 text-right text-[12px] tabular-nums text-lx-muted">{r.customers.toLocaleString()}</td>
              {Array.from({ length: cols }, (_, i) => {
                const v = r.retention[i];
                if (v === null || v === undefined) {
                  return <td key={i} className="rounded-md" style={{ background: "#faf9f7" }} />;
                }
                return (
                  <td
                    key={i}
                    className="rounded-md py-1.5 text-center text-[11px] font-semibold tabular-nums"
                    style={{ background: heat(v), color: v > 55 ? "#ffffff" : "#4a4744" }}
                  >
                    {v.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================ pieces */

function Tile({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4" style={{ border: "1px solid #ddd9d0" }}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      <p className="text-[22px] font-bold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em", color: valueColor }}>{value}</p>
      <p className="mt-0.5 text-[11px] text-lx-faint">{sub}</p>
    </div>
  );
}

function SegmentCard({ title, segments, note }: { title: string; segments: Segment[]; note?: string }) {
  return (
    <section className="rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">{title}</p>
      {note && <p className="mt-1 text-[11px] text-lx-faint">{note}</p>}
      <div className="mt-5 space-y-3">
        {segments.map((s) => (
          <div key={s.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] font-medium capitalize text-lx-text">{s.key}</span>
              <span className="shrink-0 text-[12px] tabular-nums text-lx-muted">
                {fmtMrr(s.mrrCents)} · {s.pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.key === "Unattributed" ? "#c9c4bb" : "#5e6ad2" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
