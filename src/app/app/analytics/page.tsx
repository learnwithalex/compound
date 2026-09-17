import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { fmtMrr } from "@/lib/metrics";
import {
  loadSubs, cohortRetention, coreMetrics, lifecycleFunnel, periodComparison,
  segmentByPlan, segmentByCountry, segmentBySource, segmentByProduct,
} from "@/lib/analytics";
import { CohortGrid } from "../cohort-grid";
import { SegmentCard, FunnelCard } from "../report-cards";
import { IconArpa, IconLtv, IconChurn, IconQuick } from "../stat-icons";

export default async function AnalyticsPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const subs = await loadSubs(userId);

  if (subs.length === 0) {
    return (
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Analytics</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-sm bg-white py-20 text-center" style={{ border: "1px solid #ebebeb" }}>
          <p className="text-[15px] font-semibold text-lx-text">No customer data yet</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-lx-muted">
            Cohorts, LTV and retention are built from individual subscriptions. Connect a product and run a sync to populate them.
          </p>
          <a href="/app/connect" className="mt-6 rounded-sm px-5 py-2.5 text-[13px] font-semibold text-white" style={{ background: "#5e6ad2" }}>
            Connect a product →
          </a>
        </div>
      </div>
    );
  }

  const m = coreMetrics(subs);
  const delta = periodComparison(subs);
  const cohorts = cohortRetention(subs).slice(-13);
  const funnel = lifecycleFunnel(subs);

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Analytics</h1>
        <p className="mt-1 text-[14px] text-lx-muted">
          Cohort retention, unit economics and segments across {subs.length.toLocaleString()} subscriptions.
        </p>
      </div>

      {/* Unit economics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="ARPA" value={fmtMrr(m.arpaCents)} sub="avg revenue per account" icon={IconArpa} accent="#fff2a8"
          delta={delta.arpaDelta} deltaLabel="vs prev 30d" />
        <Tile label="LTV" value={fmtMrr(m.ltvCents)} sub={`${m.avgLifetimeMonths.toFixed(1)} mo avg lifetime`} icon={IconLtv} accent="#c9f0ff"
          delta={delta.ltvDelta} deltaLabel="vs prev 30d" />
        <Tile label="Monthly churn" value={`${m.monthlyChurnPct.toFixed(1)}%`} sub="customers lost, last 30d"
              valueColor={m.monthlyChurnPct > 5 ? "#e3493c" : undefined} icon={IconChurn} accent="#ffd4e8"
              delta={-delta.churnDelta} deltaLabel="vs prev 30d" lowerIsBetter />
        <Tile label="Trial conv." value={`${delta.trialConversionPct.toFixed(0)}%`}
              sub="trials converted to paid"
              valueColor={delta.trialConversionPct < 20 ? "#f59e0b" : "#10b981"} icon={IconQuick} accent="#d4ffc9"
              delta={delta.trialConversionPct - delta.prevTrialConversionPct} deltaLabel="vs prev 30d" />
      </div>

      {/* Cohort retention */}
      <section className="mb-6 overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
        <div className="flex items-baseline justify-between px-7 pb-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">MRR cohort retention</p>
          <p className="text-[11px] text-lx-faint">% of signup-month MRR still active</p>
        </div>
        <CohortGrid rows={cohorts} />
      </section>

      {/* Funnel + acquisition */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <FunnelCard steps={funnel} />

        <SegmentCard
          title="Acquisition source"
          note="Only present when stamped onto the provider record"
          segments={segmentBySource(subs)}
          kind="source"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SegmentCard title="By plan" segments={segmentByPlan(subs)} kind="plan" />
        <SegmentCard title="By country" segments={segmentByCountry(subs).slice(0, 8)} kind="country" />
        <SegmentCard title="By product" segments={segmentByProduct(subs)} kind="product" />
      </div>
    </div>
  );
}

/* ============================================================ pieces */

function Tile({
  label, value, sub, valueColor, icon: Icon, accent, delta, deltaLabel, lowerIsBetter,
}: {
  label: string; value: string; sub: string; valueColor?: string;
  icon?: () => React.ReactElement; accent?: string;
  delta?: number; deltaLabel?: string; lowerIsBetter?: boolean;
}) {
  const deltaGood = delta != null ? (lowerIsBetter ? delta > 0 : delta > 0) : null;
  const deltaColor = deltaGood === null ? "#9a9a9a" : deltaGood ? "#10b981" : "#e3493c";
  return (
    <div
      className="rounded-sm bg-white px-5 py-4 transition-transform hover:-translate-y-1"
      style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}
    >
      <div className="mb-2 flex items-center gap-2">
        {Icon && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm"
            style={{ background: accent ?? "#fff2a8", border: "1px solid #1c1c22" }}
          >
            <Icon />
          </span>
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      </div>
      <p className="text-[23px] font-extrabold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em", color: valueColor }}>{value}</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <p className="text-[11px] font-medium text-lx-faint">{sub}</p>
        {delta != null && deltaLabel && (
          <span className="ml-auto shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: deltaColor }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
