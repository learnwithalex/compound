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

const REVENUE_EVENT_STYLE: Record<string, { color: string; bg: string; glyph: string; label: string }> = {
  new: { color: "#0f9b6c", bg: "#d4ffc9", glyph: "+", label: "Subscribed" },
  reactivation: { color: "#0f9b6c", bg: "#d4ffc9", glyph: "↻", label: "Reactivated" },
  expansion: { color: "#5e6ad2", bg: "#ede9ff", glyph: "↑", label: "Upgraded" },
  contraction: { color: "#8a6d1f", bg: "#fff2a8", glyph: "↓", label: "Downgraded" },
  churn: { color: "#c8392c", bg: "#ffc1b6", glyph: "×", label: "Canceled" },
};

type AnalyticsRow = typeof analyticsEvents.$inferSelect;

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

  const activity: AnalyticsRow[] = j.customerEmail
    ? await db.query.analyticsEvents.findMany({
        where: and(eq(analyticsEvents.connectionId, connection), eq(analyticsEvents.userId, j.customerEmail.toLowerCase())),
        orderBy: desc(analyticsEvents.occurredAt),
        limit: 100,
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

  const active = j.subs.some((s) => ["active", "past_due"].includes(s.status));
  const churned = j.subs.length > 0 && !active;
  const trial = j.subs.some((s) => s.trialStartAt || s.trialEndAt);

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
        <StatCard label="Current MRR" value={fmtMrr(totalMrr)} />
        <StatCard label="Total billed" value={fmtMrr(billed)} />
        <StatCard label="Status" value={churned ? "Churned" : active ? "Active" : trial ? "Trial" : "Lead"} />
      </div>

      {/* Unified journey timeline */}
      <section className="mb-6 rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Customer journey</p>
        <JourneyTimeline j={j} activity={activity} />
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

      {/* Notes */}
      <NotesSection customerId={j.customerId} />
    </div>
  );
}

/* ─── stat card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-white px-5 py-4" style={{ border: "1.5px solid #1c1c22", boxShadow: "3px 3px 0 #1c1c22" }}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      <p className="text-[23px] font-extrabold tabular-nums text-lx-text" style={{ letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}

/* ─── unified journey timeline ───────────────────────────────────────────── */

type RevenueEvt = NonNullable<Awaited<ReturnType<typeof loadCustomerJourney>>>["events"][0];
type SubEvt = NonNullable<Awaited<ReturnType<typeof loadCustomerJourney>>>["subs"][0];

type TimelineItem =
  | { kind: "first-touch"; time: Date; url: string | null; referrer?: string | null }
  | { kind: "session"; time: Date; endTime: Date; sessionId: string; pages: AnalyticsRow[]; tracks: AnalyticsRow[] }
  | { kind: "identify"; time: Date; email: string }
  | { kind: "subscription"; time: Date; sub: SubEvt; isNew: boolean }
  | { kind: "revenue-event"; time: Date; evt: RevenueEvt };

function buildTimeline(
  j: NonNullable<Awaited<ReturnType<typeof loadCustomerJourney>>>,
  activity: AnalyticsRow[],
): TimelineItem[] {
  const items: TimelineItem[] = [];
  const chronological = [...activity].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  // Group tracking events by session
  const sessionMap = new Map<string, AnalyticsRow[]>();
  for (const ev of chronological) {
    const sid = ev.sessionId ?? "__anon__";
    if (!sessionMap.has(sid)) sessionMap.set(sid, []);
    sessionMap.get(sid)!.push(ev);
  }

  let firstTouchAdded = false;
  for (const [sid, evts] of sessionMap) {
    const pages = evts.filter((e) => e.type === "page");
    const tracks = evts.filter((e) => e.type === "track");
    const identifies = evts.filter((e) => e.type === "identify");
    const first = evts[0];
    const last = evts[evts.length - 1];

    if (!firstTouchAdded && pages.length > 0) {
      items.push({ kind: "first-touch", time: first.occurredAt, url: first.url });
      firstTouchAdded = true;
      // Don't also add a session for this single first page if it's the only page
      if (evts.length === 1) continue;
      // Drop the first event from session so we don't double-count
      const rest = evts.slice(1);
      if (rest.length > 0) {
        const restPages = rest.filter((e) => e.type === "page");
        const restTracks = rest.filter((e) => e.type === "track");
        if (restPages.length > 0 || restTracks.length > 0) {
          items.push({ kind: "session", time: rest[0].occurredAt, endTime: last.occurredAt, sessionId: sid, pages: restPages, tracks: restTracks });
        }
      }
    } else {
      if (pages.length > 0 || tracks.length > 0) {
        items.push({ kind: "session", time: first.occurredAt, endTime: last.occurredAt, sessionId: sid, pages, tracks });
      }
    }

    for (const id of identifies) {
      items.push({ kind: "identify", time: id.occurredAt, email: id.userId ?? "" });
    }
  }

  // Revenue events (in chronological order)
  for (const evt of j.events) {
    items.push({ kind: "revenue-event", time: evt.occurredAt, evt });
  }

  // Subscriptions that have no corresponding revenue events
  const coveredByEvents = new Set(j.events.map((e) => e.planName));
  for (const sub of j.subs) {
    if (sub.startedAt) {
      const alreadyCovered = j.events.some((e) => e.eventType === "new" && e.planName === sub.planName);
      if (!alreadyCovered) {
        items.push({ kind: "subscription", time: sub.startedAt, sub, isNew: true });
      }
      if (sub.canceledAt) {
        items.push({ kind: "subscription", time: sub.canceledAt, sub, isNew: false });
      }
    }
  }

  return items.sort((a, b) => a.time.getTime() - b.time.getTime());
}

