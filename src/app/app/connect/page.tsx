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
  { id: "stripe", label: "Stripe" },
  { id: "lemonsqueezy", label: "Lemon Squeezy" },
  { id: "polar", label: "Polar" },
  { id: "dodopayments", label: "DodoPayments" },
  { id: "paystack", label: "Paystack" },
];

const KEY_LABELS: Record<string, string> = {
  stripe: "Stripe secret key",
  lemonsqueezy: "Lemon Squeezy API key",
  polar: "Polar access token",
  dodopayments: "DodoPayments API key",
  paystack: "Paystack secret key",
};

const KEY_PLACEHOLDERS: Record<string, string> = {
  stripe: "sk_live_…",
  lemonsqueezy: "eyJ…",
  polar: "polar_…",
  dodopayments: "dodo_live_… / dodo_test_…",
  paystack: "sk_live_… / sk_test_…",
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
  const [form, setForm] = useState({ provider: "stripe", label: "", apiKey: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Install tracking state
  const [installConn, setInstallConn] = useState<Connection | null>(null);
  const [trackerToken, setTrackerToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<"snippet" | "prompt" | null>(null);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (Array.isArray(rows)) {
          setConnections(rows.map((c: Connection) => ({ id: c.id, label: c.label, provider: c.provider, color: c.color, webhookToken: c.webhookToken })));
        }
      })
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

  async function addConnection(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      const conn: Connection = { id: data.id, label: data.label, provider: data.provider, color: data.color };
      setConnections((c) => [...c, conn]);
      setForm({ provider: "stripe", label: "", apiKey: "" });
      loadToken(conn);
    } finally { setBusy(false); }
  }

  async function deleteConnection(id: string) {
    if (!confirm("Remove this product? All synced data will be deleted.")) return;
    const res = await fetch("/api/connections", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) setConnections((c) => c.filter((x) => x.id !== id));
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

  // Step 2 view — replaces the entire content area
  if (installConn) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setInstallConn(null)}
            className="mb-4 flex items-center gap-1.5 text-[12px] font-medium text-lx-muted hover:text-lx-text"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back to connect
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Step 2 · Optional</p>
          <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>
            Install tracking for {installConn.label}
          </h1>
          <p className="mt-1 text-[13px] text-lx-muted">
            Embed this script in your product to capture page views and user events. Compound will match them to your {installConn.provider} customers by email to build a complete customer profile.
          </p>
        </div>

        <div className="max-w-md">
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
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Connect</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Add a product</h1>
        <p className="mt-1 text-[13px] text-lx-muted">Each product = one payment account. Add as many as you have.</p>
      </div>

      {/* Provider grid */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PROVIDERS.map((p) => {
          const linked = connections.filter((c) => c.provider === p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, provider: p.id }))}
              className="rounded-sm bg-white p-4 text-left transition-shadow hover:shadow-sm"
              style={{ border: form.provider === p.id ? "1.5px solid #5e6ad2" : "1px solid #ebebeb" }}
            >
              <img src={providerLogo(p.id)} alt={p.label} width={28} height={28} className="h-7 w-7 rounded-sm object-contain" loading="lazy" />
              <p className="mt-2.5 text-[13px] font-bold text-lx-text">{p.label}</p>
              <p className={`mt-0.5 text-[11px] font-semibold ${linked.length > 0 ? "text-lx-green" : "text-lx-faint"}`}>
                {linked.length > 0 ? `${linked.length} connected ✓` : "Not connected"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="max-w-md">
        {/* Step 1: Add connection */}
        <form onSubmit={addConnection} className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Provider</label>
            <select
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              className="w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
              style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
            >
              <option value="stripe">Stripe</option>
              <option value="lemonsqueezy">Lemon Squeezy</option>
              <option value="polar">Polar</option>
              <option value="dodopayments">DodoPayments</option>
              <option value="paystack">Paystack</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Product name</label>
            <input
              type="text"
              placeholder="e.g. Event Organizer"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              required
              className="w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
              style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">
              {KEY_LABELS[form.provider] ?? "API key"}
            </label>
            <input
              type="password"
              placeholder={KEY_PLACEHOLDERS[form.provider] ?? "paste key…"}
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
            {busy ? "Verifying…" : "Add product"}
          </button>
        </form>

        {/* Connected list */}
        {connections.length > 0 && (
          <div className="mt-4 rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
            <div className="divide-y divide-[#ebebeb]">
              {connections.map((c) => (
                <div key={c.id} className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="text-[13px] font-medium text-lx-text">{c.label}</span>
                    <span className="text-[12px] text-lx-faint">· {c.provider}</span>
                    <button
                      onClick={() => loadToken(c)}
                      className="ml-auto text-[11px] font-semibold text-[#5e6ad2] hover:opacity-70"
                    >
                      Install tracking
                    </button>
                    <button
                      onClick={() => deleteConnection(c.id)}
                      className="text-[11px] font-medium text-lx-faint hover:text-lx-red"
                      title="Remove product"
                    >
                      Remove
                    </button>
                  </div>
                  {c.webhookToken && (
                    <WebhookRow token={c.webhookToken} provider={c.provider} />
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 py-4" style={{ borderTop: "1px solid #ebebeb" }}>
              <button
                onClick={syncAll}
                disabled={syncing}
                className="w-full rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "#5e6ad2" }}
              >
                {syncing ? "Syncing…" : "Sync & go to dashboard →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WebhookRow({ token, provider }: { token: string; provider: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : "https://usecompound.xyz"}/api/webhooks/${provider}/${token}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (provider !== "stripe") return null;

  return (
    <div className="mt-2 flex items-center gap-2 rounded-sm px-2.5 py-2" style={{ background: "#fafafa", border: "1px solid #f0ede8" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-lx-faint">{url}</span>
      <button onClick={copy} className="shrink-0 text-[10px] font-semibold text-[#5e6ad2] hover:opacity-70">
        {copied ? "Copied!" : "Copy webhook URL"}
      </button>
    </div>
  );
}
