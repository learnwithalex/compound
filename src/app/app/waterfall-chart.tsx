import type { ProductMetrics } from "@/lib/metrics";

const fmt = (c: number) => {
  if (c === 0) return "$0";
  const abs = Math.abs(c);
  if (abs >= 100000) return `${c < 0 ? "-" : ""}$${(abs / 100000).toFixed(1)}k`;
  return `${c < 0 ? "-" : ""}$${(abs / 100).toFixed(0)}`;
};

export function WaterfallChart({ products }: { products: ProductMetrics[] }) {
  const newMrr = products.reduce((s, p) => s + p.newMrrCents, 0);
  const expansion = products.reduce((s, p) => s + p.expansionMrrCents, 0);
  const contraction = products.reduce((s, p) => s + p.contractionMrrCents, 0);
  const churned = products.reduce((s, p) => s + p.churnedMrrCents, 0);
  const net = newMrr + expansion - contraction - churned;

  const bars = [
    { label: "New MRR", value: newMrr, color: "#0f9b6c", bg: "#d4ffc9" },
    { label: "Expansion", value: expansion, color: "#5e6ad2", bg: "#ede9ff" },
    { label: "Contraction", value: -contraction, color: "#f59e0b", bg: "#fef9c3" },
    { label: "Churn", value: -churned, color: "#c8392c", bg: "#ffc1b6" },
  ];

  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.value)), 1);

  return (
    <div className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">MRR movement · 30d</p>
        <span
          className="text-[13px] font-bold tabular-nums"
          style={{ color: net >= 0 ? "#0f9b6c" : "#c8392c" }}
        >
          {net >= 0 ? "+" : ""}{fmt(net)}
        </span>
      </div>

      <div className="space-y-2.5">
        {bars.map((b) => {
          const pct = Math.round((Math.abs(b.value) / maxAbs) * 100);
          const isNeg = b.value < 0;
          return (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[12px] font-medium text-lx-muted">{b.label}</span>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: isNeg ? "#c8392c" : b.color }}>
                  {isNeg ? "" : "+"}{fmt(b.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: b.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="mt-4 text-[12px] text-lx-faint">No movement data yet. Run a sync to populate.</p>
      )}
    </div>
  );
}
