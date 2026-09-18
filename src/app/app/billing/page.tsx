"use client";
import { useEffect, useState } from "react";

const FREE_FEATURES = [
  { label: "1 product", included: true },
  { label: "30-day history", included: true },
  { label: "Basic analytics", included: true },
  { label: "Unlimited products", included: false },
  { label: "Full history & charts", included: false },
  { label: "AI briefings", included: false },
];

const PRO_FEATURES = [
  "Unlimited products",
  "Full history & trend charts",
  "AI briefings & weekly digest",
  "Goals, streaks & milestones",
  "Auto-sync every 30s",
  "Customer profiles & cohorts",
];

export default function BillingPage() {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.ok ? r.json() : { isPro: false })
      .then((d) => setIsPro(d.isPro))
      .catch(() => setIsPro(false));
  }, []);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  if (isPro === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Billing</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
          {isPro ? "You're on Pro" : "Choose your plan"}
        </h1>
        <p className="mt-1 text-[13px] text-lx-muted">
          {isPro
            ? "Full access to all features. Manage your subscription below."
            : "Start free, upgrade when you're ready to scale."}
        </p>
      </div>

      {isPro ? <ProView /> : <PricingGrid onUpgrade={upgrade} loading={loading} />}
    </div>
  );
}

function PricingGrid({ onUpgrade, loading }: { onUpgrade: () => void; loading: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Free card */}
      <div className="flex flex-col rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px] font-bold text-lx-text">Free Trial</span>
            <span
              className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
              style={{ background: "#fff8e6", color: "#d97706", border: "1px solid #fde68a" }}
            >
              Current
            </span>
          </div>
          <p className="text-[32px] font-bold text-lx-text" style={{ letterSpacing: "-0.03em" }}>
            $0<span className="text-[15px] font-normal text-lx-faint">/mo</span>
          </p>
        </div>

        <ul className="flex-1 space-y-3">
          {FREE_FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-2.5">
              {f.included ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,8 6,12 14,4" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#d0d0d0" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              )}
              <span className={`text-[13px] ${f.included ? "text-lx-text" : "text-lx-faint"}`}>{f.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-sm py-2.5 text-center text-[13px] font-semibold text-lx-faint" style={{ background: "#f5f5f4", border: "1px solid #ebebeb" }}>
          Your current plan
        </div>
      </div>

      {/* Pro card */}
      <div
        className="flex flex-col rounded-sm p-7 text-white"
        style={{ background: "linear-gradient(135deg, #5e6ad2 0%, #4a54c0 100%)" }}
      >
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[15px] font-bold">Compound Pro</span>
            <span
              className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              Recommended
            </span>
          </div>
          <p className="text-[32px] font-bold" style={{ letterSpacing: "-0.03em" }}>
            $9<span className="text-[15px] font-normal opacity-70">/mo</span>
          </p>
        </div>

        <ul className="flex-1 space-y-3">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,8 6,12 14,4" />
              </svg>
              <span className="text-[13px] text-white/90">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          <button
            onClick={onUpgrade}
            disabled={loading}
            className="w-full rounded-sm py-2.5 text-[13px] font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: "white", color: "#5e6ad2" }}
          >
            {loading ? "Redirecting…" : "Upgrade to Pro →"}
          </button>
          <p className="text-center text-[11px] text-white/50">Powered by DodoPayments · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}

function ProView() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Active plan card */}
      <div
        className="rounded-sm p-7 text-white"
        style={{ background: "linear-gradient(135deg, #5e6ad2 0%, #4a54c0 100%)" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[15px] font-bold">Compound Pro</span>
          <span
            className="rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            Active
          </span>
        </div>
        <p className="mb-6 text-[13px] text-white/70">
          You have full access to all Pro features — unlimited products, AI briefings, full history, goals, and more.
        </p>
        <ul className="space-y-2.5">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,8 6,12 14,4" />
              </svg>
              <span className="text-[13px] text-white/90">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Manage card */}
      <div className="flex flex-col justify-between rounded-sm bg-white p-7" style={{ border: "1px solid #ebebeb" }}>
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Subscription</p>
          <p className="mb-4 text-[13px] text-lx-muted">Need to make changes to your subscription? Reach out and we&apos;ll sort it within 24h.</p>
        </div>
        <a
          href="mailto:support@usecompound.xyz?subject=Manage subscription"
          className="flex w-full items-center justify-center rounded-sm py-2.5 text-[13px] font-semibold text-lx-muted transition-colors hover:bg-[#f5f5f4] hover:text-lx-text"
          style={{ border: "1px solid #ebebeb" }}
        >
          Contact support →
        </a>
      </div>
    </div>
  );
}
