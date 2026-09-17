"use client";
import { useState } from "react";

interface NudgeItem {
  connectionId: string;
  label: string;
  provider: string;
  token: string;
}

function snippet(token: string) {
  return `<script>!function(w){w._cmpd=w._cmpd||{_q:[]};['identify','track','page'].forEach(function(m){w._cmpd[m]=function(){w._cmpd._q.push([m,Array.from(arguments)])};})}(window);</script>\n<script async src="https://usecompound.xyz/t.js?k=${token}"></script>`;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function ProductNudgeRow({ item }: { item: NudgeItem }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function copy() {
    navigator.clipboard.writeText(snippet(item.token)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border-t" style={{ borderColor: "#f0f0f0" }}>
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#f59e0b" }} />
          <span className="text-[12.5px] font-medium text-lx-text">{item.label}</span>
          <span className="text-[11px] text-lx-faint">{item.provider}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="rounded px-2.5 py-1 text-[11px] font-semibold transition-colors"
            style={{ background: copied ? "#dcfce7" : "#f4f4f5", color: copied ? "#166534" : "#3f3f46" }}
          >
            {copied ? "Copied!" : "Copy snippet"}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-lx-muted hover:text-lx-text"
          >
            <ChevronIcon open={expanded} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-4">
          <pre
            className="overflow-x-auto rounded p-3 font-mono text-[10.5px] leading-relaxed text-lx-text"
            style={{ background: "#fafafa", border: "1px solid #ebebeb", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
          >
            {snippet(item.token)}
          </pre>
          <p className="mt-2 text-[11px] text-lx-muted">
            Paste before <code className="font-mono">&lt;/head&gt;</code>. After login, call{" "}
            <code className="font-mono">window._cmpd.identify(user.email)</code> to match sessions to customers.
          </p>
        </div>
      )}
    </div>
  );
}

export function AnalyticsNudgeBanner({ items }: { items: NudgeItem[] }) {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || items.length === 0) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="7" />
            <path d="M8 5v3M8 11h.01" />
          </svg>
          <span className="text-[12.5px] font-semibold text-lx-text">
            {items.length === 1
              ? `${items[0].label} isn't tracking customer behavior yet`
              : `${items.length} products aren't tracking customer behavior yet`}
          </span>
          <ChevronIcon open={open} />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="ml-3 text-lx-faint hover:text-lx-muted"
          aria-label="Dismiss"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      {open && (
        <>
          <div className="px-5 pb-3">
            <p className="text-[12px] text-lx-muted">
              Install the Compound script to capture page views, user journeys, and feature usage — then match them to your paying customers for a complete profile.
            </p>
          </div>
          {items.map((item) => (
            <ProductNudgeRow key={item.connectionId} item={item} />
          ))}
        </>
      )}
    </div>
  );
}
