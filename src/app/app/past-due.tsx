import { fmtMrr, productIcon } from "@/lib/format";
import type { PortfolioMetrics } from "@/lib/metrics";

export function PastDueTracker({ products }: { products: PortfolioMetrics["products"] }) {
  const pastDue = products
    .filter((p) => p.pastDueMrrCents > 0)
    .sort((a, b) => b.pastDueMrrCents - a.pastDueMrrCents);

  const total = pastDue.reduce((s, p) => s + p.pastDueMrrCents, 0);
  if (total === 0) return null;

  return (
    <section className="mb-4 rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 pb-4 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">
          Failed payments · {pastDue.length} product{pastDue.length !== 1 ? "s" : ""}
        </p>
        <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: "#f59e0b" }}>
          {fmtMrr(total)} at risk
        </span>
      </div>
      {pastDue.map((p) => (
        <a
          key={p.connectionId}
          href={`/app/products/${p.connectionId}?name=${encodeURIComponent(p.label)}`}
          className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#fafafa]"
          style={{ borderTop: "1px solid #f0f0f0" }}
        >
          <img
            src={productIcon(p.label, p.provider)}
            alt=""
            width={28} height={28}
            className="h-7 w-7 shrink-0 rounded-sm object-cover"
            style={{ border: "1px solid #ebebeb" }}
            loading="lazy"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-lx-text">{p.label}</span>
            <span className="block text-[11.5px] text-lx-faint">Payment failing — dunning in progress</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-[13.5px] font-semibold tabular-nums" style={{ color: "#f59e0b" }}>
              {fmtMrr(p.pastDueMrrCents)}
            </span>
            <span className="block text-[10.5px] text-lx-faint">past due MRR</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4c4c4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </a>
      ))}
      <p className="px-6 pb-4 pt-2 text-[11px] leading-relaxed text-lx-faint">
        These subscriptions have failed payments but haven&apos;t canceled yet. Recovery depends on your dunning settings.
      </p>
    </section>
  );
}
