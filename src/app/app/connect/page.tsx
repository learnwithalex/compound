"use client";
import { useEffect, useState, useCallback } from "react";
import { providerLogo } from "@/lib/format";

interface Connection {
  id: string;
  label: string;
  provider: string;
  color: string;
  webhookToken?: string | null;
}

const PROVIDERS = [
  { id: "stripe",        label: "Stripe" },
  { id: "lemonsqueezy",  label: "Lemon Squeezy" },
  { id: "polar",         label: "Polar" },
  { id: "dodopayments",  label: "DodoPayments" },
  { id: "paddle",        label: "Paddle" },
  { id: "gumroad",       label: "Gumroad" },
  { id: "paystack",      label: "Paystack" },
];

const KEY_LABELS: Record<string, string> = {
  stripe:        "Stripe secret key",
  lemonsqueezy:  "Lemon Squeezy API key",
  polar:         "Polar access token",
  dodopayments:  "DodoPayments API key",
  paddle:        "Paddle API key",
  gumroad:       "Gumroad access token",
  paystack:      "Paystack secret key",
};

const KEY_PLACEHOLDERS: Record<string, string> = {
  stripe:        "sk_live_…",
  lemonsqueezy:  "eyJ…",
  polar:         "polar_…",
  dodopayments:  "dodo_live_… / dodo_test_…",
  paddle:        "pdl_apikey_…",
  gumroad:       "your_access_token",
  paystack:      "sk_live_… / sk_test_…",
};

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

