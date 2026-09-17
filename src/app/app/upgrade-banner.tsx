"use client";
import { useState } from "react";

export function UpgradeBanner({
  dismissed,
  trialStartedAt,
}: {
  dismissed: boolean;
  trialStartedAt: Date | null;
}) {
  const [hidden, setHidden] = useState(dismissed);
  const [onTrial, setOnTrial] = useState(!!trialStartedAt);
  const [loading, setLoading] = useState(false);

  if (hidden) return null;

  const trialEndsAt = trialStartedAt
    ? new Date(new Date(trialStartedAt).getTime() + 14 * 86400_000)
    : null;
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400_000))
    : null;

  async function startTrial() {
    setLoading(true);
    await fetch("/api/trial/start", { method: "POST" });
    setOnTrial(true);
    setLoading(false);
  }

  async function dismiss() {
    setHidden(true);
    await fetch("/api/trial/dismiss", { method: "POST" });
  }

  return (
    <div className="mb-4 flex items-center gap-4 rounded-sm bg-white px-5 py-4" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm" style={{ background: onTrial ? "rgba(94,106,210,0.10)" : "#f0f0f0" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={onTrial ? "#5e6ad2" : "#888"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        {onTrial ? (
          <>
            <p className="text-[13px] font-semibold text-lx-text">
              You&apos;re on a free trial — {daysLeft} day{daysLeft === 1 ? "" : "s"} left
            </p>
            <p className="mt-0.5 text-[12px] text-lx-muted">
              Enjoying Compound Pro? Upgrade before your trial ends to keep everything.
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-semibold text-lx-text">Try Compound Pro free for 14 days</p>
            <p className="mt-0.5 text-[12px]" style={{ color: "#5e6ad2" }}>
              Unlimited products, AI briefings, team collaboration — free for 14 days, no charge.
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!onTrial && (
          <button
            onClick={startTrial}
            disabled={loading}
            className="rounded-sm px-3.5 py-1.5 text-[12px] font-semibold text-lx-text transition-colors hover:bg-[#f5f5f5] disabled:opacity-50"
            style={{ border: "1px solid #d0d0d0" }}
          >
            {loading ? "Starting…" : "Start free trial"}
          </button>
        )}
        <button
          onClick={dismiss}
          className="flex h-6 w-6 items-center justify-center rounded text-lx-faint transition-colors hover:bg-[#f5f5f5] hover:text-lx-text"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
