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
  segmentByPlan, segmentByCountry, segmentBySource, totalCollectedCents,
  type ActivityItem,
} from "@/lib/analytics";
import { ChartCard } from "@/app/app/trend-chart";
import { ProductOverview } from "./product-overview";
import { CohortGrid } from "@/app/app/cohort-grid";
import { SegmentCard, FunnelCard } from "@/app/app/report-cards";
import { IconMrr, IconArr, IconSubs, IconTrend, IconArpa, IconLtv, IconChurn, IconQuick } from "@/app/app/stat-icons";
import { TrackingTab } from "./tracking-tab";
import { AllCustomersTable } from "./customers-table";
import { AnalyticsNudgeBanner } from "@/app/app/analytics-nudge";
import { ProductSettingsTab } from "./settings-tab";

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

  // Analytics nudge — get or create tracker token, check if any events received
  let tracker = await db.query.trackerTokens.findFirst({ where: (t) => eq(t.connectionId, id) });
  if (!tracker) {
    const [created] = await db.insert(trackerTokens).values({ connectionId: id }).returning();
    tracker = created;
  }
  const [{ value: eventCount }] = await db.select({ value: count() }).from(analyticsEvents).where(eq(analyticsEvents.connectionId, id));
  const showNudge = Number(eventCount) === 0;

  const icon = productIcon(p.label, p.provider, p.websiteUrl, p.iconUrl);
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
    <div className="pb-20">
        {showNudge && tracker && (
          <AnalyticsNudgeBanner
            items={[{ connectionId: p.connectionId, label: p.label, provider: p.provider, token: tracker.token }]}
          />
        )}

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
            totalCollectedCents={totalCollectedCents(subs)}
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

        {tab === "settings" && (
          <ProductSettingsTab
            connectionId={id}
            label={p.label}
            websiteUrl={p.websiteUrl}
            iconUrl={p.iconUrl}
            provider={p.provider}
          />
        )}
    </div>
  );
}

/* ============================================================ tabs */

async function OverviewTab({ p, series, color, m, health, milestone, totalCollectedCents }: {
  p: NonNullable<Awaited<ReturnType<typeof singleProductMetrics>>>["product"];
  series: { date: string; value: number }[];
  color: string; up: boolean; down: boolean;
  m: ReturnType<typeof coreMetrics>;
  health: ReturnType<typeof radarSignals>[0];
  milestone: ReturnType<typeof milestoneFor>;
  totalCollectedCents: number;
}) {
  return (
    <div>
      {/* Main chart card — reference-style */}
      <div className="mb-6">
        <ProductOverview
          productName={p.label}
          series={series}
          color={color}
          mrr={p.mrrCents}
          arr={p.arrCents}
          activeSubs={p.activeSubscriptions}
          mrrChange30d={p.mrrChange30d}
          arpaCents={m.arpaCents}
          ltvCents={m.ltvCents}
          monthlyChurnPct={m.monthlyChurnPct}
          quickRatio={m.quickRatio}
          newMrrCents={p.newMrrCents}
          churnedMrrCents={p.churnedMrrCents}
          expansionMrrCents={p.expansionMrrCents}
          totalCollectedCents={totalCollectedCents}
        />
      </div>

      {health && (
        <section
          className="mb-6 overflow-hidden rounded-xl bg-white"
          style={{ border: "1px solid #ebebeb" }}
        >
          <div className="flex flex-wrap items-center gap-3 px-6 py-4" style={{ background: health.severity === "red" ? "rgba(227,73,60,0.06)" : "rgba(242,176,48,0.06)", borderBottom: "1px solid #f0f0f0" }}>
            <span className="text-[16px]">{health.severity === "red" ? "🚨" : "⚠️"}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#1c1c22]">−{fmtMrr(health.atRiskCents)} churned in 30d</p>
              <p className="text-[11px] text-[#8a8a8a]">Health signals · needs attention</p>
            </div>
          </div>
          <div className="space-y-1.5 px-6 py-4">
            {health.reasons.map((r) => (
              <div key={r.message} className="flex items-center gap-3 rounded-lg px-4 py-2.5" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.severity === "red" ? "#e3493c" : "#f2b030" }} />
                <span className="text-[13px] text-[#3d3d3d]">{r.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #ebebeb" }}>
        <div className="flex flex-wrap items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <span className="text-[16px]">🏁</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#1c1c22]">{fmtMrr(milestone.prevCents)} → {fmtMrr(milestone.nextCents)} MRR</p>
            <p className="text-[11px] text-[#8a8a8a]">Next milestone · {milestone.crossed} crossed</p>
          </div>
          <span className="shrink-0 rounded-md px-2.5 py-1 text-[13px] font-semibold tabular-nums" style={{ background: "#eff0fb", color: "#5e6ad2" }}>
            {milestone.pct.toFixed(0)}%
          </span>
        </div>
        <div className="px-6 py-4">
          <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(milestone.pct, 100)}%`, background: color }} />
          </div>
          <p className="mt-2 text-right text-[12px] text-[#8a8a8a]">{fmtMrr(milestone.toGoCents)} to go</p>
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
    topCustomers(subs, 500),
    recentActivity(connectionId, 15),
  ]);
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <AllCustomersTable customers={customers} connectionId={connectionId} productLabel={productLabel} />
      </div>
      <div className="lg:col-span-1">
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
