"use client";
import { useEffect, useState } from "react";
import { providerLogo } from "@/lib/format";

interface Connection {
  id: string;
  label: string;
  provider: string;
  color: string;
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

export default function ConnectPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [form, setForm] = useState({ provider: "stripe", label: "", apiKey: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (Array.isArray(rows)) {
          setConnections(rows.map((c: Connection) => ({ id: c.id, label: c.label, provider: c.provider, color: c.color })));
        }
      })
      .catch(() => {});
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
      setConnections((c) => [...c, data]);
      setForm({ provider: "stripe", label: "", apiKey: "" });
    } finally { setBusy(false); }
  }

  async function syncAll() {
    setSyncing(true);
    await fetch("/api/sync", { method: "POST" });
    setSyncing(false);
    window.location.href = "/app";
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Connect</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Add a product</h1>
        <p className="mt-1 text-[13px] text-lx-muted">Each product = one payment account. Add as many as you have.</p>
      </div>

      {/* All payment providers + their connection state */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PROVIDERS.map((p) => {
          const linked = connections.filter((c) => c.provider === p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, provider: p.id }))}
              className="rounded-sm bg-white p-4 text-left transition-shadow hover:shadow-sm"
              style={{
                border: form.provider === p.id ? "1.5px solid #5e6ad2" : "1px solid #ebebeb",
              }}
            >
              <img
                src={providerLogo(p.id)}
                alt={p.label}
                width={28}
                height={28}
                className="h-7 w-7 rounded-sm object-contain"
                loading="lazy"
              />
              <p className="mt-2.5 text-[13px] font-bold text-lx-text">{p.label}</p>
              <p className={`mt-0.5 text-[11px] font-semibold ${linked.length > 0 ? "text-lx-green" : "text-lx-faint"}`}>
                {linked.length > 0
                  ? `${linked.length} connected ✓`
                  : "Not connected"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="max-w-md">
        {/* Form card */}
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
                <div key={c.id} className="flex items-center gap-2.5 px-5 py-3">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                  <span className="text-[13px] font-medium text-lx-text">{c.label}</span>
                  <span className="text-[12px] text-lx-faint">· {c.provider}</span>
                  <span className="ml-auto text-[11px] font-semibold text-lx-green">Connected ✓</span>
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