Page views are tracked automatically. Do not call window._cmpd.page() manually unless you have a SPA that needs explicit page tracking on route change.`;
}

export default function ConnectPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Progressive disclosure: null = pick provider, string = fill form
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", apiKey: "", websiteUrl: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Step 3: tracking install
  const [installConn, setInstallConn] = useState<Connection | null>(null);
  const [trackerToken, setTrackerToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<"snippet" | "prompt" | null>(null);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (Array.isArray(rows)) {
          setConnections(rows.map((c: Connection) => ({
            id: c.id, label: c.label, provider: c.provider,
            color: c.color, webhookToken: c.webhookToken,
          })));
        }
      })
      .catch(() => {});
    fetch("/api/billing/status")
      .then((r) => r.ok ? r.json() : { isPro: false })
      .then((d) => setIsPro(d.isPro))
      .catch(() => {});
  }, []);

  const loadToken = useCallback(async (conn: Connection) => {
    setInstallConn(conn);
    setTrackerToken(null);
    const res = await fetch(`/api/connections/${conn.id}/tracker`);
    if (res.ok) {
      const data = await res.json();
      setTrackerToken(data.token);
    }
  }, []);

  function pickProvider(id: string) {
    setSelectedProvider(id);
    setForm({ label: "", apiKey: "", websiteUrl: "" });
    setError(null);
  }

  async function addConnection(e: React.FormEvent) {
    e.preventDefault();
    if (!isPro && connections.length >= 1) { setShowUpgrade(true); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          label: form.label,
          apiKey: form.apiKey,
          websiteUrl: form.websiteUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      const conn: Connection = { id: data.id, label: data.label, provider: data.provider, color: data.color };
      setConnections((c) => [...c, conn]);
      setSelectedProvider(null);
      setForm({ label: "", apiKey: "", websiteUrl: "" });
      loadToken(conn);
    } finally { setBusy(false); }
  }

  async function syncAll() {
    setSyncing(true);
    await fetch("/api/sync", { method: "POST" });
    setSyncing(false);
    window.location.href = "/app";
  }

  function copy(type: "snippet" | "prompt") {
    if (!trackerToken) return;
    const text = type === "snippet" ? snippet(trackerToken) : aiPrompt(trackerToken);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  /* ── Step 3: install tracking ── */
  if (installConn) {
    return (
      <div className="max-w-md">
        <button
          onClick={() => setInstallConn(null)}
          className="mb-5 flex items-center gap-1.5 text-[12px] font-medium text-lx-muted hover:text-lx-text"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Step 3 · Optional</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
          Install tracking
        </h1>
        <p className="mt-1 mb-6 text-[13px] text-lx-muted">
          Embed this in <span className="font-medium text-lx-text">{installConn.label}</span> to capture page views and user journeys — matched to your paying customers.
        </p>

        {!trackerToken ? (
          <p className="text-[12px] text-lx-faint">Loading…</p>
        ) : (
          <>
            <pre
              className="mb-4 overflow-x-auto rounded-sm p-4 font-mono text-[11px] leading-relaxed text-lx-text"
              style={{ background: "#fafafa", border: "1px solid #ebebeb", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {snippet(trackerToken)}
            </pre>

            <div className="flex gap-2.5">
              <button
                onClick={() => copy("snippet")}
                className="flex-1 rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#5e6ad2" }}
              >
                {copied === "snippet" ? "Copied!" : "Copy snippet"}
              </button>
              <button
                onClick={() => copy("prompt")}
                className="flex-1 rounded-sm py-2.5 text-[13px] font-semibold text-lx-text transition-colors hover:bg-[#f5f5f4]"
                style={{ border: "1px solid #dddad5" }}
              >
                {copied === "prompt" ? "Copied!" : "Copy AI prompt"}
              </button>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-lx-faint">
              Call <code className="rounded bg-[#f0ede8] px-1 py-0.5 font-mono">window._cmpd.identify(user.email)</code> after login to link behavioral data to payment data.
            </p>

            <div className="mt-6 pt-5" style={{ borderTop: "1px solid #ebebeb" }}>
              <button
                onClick={syncAll}
                disabled={syncing}
                className="w-full rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "#5e6ad2" }}
              >
                {syncing ? "Syncing…" : "Sync & go to dashboard →"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Step 1: pick provider ── */
  if (!selectedProvider) {
    return (
      <div className="max-w-lg">
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Connect · Step 1</p>
          <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            Which platform?
          </h1>
          <p className="mt-1 text-[13px] text-lx-muted">
            Pick the payment provider your product uses.
          </p>
        </div>

        <div className="rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
          {PROVIDERS.map((p, i) => {
            const linked = connections.filter((c) => c.provider === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pickProvider(p.id)}
                className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-[#fafafa]"
                style={i > 0 ? { borderTop: "1px solid #f0f0f0" } : undefined}
              >
                <img
                  src={providerLogo(p.id)}
                  alt={p.label}
                  width={28} height={28}
                  className="h-7 w-7 shrink-0 rounded-sm object-contain"
                  loading="lazy"
                />
                <span className="flex-1 text-[13.5px] font-semibold text-lx-text">{p.label}</span>
                {linked.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#10b981]">{linked.length} connected ✓</span>
                )}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c8c8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </button>
            );
          })}
        </div>

        {connections.length > 0 && (
          <p className="mt-4 text-center text-[12px] text-lx-muted">
            {connections.length} product{connections.length === 1 ? "" : "s"} connected.{" "}
            <a href="/app/products" className="font-medium text-[#5e6ad2] hover:opacity-70">View all →</a>
          </p>
        )}
      </div>
    );
  }

  /* ── Step 2: fill in details ── */
  const providerMeta = PROVIDERS.find((p) => p.id === selectedProvider)!;

  return (
    <div className="max-w-md">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Selected provider chip + back */}
      <button
        onClick={() => setSelectedProvider(null)}
        className="mb-5 flex items-center gap-2 text-[12px] font-medium text-lx-muted hover:text-lx-text"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Change provider
      </button>

      <div className="mb-5 flex items-center gap-3">
        <img
          src={providerLogo(selectedProvider)}
          alt={providerMeta.label}
          width={36} height={36}
          className="h-9 w-9 rounded-sm object-contain"
          style={{ border: "1px solid #ebebeb" }}
        />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Connect · Step 2</p>
          <h1 className="text-[20px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            Add your {providerMeta.label} product
          </h1>
        </div>
      </div>

      <form onSubmit={addConnection} className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
            Product name
          </label>
          <input
            type="text"
            placeholder="e.g. Event Organizer"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            required
            autoFocus
            className="w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
            style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
            Product website{" "}
            <span className="normal-case font-normal text-lx-faint">(optional — used for logo)</span>
          </label>
          <input
            type="url"
            placeholder="https://yourproduct.com"
            value={form.websiteUrl}
            onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
            className="w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
            style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
            {KEY_LABELS[selectedProvider] ?? "API key"}
          </label>
          <input
            type="password"
            placeholder={KEY_PLACEHOLDERS[selectedProvider] ?? "paste key…"}
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
            required
            className="w-full rounded-sm px-3 py-2.5 font-mono text-[12px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
            style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
          />
          <p className="mt-1.5 text-[11px] text-lx-faint">Read-only restricted key recommended. We never write to your account.</p>
        </div>

        {error && <p className="mb-3 text-[12px] text-lx-red">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          style={{ background: "#5e6ad2" }}
        >
          {busy ? "Verifying…" : "Connect product →"}
        </button>
      </form>
    </div>
  );
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-sm rounded-sm bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ background: "rgba(94,106,210,0.10)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <button onClick={onClose} className="text-lx-faint hover:text-lx-text">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>
        <h2 className="text-[17px] font-bold text-lx-text" style={{ letterSpacing: "-0.02em" }}>
          Upgrade to Compound Pro
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-lx-muted">
          Free accounts support one product. Upgrade to Pro for unlimited products, full history, AI briefings, and more.
        </p>
        <div className="mt-4 rounded-sm p-3.5" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
          <p className="text-[22px] font-bold text-lx-text" style={{ letterSpacing: "-0.02em" }}>
            $9<span className="text-[14px] font-normal text-lx-muted">/month</span>
          </p>
          <ul className="mt-2 space-y-1">
            {["Unlimited products", "Full history & trend charts", "AI briefings", "Goals & streak", "Auto-sync every 30s"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[12px] text-lx-muted">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,8 6,12 14,4" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={upgrade}
          disabled={loading}
          className="mt-4 w-full rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#5e6ad2" }}
        >
          {loading ? "Redirecting…" : "Upgrade for $9/month →"}
        </button>
        <p className="mt-2 text-center text-[11px] text-lx-faint">Powered by DodoPayments · Cancel anytime</p>
      </div>
    </div>
  );
}
