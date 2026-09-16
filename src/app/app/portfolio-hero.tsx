import { fmtMrr, providerLogo, type ShareableMetrics } from "@/lib/format";
import { TrendChart } from "./trend-chart";
import { CountUp } from "./count-up";

const PROVIDER_NAMES: Record<string, string> = {
  stripe: "Stripe",
  lemonsqueezy: "Lemon Squeezy",
  polar: "Polar",
  dodopayments: "DodoPayments",
  paystack: "Paystack",
};

export function PortfolioHero({
  metrics,
  series,
}: {
  metrics: ShareableMetrics;
  series: { date: string; value: number }[];
}) {
  const values = series.map((s) => s.value);
  const ready = values.length > 1;
  const first = ready ? values[0] : 0;
  const pct = ready && first > 0 ? ((values[values.length - 1] - first) / first) * 100 : 0;
  const up = pct >= 0;

  const providers = [...new Set(metrics.products.map((p) => p.provider))];
  const netNewPositive = metrics.netNewMrrCents >= 0;

  return (
    <section className="mb-4 overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-7 pb-6 pt-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">
            Monthly recurring revenue
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <CountUp
              value={metrics.totalMrrCents}
              kind="dollars"
              className="text-[42px] font-semibold leading-none tabular-nums text-lx-text sm:text-[48px]"
              style={{ letterSpacing: "-0.03em" }}
            />
            {ready && (
              <span
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold tabular-nums"
                style={{ color: up ? "#0f9b6c" : "#d0392c" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
                </svg>
                {Math.abs(pct).toFixed(1)}% · 90d
              </span>
            )}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-lx-muted">
            <span>
              Net new 30d{" "}
              <strong
                className="font-semibold tabular-nums"
                style={{ color: netNewPositive ? "#0f9b6c" : "#d0392c" }}
              >
                {netNewPositive ? "+" : "−"}{fmtMrr(Math.abs(metrics.netNewMrrCents))}
              </strong>
            </span>
            <Dot />
            <span>
              <strong className="font-semibold tabular-nums text-lx-text">{fmtMrr(metrics.totalArrCents)}</strong> ARR
            </span>
            <Dot />
            <span>
              <strong className="font-semibold tabular-nums text-lx-text">
                {metrics.totalActiveSubscriptions.toLocaleString()}
              </strong>{" "}
              subs
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-2" title={providers.join(" · ")}>
            <span className="flex items-center">
              {providers.map((provider, i) => (
                <img
                  key={provider}
                  src={providerLogo(provider)}
                  alt={provider}
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] rounded-full bg-white object-cover"
                  style={{ marginLeft: i === 0 ? 0 : -7, border: "2px solid #ffffff" }}
                  loading="lazy"
                />
              ))}
            </span>
            <span className="text-[11.5px] text-lx-muted">
              {providers.length === 1
                ? `via ${PROVIDER_NAMES[providers[0]] ?? providers[0]}`
                : `${providers.length} sources`}
            </span>
          </span>
          <p className="text-[11px] text-lx-faint">Last 90 days · all products</p>
        </div>
      </div>

      {ready ? (
        <TrendChart series={series} height={280} animate />
      ) : (
        <div
          className="mx-7 mb-7 flex h-[160px] items-center justify-center rounded-sm text-[13px] text-lx-faint"
          style={{ background: "#fafafa" }}
        >
          Sync daily to build your trend
        </div>
      )}

      {ready && (
        <div className="grid grid-cols-3" style={{ borderTop: "1px solid #f0f0f0" }}>
          <Foot label="Low" value={fmtMrr(Math.min(...values))} />
          <Foot label="Average" value={fmtMrr(Math.round(values.reduce((a, b) => a + b, 0) / values.length))} divider />
          <Foot label="High" value={fmtMrr(Math.max(...values))} divider />
        </div>
      )}
    </section>
  );
}

const Dot = () => <span className="text-lx-faint">·</span>;

function Foot({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className="px-7 py-3.5" style={divider ? { borderLeft: "1px solid #f0f0f0" } : undefined}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-lx-faint">{label}</p>
      <p className="mt-1 text-[14px] font-semibold tabular-nums text-lx-text">{value}</p>
    </div>
  );
}
