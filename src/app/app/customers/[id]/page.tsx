import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/auth";
import { loadCustomerJourney } from "@/lib/analytics";
import { fmtMrr, productIcon } from "@/lib/format";
import { NotesSection } from "./notes-section";
import { Avatar } from "@/app/app/avatar";
import { SourceMark, CountryMark } from "@/app/app/segment-icons";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

const EVENT_STYLE: Record<string, { color: string; bg: string; glyph: string; label: string }> = {
  new: { color: "#0f9b6c", bg: "#d4ffc9", glyph: "+", label: "Subscribed" },
  reactivation: { color: "#0f9b6c", bg: "#d4ffc9", glyph: "↻", label: "Reactivated" },
  expansion: { color: "#5e6ad2", bg: "#c9f0ff", glyph: "↑", label: "Upgraded" },
  contraction: { color: "#8a6d1f", bg: "#fff2a8", glyph: "↓", label: "Downgraded" },
  churn: { color: "#c8392c", bg: "#ffc1b6", glyph: "×", label: "Canceled" },
};

export default async function CustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connection?: string }>;
}) {
  const { id } = await params;
  const { connection } = await searchParams;
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");
  if (!connection) redirect("/app");

  const j = await loadCustomerJourney(userId, connection, id);
  if (!j) redirect("/app");

  const activity = j.customerEmail
    ? await db.query.analyticsEvents.findMany({
        where: and(eq(analyticsEvents.connectionId, connection), eq(analyticsEvents.userId, j.customerEmail.toLowerCase())),
        orderBy: desc(analyticsEvents.occurredAt),
        limit: 30,
      })
    : [];

  const totalMrr = j.subs.filter((s) => ["active", "past_due"].includes(s.status)).reduce((s, x) => s + x.mrrCents, 0);
  const billed = j.subs.reduce((sum, s) => {
    const start = s.startedAt ? s.startedAt.getTime() : null;
    if (!start) return sum;
    const end = s.canceledAt ? s.canceledAt.getTime() : Date.now();
    const months = Math.max(0, (end - start) / (30.44 * 864e5));
    return sum + Math.round(s.mrrCents * months);
  }, 0);

  const earliest = j.subs
    .map((s) => s.startedAt?.getTime() ?? Infinity)
    .filter((t) => t !== Infinity);
  const since = earliest.length
    ? new Date(Math.min(...earliest)).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const trial = j.subs.some((s) => s.trialStartAt || s.trialEndAt);
  const active = j.subs.some((s) => ["active", "past_due"].includes(s.status));
  const churned = j.subs.length > 0 && !active;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Avatar name={j.customerName} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            {j.customerName}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-lx-muted">
            {j.customerEmail && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium" style={{ border: "1px solid #ebebeb" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
                {j.customerEmail}
              </span>
            )}
            {j.country && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium" style={{ border: "1px solid #ebebeb" }}>
                <CountryMark code={j.country} />
                {j.country}
              </span>
            )}
            {j.utmSource && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium" style={{ border: "1px solid #ebebeb" }}>
                <SourceMark source={j.utmSource} />
                via {j.utmSource}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium" style={{ border: "1px solid #ebebeb" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
              customer since {since}
            </span>
          </div>
        </div>
        <img
          src={productIcon(j.productLabel, j.provider)}
          alt={j.productLabel}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-sm object-cover"
          style={{ border: "1px solid #ebebeb" }}
          loading="lazy"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-sm bg-white px-5 py-4" style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-lx-faint">Current MRR</p>
          <p className="text-[23px] font-extrabold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>
            {fmtMrr(totalMrr)}
          </p>
        </div>
        <div className="rounded-sm bg-white px-5 py-4" style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-lx-faint">Total billed</p>
          <p className="text-[23px] font-extrabold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>
            {fmtMrr(billed)}
          </p>
        </div>
        <div className="rounded-sm bg-white px-5 py-4" style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-lx-faint">Status</p>
          <p className="text-[23px] font-extrabold text-lx-text" style={{ letterSpacing: "-0.02em" }}>
            {churned ? "Churned" : active ? "Active" : trial ? "Trial" : "Lead"}
          </p>
        </div>
      </div>

      {/* Journey */}
      <section className="mb-6 rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Customer journey</p>
        <JourneyFlow j={j} />
      </section>

      {/* Subscriptions */}
      <section className="mb-6 rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
          Subscriptions · {j.subs.length}
        </p>
        <div className="space-y-2">
          {j.subs.map((s, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-sm px-4 py-3"
              style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-lx-text">{s.planName ?? "No plan"}</span>
                <span className="mt-0.5 block text-[11px] capitalize text-lx-faint">
                  {s.status}
                  {s.interval ? ` · ${s.interval}ly` : ""}
                  {s.startedAt ? ` · since ${s.startedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-[13px] font-bold tabular-nums text-lx-text">{fmtMrr(s.mrrCents)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Activity */}
      <section className="rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
          Activity · {activity.length}
          {activity.length === 0 && (
            <span className="ml-2 font-normal normal-case text-lx-faint">
              — install the <a href="/app/connect" className="underline underline-offset-2 hover:text-lx-text">tracking script</a> to see behavioral data
            </span>
          )}
        </p>
        {activity.length > 0 && (
          <div className="space-y-1.5">
            {activity.map((e) => {
              const isPage = e.type === "page";
              const isIdentify = e.type === "identify";
              const icon = isIdentify ? "👤" : isPage ? "📄" : "⚡";
              const label = isIdentify
                ? `Identified as ${e.userId}`
                : isPage
                ? e.name || e.url || "Page view"
                : e.name || "Event";
              const fmtTime = e.occurredAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
              return (
                <div key={e.id} className="flex items-start gap-3 rounded-sm px-3 py-2.5" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
                  <span className="mt-px shrink-0 text-[14px]">{icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-lx-text">{label}</span>
                    {e.url && !isIdentify && (
                      <span className="block truncate text-[11px] text-lx-faint">{e.url}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[11px] text-lx-faint">{fmtTime}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Notes */}
      <NotesSection customerId={j.customerId} />
    </div>
  );
}

function JourneyFlow({ j }: { j: NonNullable<Awaited<ReturnType<typeof loadCustomerJourney>>> }) {
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const hasTrialEvent = j.events.some((e) => /trial/i.test(e.eventType));
  const trialSub = j.subs.find((s) => s.trialStartAt || s.trialEndAt);

  // Build ordered stages: lead → optional trial → paid plans (grouped) → churn (if any)
  const paidPlans = [...new Set(j.events.filter((e) => e.planName).map((e) => e.planName!))];
  if (paidPlans.length === 0) {
    for (const s of j.subs) if (s.planName && !paidPlans.includes(s.planName)) paidPlans.push(s.planName);
  }

  const paidEvents = j.events.filter((e) => ["new", "reactivation", "expansion", "contraction", "churn"].includes(e.eventType));
  const upgrades = paidEvents.filter((e) => e.eventType === "expansion" || e.eventType === "reactivation");
  const churnEvent = [...paidEvents].reverse().find((e) => e.eventType === "churn");

  const planMrr: Record<string, number> = {};
  for (const s of j.subs) {
    if (!s.planName) continue;
    planMrr[s.planName] = Math.max(planMrr[s.planName] ?? 0, s.mrrCents);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[560px] flex-col items-stretch gap-0">
        {/* Lead */}
        <div className="flex justify-center">
          <span className="rounded-sm bg-[#f0f0f0] px-2.5 py-1 text-[11px] font-semibold text-lx-muted">Lead</span>
        </div>
        <Connector />

        {/* Trial */}
        {(trialSub || hasTrialEvent) && (
          <>
            <NodeCard color="#0f9b6c" title="Free trial">
              {trialSub?.planName && (
                <NodeRow glyph="⌛" glyphBg="#e6f4ef" text={`Started free trial of ${trialSub.planName}`} amount={fmtMrr(0)} />
              )}
              {hasTrialEvent ? (
                j.events.filter((e) => /trial/i.test(e.eventType)).slice(0, 2).map((e, i) => (
                  <NodeRow key={i} glyph="⌛" glyphBg="#e6f4ef" text={e.eventType} amount={fmtMrr(e.amountCents)} sub={fmtDate(e.occurredAt)} />
                ))
              ) : (
                <NodeRow glyph="⌛" glyphBg="#e6f4ef" text={`Ended trial${trialSub?.trialEndAt ? ` · ${fmtDate(trialSub.trialEndAt)}` : ""}`} amount={fmtMrr(0)} />
              )}
            </NodeCard>
            <Connector color="#0f9b6c" />
          </>
        )}

        {/* Paid subscriptions */}
        {paidPlans.length > 0 ? (
          <div className={`grid gap-6 ${paidPlans.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {paidPlans.map((plan, i) => {
              const planEvts = paidEvents.filter((e) => e.planName === plan).slice(0, 3);
              const color = i === 0 ? "#5e6ad2" : "#0284c7";
              return (
                <NodeCard key={plan} color={color} title={i === 0 && paidPlans.length > 1 ? "Free subscription" : undefined}>
                  <NodeRow
                    glyph="★"
                    glyphBg={i === 0 ? "#efe9ff" : "#e0f2fe"}
                    glyphColor={color}
                    text={`Subscribed to ${plan}`}
                    amount={fmtMrr(planMrr[plan] ?? 0)}
                    bold
                  />
                  {planEvts
                    .filter((e) => e.eventType !== "new")
                    .map((e, k) => {
                      const st = EVENT_STYLE[e.eventType] ?? { color: "#9a9a9a", bg: "#f0f0f0", glyph: "•", label: e.eventType };
                      return (
                        <NodeRow
                          key={k}
                          glyph={st.glyph}
                          glyphBg={st.bg}
                          glyphColor={st.color}
                          text={`${st.label}${e.planName && e.planName !== plan ? ` · ${e.planName}` : ""}`}
                          amount={fmtMrr(e.amountCents)}
                          sub={fmtDate(e.occurredAt)}
                        />
                      );
                    })}
                </NodeCard>
              );
            })}
          </div>
        ) : (
          <NodeCard color="#9a9a9a">
            <NodeRow glyph="•" glyphBg="#f0f0f0" text="No paid subscription yet" amount="" />
          </NodeCard>
        )}

        {/* Upgrade path note */}
        {upgrades.length > 0 && paidPlans.length > 1 && (
          <div className="mt-4 flex justify-center">
            <span className="rounded-sm bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-semibold text-[#0284c7]">
              Upgraded · {upgrades.length}×
            </span>
          </div>
        )}

        {/* Churn */}
        {churnEvent && (
          <>
            <div className="mt-4 flex justify-center">
              <span className="rounded-sm bg-[#ffc1b6] px-2.5 py-1 text-[11px] font-semibold text-[#c8392c]">
                Churned · {fmtDate(churnEvent.occurredAt)}
              </span>
            </div>
          </>
        )}

        {/* Raw timeline fallback when there are many events */}
        {j.events.length > 6 && (
          <div className="mt-6 border-t pt-4" style={{ borderColor: "#f0f0f0" }}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">All events</p>
            <div className="space-y-1.5">
              {j.events.map((e, i) => {
                const st = EVENT_STYLE[e.eventType] ?? { color: "#9a9a9a", bg: "#f0f0f0", glyph: "•", label: e.eventType };
                return (
                  <div key={i} className="flex items-center gap-2.5 text-[12px]">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.glyph}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-lx-text">
                      <span className="font-medium">{st.label}</span>
                      {e.planName && <span className="text-lx-muted"> · {e.planName}</span>}
                    </span>
                    <span className="shrink-0 tabular-nums text-lx-muted">{fmtMrr(e.amountCents)}</span>
                    <span className="shrink-0 text-[11px] text-lx-faint">{fmtDate(e.occurredAt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Connector({ color = "#c9c4bb" }: { color?: string }) {
  return (
    <div className="flex justify-center" aria-hidden>
      <div style={{ width: 2, height: 18, background: color }} />
    </div>
  );
}

function NodeCard({ children, color, title }: { children: React.ReactNode; color: string; title?: string }) {
  return (
    <div>
      {title && (
        <div className="mb-1.5 flex justify-center sm:justify-start sm:pl-1">
          <span className="rounded-sm px-2 py-0.5 text-[11px] font-semibold" style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}>
            {title}
          </span>
        </div>
      )}
      <div className="rounded-sm bg-white px-5 py-3.5" style={{ border: `1.5px solid ${color}`, boxShadow: `3px 3px 0 ${color}55` }}>
        <div className="space-y-2.5">{children}</div>
      </div>
    </div>
  );
}

function NodeRow({
  glyph, glyphBg, glyphColor, text, amount, sub, bold,
}: {
  glyph: string; glyphBg: string; glyphColor?: string; text: string; amount: string; sub?: string; bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[12px] font-bold"
        style={{ background: glyphBg, color: glyphColor ?? "#5c5c5c" }}
      >
        {glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[13px] text-lx-text ${bold ? "font-bold" : "font-medium"}`}>{text}</span>
        {sub && <span className="block text-[11px] text-lx-faint">{sub}</span>}
      </span>
      <span className="shrink-0 text-[12px] tabular-nums text-lx-muted">{amount}</span>
    </div>
  );
}
