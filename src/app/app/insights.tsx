"use client";

import { fmtMrr } from "@/lib/format";
import { milestoneFor, type RadarSignal } from "@/lib/insights";
import { productIcon } from "@/lib/format";
import type { ProductMetrics } from "@/lib/metrics";

/* ============================================================ churn radar */

export function ChurnRadar({ signals }: { signals: RadarSignal[] }) {
  return (
    <section className="mb-4 rounded-2xl bg-white p-6" style={{ border: "1px solid #ddd9d0" }}>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
          Churn radar · {signals.length === 0 ? "all clear" : `${signals.length} signal${signals.length === 1 ? "" : "s"}`}
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            color: signals.length === 0 ? "#10b981" : "#e3493c",
            background: signals.length === 0 ? "rgba(16,185,129,0.1)" : "rgba(227,73,60,0.1)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
          {signals.length === 0 ? "Healthy" : "Needs attention"}
        </span>
      </div>
      {signals.length === 0 ? (
        <p className="text-[13px] text-lx-muted">
          No churn warnings across your portfolio. Growth is outpacing losses everywhere.
        </p>
      ) : (
        <div className="space-y-2">
          {signals.map((s, i) => (
            <div
              key={`${s.connectionId}-${i}`}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{
                background: s.severity === "red" ? "rgba(227,73,60,0.06)" : "rgba(242,176,48,0.08)",
                border: `1px solid ${s.severity === "red" ? "rgba(227,73,60,0.18)" : "rgba(242,176,48,0.25)"}`,
              }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="text-[13px] font-bold text-lx-text">{s.label}</span>
              <span className="text-[12px] text-lx-muted">{s.message}</span>
              <span
                className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-[0.08em]"
                style={{ color: s.severity === "red" ? "#e3493c" : "#b57e12" }}
              >
                {s.severity === "red" ? "▼ risk" : "◆ watch"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================ milestones */

export function Milestones({ products }: { products: ProductMetrics[] }) {
  const ranked = [...products].sort((a, b) => b.mrrCents - a.mrrCents);
  return (
    <section className="mb-10 rounded-2xl bg-white p-6" style={{ border: "1px solid #ddd9d0" }}>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lx-faint">
          Milestones
        </p>
        <span className="text-[12px] text-lx-faint">
          {ranked.reduce((s, p) => s + milestoneFor(p.mrrCents).crossed, 0)} crossed
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((p) => {
          const m = milestoneFor(p.mrrCents);
          const done = m.pct >= 100;
          return (
            <div key={p.connectionId} className="rounded-xl px-4 py-3.5" style={{ background: "#f7f5f1", border: "1px solid #ece9e3" }}>
              <div className="flex items-center gap-2">
                <img
                  src={productIcon(p.label, p.provider)}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-md object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-lx-text">{p.label}</span>
                {done ? (
                  <span className="text-[11px] font-bold text-lx-green">🎉 hit!</span>
                ) : (
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-lx-faint">{m.pct.toFixed(0)}%</span>
                )}
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full" style={{ background: "#ece9e3" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${done ? 100 : m.pct}%`, background: done ? "#10b981" : p.color }}
                />
              </div>
              <p className="mt-2 text-[11px] text-lx-muted">
                {done ? (
                  <><strong className="font-semibold text-lx-text">{fmtMrr(p.mrrCents)}</strong> — next stop <strong className="font-semibold text-lx-text">{fmtMrr(m.nextCents)}</strong></>
                ) : (
                  <><strong className="font-semibold tabular-nums text-lx-text">{fmtMrr(m.toGoCents)}</strong> to {fmtMrr(m.nextCents)} MRR</>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
