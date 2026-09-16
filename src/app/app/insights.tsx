"use client";

import { fmtMrr } from "@/lib/format";
import type { RadarSignal } from "@/lib/insights";
import { productIcon } from "@/lib/format";

/* ============================================================ churn radar */

export function ChurnRadar({ signals }: { signals: RadarSignal[] }) {
  const clear = signals.length === 0;
  const totalAtRisk = signals.reduce((sum, s) => sum + s.atRiskCents, 0);

  return (
    <section className="mb-4 rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 pb-4 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">
          Churn radar · {clear ? "all clear" : `${signals.length} product${signals.length === 1 ? "" : "s"}`}
        </p>
        <span
          className="text-[11.5px] font-semibold tabular-nums"
          style={{ color: clear ? "#0f9b6c" : "#c8392c" }}
        >
          {clear ? "Healthy" : `${fmtMrr(totalAtRisk)} churned in 30d`}
        </span>
      </div>

      {clear ? (
        <p className="px-6 pb-5 text-[13px] text-lx-muted">
          No churn warnings across your portfolio. Growth is outpacing losses everywhere.
        </p>
      ) : (
        <div>
          {signals.map((s) => (
            <a
              key={s.connectionId}
              href={`/app/products/${s.connectionId}?name=${encodeURIComponent(s.label)}`}
              className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#fafafa]"
              style={{ borderTop: "1px solid #f0f0f0" }}
            >
              <img
                src={productIcon(s.label, s.provider)}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-sm bg-white object-cover"
                style={{ border: "1px solid #ebebeb" }}
                loading="lazy"
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-lx-text">{s.label}</span>
                <span className="block truncate text-[11.5px] text-lx-faint">
                  {s.reasons.map((r) => r.message).join(" · ")}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-[13.5px] font-semibold tabular-nums" style={{ color: "#c8392c" }}>
                  −{fmtMrr(s.atRiskCents)}
                </span>
                <span className="block text-[10.5px] text-lx-faint">
                  {s.netCents > 0 ? `${fmtMrr(s.netCents)} net loss` : "churned MRR · 30d"}
                </span>
              </span>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c4c4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