function fmtTime(d: Date) {
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function prettyUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.pathname === "/" ? u.hostname : u.pathname;
  } catch {
    return url;
  }
}

function JourneyTimeline({
  j,
  activity,
}: {
  j: NonNullable<Awaited<ReturnType<typeof loadCustomerJourney>>>;
  activity: AnalyticsRow[];
}) {
  const items = buildTimeline(j, activity);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-[13px] text-lx-faint">
        No journey data yet — install the tracking script to capture behavioral events.
      </div>
    );
  }

  return (
    <div className="relative pl-7">
      {/* Vertical rail */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: "#e8e4de" }} aria-hidden />

      <div className="space-y-5">
        {items.map((item, i) => {
          if (item.kind === "first-touch") {
            return (
              <TLRow
                key={i}
                dot={{ color: "#a8a3f8", bg: "#ede9ff" }}
                glyph={
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                }
                time={fmtTime(item.time)}
                label="First touch"
                meta={prettyUrl(item.url) ?? undefined}
                badge={{ text: "Lead", color: "#a8a3f8", bg: "#ede9ff" }}
              />
            );
          }

          if (item.kind === "session") {
            const duration = item.endTime.getTime() - item.time.getTime();
            const uniquePages = [...new Set(item.pages.map((p) => prettyUrl(p.url)).filter(Boolean))];
            const trackNames = [...new Set(item.tracks.map((t) => t.name).filter(Boolean))];
            return (
              <TLRow
                key={i}
                dot={{ color: "#9a9a9a", bg: "#f0f0f0" }}
                glyph={
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                }
                time={fmtTime(item.time)}
                label={
                  item.pages.length > 0
                    ? `Browsed ${item.pages.length} page${item.pages.length !== 1 ? "s" : ""}`
                    : `${item.tracks.length} event${item.tracks.length !== 1 ? "s" : ""}`
                }
                meta={
                  uniquePages.length > 0
                    ? uniquePages.slice(0, 3).join("  ·  ") + (uniquePages.length > 3 ? `  +${uniquePages.length - 3}` : "")
                    : trackNames.slice(0, 3).join("  ·  ") || undefined
                }
                side={duration > 1000 ? fmtDuration(duration) : undefined}
              />
            );
          }

          if (item.kind === "identify") {
            return (
              <TLRow
                key={i}
                dot={{ color: "#5e6ad2", bg: "#ede9ff" }}
                glyph={
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                }
                time={fmtTime(item.time)}
                label="Identified"
                meta={item.email}
                badge={{ text: "Known", color: "#5e6ad2", bg: "#ede9ff" }}
              />
            );
          }

          if (item.kind === "subscription") {
            return (
              <TLRow
                key={i}
                dot={{ color: "#0f9b6c", bg: "#d4ffc9" }}
                glyph={
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                }
                time={fmtTime(item.time)}
                label={item.isNew ? `Subscribed to ${item.sub.planName ?? "plan"}` : `Canceled ${item.sub.planName ?? "subscription"}`}
                meta={item.isNew ? fmtMrr(item.sub.mrrCents) + (item.sub.interval ? ` / ${item.sub.interval}` : "") : undefined}
                badge={item.isNew
                  ? { text: "Converted", color: "#0f9b6c", bg: "#d4ffc9" }
                  : { text: "Churned", color: "#c8392c", bg: "#ffc1b6" }}
              />
            );
          }

          if (item.kind === "revenue-event") {
            const st = REVENUE_EVENT_STYLE[item.evt.eventType] ?? { color: "#9a9a9a", bg: "#f0f0f0", glyph: "•", label: item.evt.eventType };
            return (
              <TLRow
                key={i}
                dot={{ color: st.color, bg: st.bg }}
                glyph={<span style={{ fontSize: 11, fontWeight: 700 }}>{st.glyph}</span>}
                time={fmtTime(item.time)}
                label={`${st.label}${item.evt.planName ? ` · ${item.evt.planName}` : ""}`}
                meta={item.evt.amountCents ? fmtMrr(item.evt.amountCents) : undefined}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function TLRow({
  dot,
  glyph,
  time,
  label,
  meta,
  badge,
  side,
}: {
  dot: { color: string; bg: string };
  glyph: React.ReactNode;
  time: string;
  label: string;
  meta?: string;
  badge?: { text: string; color: string; bg: string };
  side?: string;
}) {
  return (
    <div className="relative flex items-start gap-3">
      {/* Dot */}
      <span
        className="relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
        style={{ background: dot.bg, color: dot.color, border: `1.5px solid ${dot.color}` }}
      >
        {glyph}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-lx-text">{label}</span>
          {badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.text}
            </span>
          )}
          {meta && !badge && (
            <span className="text-[12px] font-medium text-lx-muted">{meta}</span>
          )}
        </div>
        {meta && badge && (
          <p className="mt-0.5 text-[12px] text-lx-faint truncate">{meta}</p>
        )}
      </div>

      {/* Time + side */}
      <div className="shrink-0 text-right">
        <span className="text-[11px] text-lx-faint">{time}</span>
        {side && <p className="text-[11px] text-lx-muted">{side}</p>}
      </div>
    </div>
  );
}
