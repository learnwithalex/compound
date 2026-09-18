"use client";
import { useEffect, useState } from "react";

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

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Billing</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
          Your plan
        </h1>
      </div>

      {isPro === null ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
        </div>
      ) : isPro ? (
        <ProPlan />
      ) : (
        <FreePlan onUpgrade={upgrade} loading={loading} />
      )}
    </div>
  );
}

function FreePlan({ onUpgrade, loading }: { onUpgrade: () => void; loading: boolean }) {
  return (
    <div className="space-y-4">
      {/* Current plan */}
      <div className="rounded-sm bg-white p-5" style={{ border: "1px solid #ebebeb" }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-lx-text">Free Trial</p>
          <span
            className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#fff8e6", color: "#f59e0b", border: "1px solid #fde68a" }}
          >
            Current plan
          </span>
        </div>
        <ul className="space-y-1.5">
          {["1 product", "30-day history", "Basic analytics"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12px] text-lx-muted">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#b4b4b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,8 6,12 14,4" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-sm p-5" style={{ background: "rgba(94,106,210,0.05)", border: "1.5px solid #5e6ad2" }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-lx-text">Compound Pro</p>
          <p className="text-[18px] font-bold text-lx-text" style={{ letterSpacing: "-0.02em" }}>
            $9<span className="text-[12px] font-normal text-lx-muted">/mo</span>
          </p>
        </div>
        <ul className="mb-4 space-y-1.5">
          {[
            "Unlimited products",
            "Full history & trend charts",
            "AI briefings & weekly digest",
            "Goals, streaks & milestones",
            "Auto-sync every 30s",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12px] text-lx-muted">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#5e6ad2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,8 6,12 14,4" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={onUpgrade}
          disabled={loading}
          className="w-full rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          style={{ background: "#5e6ad2" }}
        >
          {loading ? "Redirecting…" : "Upgrade to Pro →"}
        </button>
        <p className="mt-2 text-center text-[11px] text-lx-faint">Powered by DodoPayments · Cancel anytime</p>
      </div>
    </div>
  );
}

function ProPlan() {
  return (
    <div className="rounded-sm bg-white p-5" style={{ border: "1px solid #ebebeb" }}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-lx-text">Compound Pro</p>
        <span
          className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: "#eff0fb", color: "#5e6ad2", border: "1px solid #c7caee" }}
        >
          Active
        </span>
      </div>
      <p className="mb-4 text-[13px] text-lx-muted">
        You have full access to all Pro features — unlimited products, AI briefings, full history, and more.
      </p>
      <a
        href="mailto:support@usecompound.xyz"
        className="text-[12px] font-medium text-lx-muted hover:text-lx-text"
      >
        Manage or cancel subscription → support@usecompound.xyz
      </a>
    </div>
  );
}
