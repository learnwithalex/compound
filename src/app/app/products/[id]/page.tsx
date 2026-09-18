import Link from "next/link";
import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { singleProductMetrics, portfolioMetrics, fmtMrr } from "@/lib/metrics";
import { productIcon } from "@/lib/format";
import { db } from "@/db";
import { trackerTokens, analyticsEvents } from "@/db/schema";
import { eq, count } from "drizzle-orm";
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
import { ProductSidebar } from "./product-sidebar";
import { TrackingTab } from "./tracking-tab";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");

  const result = await singleProductMetrics(userId, id);
  if (!result) redirect("/app");

  const { product: p, lastSyncedAt } = result;
  const icon = productIcon(p.label, p.provider);
  const color = p.color || "#5e6ad2";
  const up = p.mrrChange30d > 0;
  const down = p.mrrChange30d < 0;
  const series = p.history.map((h) => ({ date: h.date, value: h.mrrCents }));
  const fmtDate = (d: Date | null) =>
    d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "never";

  // Load only what the active tab needs
  const subs = tab === "customers" || tab === "cohorts" || tab === "segments"
    ? await loadSubs(userId, id)
    : tab === "overview"
      ? await loadSubs(userId, id)
      : null;

  const [portfolio] = await Promise.all([portfolioMetrics(userId)]);
  const ranked = [...portfolio.products].sort((a, b) => b.mrrCents - a.mrrCents);
  const rank = ranked.findIndex((x) => x.connectionId === p.connectionId) + 1;
  const fastest = [...portfolio.products].sort((a, b) => b.mrrChange30d - a.mrrChange30d)[0];
  const milestone = milestoneFor(p.mrrCents);
  const health = radarSignals([p])[0];

  return (
    <div className="flex min-h-0 gap-0 pb-20" style={{ marginLeft: "-3.5rem", marginRight: "-10rem" }}>
      {/* Product-scoped sidebar */}
      <ProductSidebar id={id} productName={p.label} />

      {/* Main content */}
      <div className="min-w-0 flex-1 overflow-y-auto px-10 pb-20 pt-1">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <img
            src={icon}
            alt={p.label}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-sm object-cover"
            style={{ border: "1px solid #ebebeb" }}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
              {p.label}
            </h1>
            <p className="mt-0.5 text-[12.5px] capitalize text-lx-muted">
              {p.provider} · {p.activeSubscriptions.toLocaleString()} active subs · synced {fmtDate(lastSyncedAt)}
            </p>
          </div>
          {(() => {
            const isFastest = fastest?.connectionId === p.connectionId && p.mrrChange30d > 0;
            const stamp = isFastest
              ? { emoji: "🚀", top: "Fastest", bottom: "growing" }
              : rank === 1 && ranked.length > 1
                ? { emoji: "🏆", top: "#1 Top", bottom: "performer" }
                : null;
            return stamp ? (
              <div
                className="flex shrink-0 -rotate-3 flex-col items-center rounded-sm bg-white px-3 py-2 text-center"
                style={{ border: "2px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}
              >
                <span className="text-[16px] leading-none">{stamp.emoji}</span>
                <span className="mt-1 text-[9px] font-extrabold uppercase leading-tight tracking-[0.08em] text-[#1c1c22]">
                  {stamp.top}<br />{stamp.bottom}
                </span>
              </div>
            ) : null;
          })()}
        </div>

        {/* Tab content */}
        {tab === "overview" && subs && (
          <OverviewTab
            p={p} series={series} color={color} up={up} down={down}
            m={coreMetrics(subs)} health={health} milestone={milestone}
          />
        )}

        {tab === "customers" && subs && (
          <CustomersTab
            subs={subs} connectionId={p.connectionId} productLabel={p.label}
          />
        )}

        {tab === "cohorts" && subs && (
          <CohortsTab subs={subs} color={color} />
        )}

        {tab === "segments" && subs && (
          <SegmentsTab subs={subs} color={color} />
        )}

        {tab === "tracking" && (
          <TrackingTab connectionId={id} productLabel={p.label} />
        )}
      </div>
    </div>
  );
}

/* ============================================================ tabs */

async function OverviewTab({ p, series, color, up, down, m, health, milestone }: {
  p: NonNullable<Awaited<ReturnType<typeof singleProductMetrics>>>["product"];
  series: { date: string; value: number }[];
  color: string; up: boolean; down: boolean;
  m: ReturnType<typeof coreMetrics>;
  health: ReturnType<typeof radarSignals>[0];
  milestone: ReturnType<typeof milestoneFor>;
}) {
  return (
    <div>
      {/* Hero stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="MRR" value={fmtMrr(p.mrrCents)} icon={IconMrr} accent="#fff2a8" />
        <StatTile label="ARR" value={fmtMrr(p.arrCents)} icon={IconArr} accent="#c9f0ff" />
        <StatTile label="Active subs" value={p.activeSubscriptions.toLocaleString()} icon={IconSubs} accent="#ffd4e8" />
        <StatTile
          label="30d change"
          value={`${up ? "+" : ""}${p.mrrChange30d.toFixed(1)}%`}
          valueColor={up ? "#10b981" : down ? "#e3493c" : "#9a9a9a"}
          icon={IconTrend} accent="#d4ffc9"
        />
      </div>

      {/* Unit economics */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="ARPA" value={fmtMrr(m.arpaCents)} sub="per active account" icon={IconArpa} accent="#fff2a8" />
        <StatTile label="LTV" value={fmtMrr(m.ltvCents)} sub={`${m.avgLifetimeMonths.toFixed(1)} mo lifetime`} icon={IconLtv} accent="#c9f0ff" />
        <StatTile
          label="Monthly churn"
          value={`${m.monthlyChurnPct.toFixed(1)}%`}
          sub="customers lost, last 30d"
          valueColor={m.monthlyChurnPct > 5 ? "#e3493c" : undefined}
          icon={IconChurn} accent="#ffd4e8"
        />
        <StatTile
          label="Quick ratio"
          value={m.quickRatio === null ? "∞" : m.quickRatio.toFixed(1)}
          sub="new MRR per $1 churned"
          valueColor={m.quickRatio !== null && m.quickRatio < 1 ? "#e3493c" : "#10b981"}
          icon={IconQuick} accent="#d4ffc9"
        />
      </div>

      <ChartCard
        className="mb-6"
        label="Monthly recurring revenue"
        caption={`Last 90 days · ${p.label}`}
        series={series} color={color} height={260}
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <MovementTile label="New MRR" value={fmtMrr(p.newMrrCents)} color="#10b981" bg="rgba(16,185,129,0.07)" />
        <MovementTile label="Churned MRR" value={fmtMrr(p.churnedMrrCents)} color="#e3493c" bg="rgba(227,73,60,0.07)" />
        <MovementTile label="Expansion MRR" value={fmtMrr(p.expansionMrrCents)} color="#5e6ad2" bg="rgba(94,106,210,0.07)" />
      </div>

      {health && (
        <section
          className="mb-6 overflow-hidden rounded-sm bg-white"
          style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}
        >
          <div className="flex flex-wrap items-center gap-3 px-7 py-5" style={{ background: health.severity === "red" ? "#ffc1b6" : "#fff2a8", borderBottom: "1.5px solid #1c1c22" }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white text-[16px]" style={{ border: "1.5px solid #1c1c22" }}>
              {health.severity === "red" ? "🚨" : "⚠️"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-extrabold text-[#1c1c22]">−{fmtMrr(health.atRiskCents)} churned in 30d</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1c1c22]/60">Health signals · needs attention</p>
            </div>
          </div>
          <div className="space-y-2 px-7 py-5">
            {health.reasons.map((r) => (
              <div key={r.message} className="flex items-center gap-3 rounded-sm bg-white px-4 py-3" style={{ border: "1px solid #ebebeb" }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[12px] font-bold text-white" style={{ background: r.severity === "red" ? "#e3493c" : "#f2b030", border: "1px solid #1c1c22" }}>!</span>
                <span className="text-[13px] font-semibold text-lx-text">{r.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-sm bg-white" style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}>
        <div className="flex flex-wrap items-center gap-3 px-7 py-5" style={{ background: "#d4ffc9", borderBottom: "1.5px solid #1c1c22" }}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white text-[16px]" style={{ border: "1.5px solid #1c1c22" }}>🏁</span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-[#1c1c22]">{fmtMrr(milestone.prevCents)} → {fmtMrr(milestone.nextCents)} MRR</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1c1c22]/60">Next milestone · {milestone.crossed} crossed</p>
          </div>
          <span className="shrink-0 rounded-sm bg-white px-2.5 py-1 text-[13px] font-extrabold tabular-nums text-[#1c1c22]" style={{ border: "1.5px solid #1c1c22" }}>
            {milestone.pct.toFixed(0)}%
          </span>
        </div>
        <div className="px-7 py-5">
          <div className="h-3.5 overflow-hidden rounded-full bg-white" style={{ border: "1.5px solid #1c1c22" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(milestone.pct, 100)}%`, background: `repeating-linear-gradient(-45deg, ${color}, ${color} 8px, ${color}cc 8px, ${color}cc 16px)` }} />
          </div>
          <p className="mt-2 text-right text-[12px] font-medium text-lx-muted">{fmtMrr(milestone.toGoCents)} to go</p>
        </div>
      </section>
    </div>
  );
}

async function CustomersTab({ subs, connectionId, productLabel }: {
  subs: Awaited<ReturnType<typeof loadSubs>>;
  connectionId: string;
  productLabel: string;
}) {
  const [customers, activity] = await Promise.all([
    topCustomers(subs, 20),
    recentActivity(connectionId, 20),
  ]);
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <TopCustomersCard customers={customers} connectionId={connectionId} productLabel={productLabel} />
      </div>
      <div className="lg:col-span-2">
        <ActivityCard items={activity} />
      </div>
    </div>
  );
}

async function CohortsTab({ subs, color }: { subs: Awaited<ReturnType<typeof loadSubs>>; color: string }) {
  const cohorts = cohortRetention(subs).slice(-13);
  return (
    <section className="overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex items-baseline justify-between px-7 pb-3 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">MRR cohort retention</p>
        <p className="text-[11px] text-lx-faint">% of signup-month MRR still active</p>
      </div>
      <CohortGrid rows={cohorts} color={color} />
    </section>
  );
}

async function SegmentsTab({ subs, color }: { subs: Awaited<ReturnType<typeof loadSubs>>; color: string }) {
  return (
    <div className="space-y-4">
      <FunnelCard steps={lifecycleFunnel(subs)} color={color} />
      <SegmentCard title="Acquisition source" note="Only present when stamped onto the provider record" segments={segmentBySource(subs)} color={color} kind="source" />
      <div className="grid gap-4 lg:grid-cols-2">
        <SegmentCard title="By plan" segments={segmentByPlan(subs)} color={color} kind="plan" />
        <SegmentCard title="By country" segments={segmentByCountry(subs).slice(0, 8)} color={color} kind="country" />
      </div>
    </div>
  );
}

/* ============================================================ shared cards */

function Pill({ label, tint }: { label: string; tint: string }) {
  return (
    <span className="inline-flex items-center rounded-sm px-2 py-[3px] text-[11px] font-semibold" style={{ color: tint, background: `${tint}14`, border: `1px solid ${tint}2e` }}>
      {label}
    </span>
  );
}

function TopCustomersCard({ customers, connectionId, productLabel }: { customers: TopCustomer[]; connectionId: string; productLabel: string }) {
  const top = customers[0]?.mrrCents ?? 1;
  return (
    <section className="h-full overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex items-center justify-between px-7 pb-4 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Top customers</p>
        <a href="/api/export/customers" download className="text-[11px] font-medium text-[#5e6ad2] hover:opacity-70">Export CSV ↓</a>
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
                <tr key={i} className="group transition-colors hover:bg-lx-sidebar" style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td className="max-w-[220px] py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size={34} />
                      <div className="min-w-0">
                        {c.customerId ? (
                          <Link href={`/app/customers/${c.customerId}?connection=${connectionId}&name=${encodeURIComponent(c.name)}&pname=${encodeURIComponent(productLabel)}`} className="block truncate text-[13px] font-medium text-lx-text hover:text-lx-purple hover:underline">
                            {c.name}
                          </Link>
                        ) : (
                          <p className="truncate text-[13px] font-medium text-lx-text">{c.name}</p>
                        )}
                        <p className="flex items-center gap-1.5 truncate text-[11px] text-lx-faint">
                          {c.country && <CountryMark code={c.country} />}
                          {c.country ?? "—"}{c.source ? ` · ${c.source}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    {c.planName ? <Pill label={c.planName} tint={planTint(c.planName)} /> : <span className="text-[12px] text-lx-faint">—</span>}
                  </td>
                  <td className="py-2.5 text-right text-[12px] tabular-nums text-lx-muted">{c.tenureMonths.toFixed(0)} mo</td>
                  <td className="py-2.5 text-right text-[12px] tabular-nums text-lx-muted">{fmtMrr(c.ltdCents)}</td>
                  <td className="py-2.5 pl-3 text-right">
                    <p className="text-[13px] font-semibold tabular-nums text-lx-text">{fmtMrr(c.mrrCents)}</p>
                    <div className="ml-auto mt-1 h-[3px] w-14 overflow-hidden rounded-full" style={{ background: "#f0f0f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${(c.mrrCents / top) * 100}%`, background: planTint(c.planName) }} />
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
    <section className="h-full rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Recent activity</p>
      {items.length === 0 ? (
        <p className="text-[13px] text-lx-faint">No movements recorded yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((it, i) => {
            const style = EVENT_STYLE[it.eventType] ?? { color: "#9a9a9a", verb: it.eventType, glyph: "•", sign: "" };
            return (
              <div key={i} className="flex items-center gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-lx-sidebar">
                <div className="relative shrink-0">
                  <Avatar name={it.customerName} size={32} />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full text-[9px] font-bold leading-none text-white" style={{ background: style.color, border: "1.5px solid #ffffff" }}>
                    {style.glyph}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-lx-text"><span className="font-medium">{it.customerName}</span> <span className="text-lx-muted">{style.verb}</span></p>
                  <p className="truncate text-[11px] text-lx-faint">{it.planName ? `${it.planName} · ` : ""}{rel(it.occurredAt)}</p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold tabular-nums" style={{ color: style.color }}>{style.sign}{fmtMrr(it.amountCents)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatTile({ label, value, sub, valueColor, icon: Icon, accent }: {
  label: string; value: string; sub?: string; valueColor?: string;
  icon?: () => React.ReactElement; accent?: string;
}) {
  return (
    <div className="rounded-sm bg-white px-5 py-4 transition-transform hover:-translate-y-1" style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}>
      <div className="mb-2 flex items-center gap-2">
        {Icon && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm" style={{ background: accent ?? "#fff2a8", border: "1px solid #1c1c22" }}>
            <Icon />
          </span>
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      </div>
      <p className="text-[23px] font-extrabold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em", color: valueColor }}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-lx-faint">{sub}</p>}
    </div>
  );
}

function MovementTile({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-sm px-5 py-4" style={{ background: bg, border: `1px solid ${color}22` }}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color }}>{label}</p>
      <p className="text-[20px] font-bold tabular-nums" style={{ color, letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}
