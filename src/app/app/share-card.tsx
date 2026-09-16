"use client";
import { useRef, useState } from "react";
import { fmtMrr, fmtDollars, productIcon, providerLogo, type ShareableMetrics } from "@/lib/format";

export type CardTheme = "cream" | "dark" | "purple" | "mint";
export type MetricChoice = "mrr" | "arr" | "subs";

const THEMES: Record<CardTheme, { bg: string; fg: string; sub: string; faint: string; border: string; label: string }> = {
  cream:  { bg: "#fbf9f5", fg: "#1a1a1a", sub: "#5c5856", faint: "#9c9894", border: "#ddd9d0", label: "Cream" },
  dark:   { bg: "#1a1a2e", fg: "#ffffff", sub: "rgba(255,255,255,0.65)", faint: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)", label: "Midnight" },
  purple: { bg: "#5e6ad2", fg: "#ffffff", sub: "rgba(255,255,255,0.75)", faint: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.2)", label: "Brand" },
  mint:   { bg: "#0e3d2d", fg: "#f4f0e8", sub: "rgba(244,240,232,0.7)", faint: "rgba(244,240,232,0.45)", border: "rgba(244,240,232,0.15)", label: "Forest" },
};

const THEME_ORDER: CardTheme[] = ["cream", "dark", "purple", "mint"];

const METRICS: { id: MetricChoice; label: string }[] = [
  { id: "mrr", label: "MRR" },
  { id: "arr", label: "ARR" },
  { id: "subs", label: "Subs" },
];

const DIAGONAL =
  "repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(0,0,0,0.028) 14px, rgba(0,0,0,0.028) 15px)";

