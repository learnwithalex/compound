"use client";
import { useState } from "react";

function snippet(token: string) {
  return `<!-- Compound analytics — paste before </head> -->
<script>
!function(w){w._cmpd=w._cmpd||{_q:[]};
['identify','track','page'].forEach(function(m){
  w._cmpd[m]=function(){w._cmpd._q.push([m,Array.from(arguments)])};
});}(window);
</script>
<script async src="https://usecompound.xyz/t.js?k=${token}"></script>

<!-- After a user logs in, call: -->
<!-- window._cmpd.identify(user.email) -->`;
}

function aiPrompt(token: string) {
  return `Install the Compound analytics tracker in this codebase.

1. Paste this snippet before </head> on every page (or in your root layout/_document):

<script>
!function(w){w._cmpd=w._cmpd||{_q:[]};
['identify','track','page'].forEach(function(m){
  w._cmpd[m]=function(){w._cmpd._q.push([m,Array.from(arguments)])};
});}(window);
</script>
<script async src="https://usecompound.xyz/t.js?k=${token}"></script>

2. After a user successfully logs in or on any authenticated page, call:
   window._cmpd.identify(user.email)

   Optionally pass traits: window._cmpd.identify(user.email, { name: user.name, plan: user.plan })

3. Optionally track key product events:
   window._cmpd.track('Feature Used', { feature: 'export' })
   window._cmpd.track('Upgraded', { from: 'free', to: 'pro' })

Page views are tracked automatically.`;
}

export function TrackingTabClient({
  token,
  eventCount,
  productLabel,
}: {
  token: string;
  eventCount: number;
  productLabel: string;
}) {
  const [copied, setCopied] = useState<"snippet" | "prompt" | null>(null);

  function copy(type: "snippet" | "prompt") {
    const text = type === "snippet" ? snippet(token) : aiPrompt(token);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const isLive = eventCount > 0;

  return (
    <div className="max-w-xl space-y-6">
      {/* Status banner */}
      <div
        className="flex items-start gap-3 rounded-sm px-5 py-4"
        style={{
          background: isLive ? "#f0fdf4" : "#fffbeb",
          border: `1px solid ${isLive ? "#86efac" : "#fde68a"}`,
        }}
      >
        <div
          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: isLive ? "#22c55e" : "#f59e0b", marginTop: "5px" }}
        />
        <div>
          <p className="text-[13px] font-semibold text-lx-text">
            {isLive
              ? `Tracking active — ${eventCount.toLocaleString()} event${eventCount === 1 ? "" : "s"} received`
              : `Not tracking yet`}
          </p>
          <p className="mt-0.5 text-[12px] text-lx-muted">
            {isLive
              ? `Compound is receiving behavioral data from ${productLabel}. Customer profiles are being enriched.`
              : `Install the snippet below to start capturing page views, user sessions, and feature events for ${productLabel}.`}
          </p>
        </div>
      </div>

      {/* Snippet */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">
            Install snippet
          </p>
          <span className="text-[11px] text-lx-muted">Paste before <code className="font-mono">&lt;/head&gt;</code></span>
        </div>
        <pre
          className="mb-3 overflow-x-auto rounded-sm p-4 font-mono text-[11px] leading-relaxed text-lx-text"
          style={{ background: "#fafafa", border: "1px solid #ebebeb", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
        >
          {snippet(token)}
        </pre>
        <div className="flex gap-2">
          <button
            onClick={() => copy("snippet")}
            className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-semibold transition-colors"
            style={{
              background: copied === "snippet" ? "#dcfce7" : "#f4f4f5",
              color: copied === "snippet" ? "#166534" : "#3f3f46",
              border: "1px solid #e4e4e7",
            }}
          >
            {copied === "snippet" ? "Copied!" : "Copy snippet"}
          </button>
          <button
            onClick={() => copy("prompt")}
            className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-semibold transition-colors"
            style={{
              background: copied === "prompt" ? "#dcfce7" : "#f4f4f5",
              color: copied === "prompt" ? "#166534" : "#3f3f46",
              border: "1px solid #e4e4e7",
            }}
          >
            {copied === "prompt" ? "Copied!" : "Copy AI prompt"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-3 rounded-sm p-5" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">How it works</p>
        {[
          { n: "1", title: "Paste the snippet", body: "Add it before </head> in your root layout or _document file. Page views are tracked automatically from there." },
          { n: "2", title: "Identify your users", body: "After login, call window._cmpd.identify(user.email) to link sessions to your paying customers." },
          { n: "3", title: "See the full picture", body: "Compound matches behavioral data to your billing records, so you can see what active vs churned customers actually do." },
        ].map(({ n, title, body }) => (
          <div key={n} className="flex gap-3">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: "#5e6ad2" }}
            >
              {n}
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-lx-text">{title}</p>
              <p className="text-[12px] text-lx-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
