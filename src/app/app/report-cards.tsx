import { fmtMrr } from "@/lib/metrics";
import type { Segment, FunnelStep } from "@/lib/analytics";
import { SourceMark, CountryMark, PlanMark, FunnelMark, planTint } from "./segment-icons";

function Mark({ kind, seg, color }: { kind?: SegmentKind; seg: Segment; color: string }) {
  if (kind === "source") return <SourceMark source={seg.key} />;
  if (kind === "country") return <CountryMark code={seg.key} />;
  if (kind === "plan") return <PlanMark plan={seg.key} tint={planTint(seg.key)} />;
  if (kind === "product") {
    if (!seg.icon) return <PlanMark plan={seg.key} tint={color} />;
    return (
      <img
        src={seg.icon}
        alt=""
        width={19}
        height={19}
        className="h-[19px] w-[19px] shrink-0 rounded-[5px] object-cover"
        style={{ border: "1px solid #ece9e3" }}
      />
    );
  }
  return null;
}

export type SegmentKind = "source" | "country" | "plan" | "product";

export function SegmentCard({
  title, segments, note, color = "#5e6ad2", kind,
}: { title: string; segments: Segment[]; note?: string; color?: string; kind?: SegmentKind }) {
  return (
    <section className="rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">{title}</p>
      {note && <p className="mt-1 text-[11px] text-lx-faint">{note}</p>}
      <div className="mt-5 space-y-3">
        {segments.length === 0 && <p className="text-[13px] text-lx-faint">No data yet.</p>}
        {segments.map((s) => (
          <div key={s.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <Mark kind={kind} seg={s} color={color} />
                <span className="truncate text-[13px] font-medium capitalize text-lx-text">{s.key}</span>
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-lx-muted">
                {fmtMrr(s.mrrCents)} · {s.pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${s.pct}%`,
                  background: s.key === "Unattributed" ? "#c9c4bb" : kind === "plan" ? planTint(s.key) : color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FunnelCard({ steps, color = "#5e6ad2" }: { steps: FunnelStep[]; color?: string }) {
  return (
    <section className="rounded-2xl bg-white p-7" style={{ border: "1px solid #ddd9d0" }}>
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">Subscription lifecycle</p>
      <div className="space-y-3">
        {steps.map((f) => (
          <div key={f.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <FunnelMark label={f.label} tint={color} />
                <span className="truncate text-[13px] font-medium text-lx-text">{f.label}</span>
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-lx-muted">
                {f.count.toLocaleString()} · {f.pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
              <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