export function ShareCard({ metrics }: { metrics: ShareableMetrics }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<CardTheme>("cream");
  const [metric, setMetric] = useState<MetricChoice>("mrr");
  const [included, setIncluded] = useState<string[]>(metrics.products.map((p) => p.connectionId));
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const visible = metrics.products.filter((p) => included.includes(p.connectionId));
  const visibleTotal = visible.reduce((s, p) => s + p.mrrCents, 0);
  const visibleSubs = visible.reduce((s, p) => s + p.activeSubscriptions, 0);

  const heroValue =
    metric === "mrr" ? fmtDollars(visibleTotal) :
    metric === "arr" ? fmtMrr(visibleTotal * 12) :
    visibleSubs.toLocaleString();

  const heroLabel =
    metric === "mrr" ? "Monthly recurring revenue" :
    metric === "arr" ? "Annual run rate" :
    "Active subscriptions";

  const t = THEMES[theme];
  const netNewPositive = metrics.netNewMrrCents >= 0;

  function toggle(id: string) {
    setIncluded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function copyLink() {
    const params = new URLSearchParams({
      theme,
      metric,
      products: included.join(","),
    });
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/app?${params}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-sm bg-white px-5 py-3.5 text-left transition-colors hover:bg-[#fafafa]"
        style={{ border: "1px solid #ebebeb" }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm" style={{ background: "#f4f4f5", border: "1px solid #ebebeb" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6f6a63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-lx-text">Share card</span>
          <span className="block text-[11.5px] text-lx-muted">
            Post your numbers — pick a theme, choose which products to include.
          </span>
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b4b4b4" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {!open ? null : (
      <div className="mt-3">
      {/* Card */}
      <div
        className="overflow-hidden rounded-sm"
        style={{
          border: theme === "cream" ? "1.5px solid #c9c4b8" : `1px solid ${t.border}`,
          background: t.bg,
          backgroundImage: theme === "cream" ? DIAGONAL : undefined,
        }}
      >
        <div ref={cardRef} className="p-8 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: t.faint }}>
              {heroLabel}
            </span>
            <span
              className="flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3 shadow-sm"
              style={{
                background: theme === "cream" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.1)",
                border: `1px solid ${t.border}`,
                backdropFilter: "blur(6px)",
              }}
              title={[...new Set(visible.map((p) => p.provider))].join(" · ")}
            >
              <span className="flex items-center">
                {[...new Set(visible.map((p) => p.provider))].map((provider, i) => (
                  <img
                    key={provider}
                    src={providerLogo(provider)}
                    alt={provider}
                    width={26}
                    height={26}
                    className="h-[26px] w-[26px] rounded-full bg-white object-cover"
                    style={{ marginLeft: i === 0 ? 0 : -9, border: `2px solid #ffffff`, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
                    loading="lazy"
                  />
                ))}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: t.sub }}>
                {(() => {
                  const names: Record<string, string> = { stripe: "Stripe", lemonsqueezy: "Lemon Squeezy", polar: "Polar", dodopayments: "DodoPayments", paystack: "Paystack" };
                  const providers = [...new Set(visible.map((p) => p.provider))];
                  return providers.length === 1
                    ? `via ${names[providers[0]] ?? providers[0]}`
                    : `${providers.length} sources`;
                })()}
              </span>
            </span>
          </div>

          <p className="text-[56px] font-bold tabular-nums leading-none tracking-tight sm:text-[72px]" style={{ color: t.fg, letterSpacing: "-0.035em" }}>
            {heroValue}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]" style={{ color: t.sub }}>
            <span>
              Net new 30d{" "}
              <strong className="font-semibold tabular-nums" style={{ color: netNewPositive ? (theme === "cream" ? "#10b981" : "#34d399") : "#e3493c" }}>
                {netNewPositive ? "+" : "-"}{fmtMrr(Math.abs(metrics.netNewMrrCents))}
              </strong>
            </span>
            <span><strong className="font-semibold tabular-nums" style={{ color: t.fg }}>{visibleSubs.toLocaleString()}</strong> subs</span>
            <span>{visible.length} of {metrics.products.length} products</span>
          </div>

          {/* Contribution bar */}
          {visible.length > 0 && (
            <div className="mt-7">
              <div
                className="flex h-2 overflow-hidden rounded-full"
                style={{ background: theme === "cream" ? "#ebebeb" : "rgba(255,255,255,0.12)" }}
              >
                {visible.map((p) => (
                  <div key={p.connectionId} title={`${p.label} — ${fmtMrr(p.mrrCents)}`} style={{ flex: Math.max(p.mrrCents, 0), background: p.color, minWidth: p.mrrCents > 0 ? 4 : 0 }} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {visible.map((p) => (
                  <span key={p.connectionId} className="flex items-center gap-1.5 text-[11px]" style={{ color: t.sub }}>
                    <img
                      src={productIcon(p.label, p.provider)}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    {p.label}
                    <span className="tabular-nums" style={{ color: t.faint }}>{fmtMrr(p.mrrCents)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-sm bg-white px-5 py-3.5" style={{ border: "1px solid #ebebeb" }}>
        {/* Metric picker */}
        <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: "#f4f4f5", border: "1px solid #ebebeb" }}>
          {METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-all ${metric === m.id ? "bg-white text-lx-text shadow-sm" : "text-lx-faint hover:text-lx-muted"}`}
              style={metric === m.id ? { border: "1px solid #ebebeb" } : { border: "1px solid transparent" }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Theme swatches */}
        <div className="flex items-center gap-1.5">
          {THEME_ORDER.map((th) => (
            <button
              key={th}
              title={THEMES[th].label}
              onClick={() => setTheme(th)}
              className="h-6 w-6 rounded-full transition-transform hover:scale-110"
              style={{
                background: THEMES[th].bg,
                border: theme === th ? "2px solid #5e6ad2" : "1px solid #ebebeb",
                outline: theme === th ? "2px solid rgba(94,106,210,0.25)" : "none",
                outlineOffset: 1,
              }}
            />
          ))}
        </div>

        {/* Product filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {metrics.products.map((p) => {
            const on = included.includes(p.connectionId);
            return (
              <button
                key={p.connectionId}
                onClick={() => toggle(p.connectionId)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${on ? "text-lx-text" : "text-lx-faint line-through opacity-60"}`}
                style={{ background: on ? "#f4f4f5" : "transparent", border: "1px solid #ebebeb" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                {p.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={copyLink}
          className="ml-auto flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#5e6ad2" }}
        >
          {copied ? "Copied ✓" : "Copy share link"}
        </button>
      </div>
      </div>
      )}
    </section>
  );
}
