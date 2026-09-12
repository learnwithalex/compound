import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { singleProductMetrics, fmtMrr } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { Avatar } from "@/app/app/avatar";
import { milestoneFor, radarSignals } from "@/lib/insights";
import {
  loadSubs, coreMetrics, cohortRetention, lifecycleFunnel, topCustomers, recentActivity,
  segmentByPlan, segmentByCountry, segmentBySource,
  type TopCustomer, type ActivityItem,
} from "@/lib/analytics";
import { ChartCard } from "@/app/app/trend-chart";
import { CohortGrid } from "@/app/app/cohort-grid";
import { SegmentCard, FunnelCard } from "@/app/app/report-cards";
import { planTint, CountryMark } from "@/app/app/segment-icons";
import { IconMrr, IconArr, IconSubs, IconTrend, IconArpa, IconLtv, IconChurn, IconQuick } from "@/app/app/stat-icons";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const result = await singleProductMetrics(userId, id);
  if (!result) redirect("/app");

  const { product: p, lastSyncedAt } = result;
  const [subs, activity] = await Promise.all([loadSubs(userId, id), recentActivity(id, 12)]);

  const icon = productIcon(p.label, p.provider);
  const up = p.mrrChange30d > 0;
  const down = p.mrrChange30d < 0;
  const color = p.color || "#5e6ad2";

  const series = p.history.map((h) => ({ date: h.date, value: h.mrrCents }));
  const milestone = milestoneFor(p.mrrCents);
  const signals = radarSignals([p]);

  const m = coreMetrics(subs);
  const cohorts = cohortRetention(subs).slice(-13);
  const customers = topCustomers(subs, 10);

  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "never";

  return (
    <div className="py-10 pb-20">
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
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            {p.label}
          </h1>
          <p className="mt-0.5 text-[13px] capitalize text-lx-muted">
            {p.provider} · {p.activeSubscriptions.toLocaleString()} active subscriptions · synced {fmtDate(lastSyncedAt)}
          </p>
        </div>
      </div>

      {/* Hero stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="MRR" value={fmtMrr(p.mrrCents)} icon={IconMrr} />
        <StatTile label="ARR" value={fmtMrr(p.arrCents)} icon={IconArr} />
        <StatTile label="Active subs" value={p.activeSubscriptions.toLocaleString()} icon={IconSubs} />
        <StatTile
          label="30d change"
          value={`${up ? "+" : ""}${p.mrrChange30d.toFixed(1)}%`}
          valueColor={up ? "#10b981" : down ? "#e3493c" : "#9c9894"}
          icon={IconTrend}
        />
      </div>

      {/* Unit economics */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="ARPA" value={fmtMrr(m.arpaCents)} sub="per active account" icon={IconArpa} />
        <StatTile label="LTV" value={fmtMrr(m.ltvCents)} sub={`${m.avgLifetimeMonths.toFixed(1)} mo lifetime`} icon={IconLtv} />
        <StatTile
          label="Monthly churn"
          value={`${m.monthlyChurnPct.toFixed(1)}%`}
          sub="customers lost, last 30d"
          valueColor={m.monthlyChurnPct > 5 ? "#e3493c" : undefined}
          icon={IconChurn}
        />
        <StatTile
          label="Quick ratio"
          value={m.quickRatio === null ? "∞" : m.quickRatio.toFixed(1)}
          sub="new MRR per $1 churned"
          valueColor={m.quickRatio !== null && m.quickRatio < 1 ? "#e3493c" : "#10b981"}
          icon={IconQuick}
        />
      </div>

      {/* MRR trend */}
      <ChartCard
        className="mb-6"
        label="Monthly recurring revenue"
        caption={`Last 90 days · ${p.label}`}
        series={series}
        color={color}
        height={280}
      />

      {/* Movement */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <MovementTile label="New MRR" value={fmtMrr(p.newMrrCents)} color="#10b981" bg="rgba(16,185,129,0.07)" />
        <MovementTile label="Churned MRR" value={fmtMrr(p.churnedMrrCents)} color="#e3493c" bg="rgba(227,73,60,0.07)" />
        <MovementTile label="Expansion MRR" value={fmtMrr(p.expansionMrrCents)} color="#5e6ad2" bg="rgba(94,106,210,0.07)" />
      </div>

      {/* Cohorts */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #ddd9d0" }}>
        <div className="flex items-baseline justify-between px-7 pb-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">MRR cohort retention</p>
          <p className="text-[11px] text-lx-faint">% of signup-month MRR still active</p>
        </div>
        <CohortGrid rows={cohorts} color={color} />
      </section>

      {/* Customers + activity */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TopCustomersCard customers={customers} />
        </div>
        <div className="lg:col-span-2">
          <ActivityCard items={activity} />
        </div>
      </div>

      {/* Funnel + acquisition */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <FunnelCard steps={lifecycleFunnel(subs)} color={color} />
        <SegmentCard
          title="Acquisition source"
          note="Only present when stamped onto the provider record"
          segments={segmentBySource(subs)}
          color={color}
          kind="source"
        />
      </div>

      {/* Segments */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SegmentCard title="By plan" segments={segmentByPlan(subs)} color={color} kind="plan" />
        <SegmentCard title="By country" segments={segmentByCountry(subs).slice(0, 8)} color={color} kind="country" />
      </div>

      {/* Health signals */}
      {signals.length > 0 && (
        <section className="mb-6 rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Health signals</p>
          <div className="space-y-2">
            {signals.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: s.severity === "red" ? "rgba(227,73,60,0.07)" : "rgba(245,158,11,0.07)" }}
              >
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
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(milestone.pct, 100)}%`, background: color }} />
        </div>
      </section>
    </div>
  );
}

/* ============================================================ cards */

function Pill({ label, tint }: { label: string; tint: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-[3px] text-[11px] font-semibold"
      style={{ color: tint, background: `${tint}14`, border: `1px solid ${tint}2e` }}
    >
      {label}
    </span>
  );
}

function TopCustomersCard({ customers }: { customers: TopCustomer[] }) {
  const top = customers[0]?.mrrCents ?? 1;

  return (
    <section className="h-full overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #ddd9d0" }}>
      <div className="flex items-baseline justify-between px-7 pb-4 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Top customers</p>
        <p className="text-[11px] text-lx-faint">by MRR</p>
      </div>
      {customers.length === 0 ? (
        <p className="px-7 pb-7 text-[13px] text-lx-faint">No active customers yet.</p>
      ) : (
        <div className="overflow-x-auto px-7 pb-7">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-lx-faint">
                <th className="pb-2 text-left">Customer</th>
                <th className="pb-2 text-left">Plan</th>
                <th className="pb-2 text-right">Tenure</th>
                <th className="pb-2 text-right">Billed</th>
                <th className="pb-2 text-right">MRR</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} className="group" style={{ borderTop: "1px solid #f0ede8" }}>
                  <td className="max-w-[220px] py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size={34} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-lx-text">{c.name}</p>
                        <p className="flex items-center gap-1.5 truncate text-[11px] text-lx-faint">
                          {c.country && <CountryMark code={c.country} />}
                          {c.country ?? "—"}
                          {c.source ? ` · ${c.source}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    {c.planName ? <Pill label={c.planName} tint={planTint(c.planName)} /> : <span className="text-[12px] text-lx-faint">—</span>}
                  </td>
                  <td className="py-2.5 text-right text-[12px] tabular-nums text-lx-muted">
                    {c.tenureMonths.toFixed(0)} mo
                  </td>
                  <td className="py-2.5 text-right text-[12px] tabular-nums text-lx-muted">{fmtMrr(c.ltdCents)}</td>
                  <td className="py-2.5 pl-3 text-right">
                    <p className="text-[13px] font-semibold tabular-nums text-lx-text">{fmtMrr(c.mrrCents)}</p>
                    <div className="ml-auto mt-1 h-[3px] w-14 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(c.mrrCents / top) * 100}%`, background: planTint(c.planName) }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const EVENT_STYLE: Record<string, { color: string; verb: string; glyph: string; sign: string }> = {
  new: { color: "#10b981", verb: "subscribed", glyph: "+", sign: "+" },
  reactivation: { color: "#10b981", verb: "reactivated", glyph: "↻", sign: "+" },
  expansion: { color: "#5e6ad2", verb: "upgraded", glyph: "↑", sign: "+" },
  contraction: { color: "#f59e0b", verb: "downgraded", glyph: "↓", sign: "−" },
  churn: { color: "#e3493c", verb: "canceled", glyph: "×", sign: "−" },
};

function ActivityCard({ items }: { items: ActivityItem[] }) {
  const rel = (d: Date) => {
    const days = Math.floor((Date.now() - d.getTime()) / 864e5);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <section className="h-full rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Recent activity</p>
      {items.length === 0 ? (
        <p className="text-[13px] text-lx-faint">No movements recorded yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((it, i) => {
            const style = EVENT_STYLE[it.eventType] ?? {
              color: "#9c9894", verb: it.eventType, glyph: "•", sign: "",
            };
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-lx-sidebar">
                <div className="relative shrink-0">
                  <Avatar name={it.customerName} size={32} />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full text-[9px] font-bold leading-none text-white"
                    style={{ background: style.color, border: "1.5px solid #ffffff" }}
                  >
                    {style.glyph}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-lx-text">
                    <span className="font-medium">{it.customerName}</span>{" "}
                    <span className="text-lx-muted">{style.verb}</span>
                  </p>
                  <p className="truncate text-[11px] text-lx-faint">
                    {it.planName ? `${it.planName} · ` : ""}{rel(it.occurredAt)}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold tabular-nums" style={{ color: style.color }}>
                  {style.sign}{fmtMrr(it.amountCents)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatTile({
  label, value, sub, valueColor, icon: Icon,
}: { label: string; value: string; sub?: string; valueColor?: string; icon?: () => React.ReactElement }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4" style={{ border: "1px solid #ddd9d0" }}>
      <div className="mb-1 flex items-center gap-1.5 text-lx-faint">
        {Icon && <Icon />}
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">{label}</p>
      </div>
      <p className="text-[22px] font-bold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em", color: valueColor }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-lx-faint">{sub}</p>}
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
