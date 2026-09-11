"use client";
import { useState } from "react";

interface Connection {
  id: string;
  label: string;
  provider: string;
  color: string;
}

export default function ConnectPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [form, setForm] = useState({ provider: "stripe", label: "", apiKey: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

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
    <div className="px-6 py-5">
      <div className="mb-6">
        <div className="text-[11px] font-medium uppercase tracking-widest text-lx-faint">Connect</div>
        <h1 className="mt-1 text-[20px] font-semibold tracking-tight text-lx-text">Add a product</h1>
        <p className="mt-1 text-[13px] text-lx-muted">Each product = one Stripe or Lemon Squeezy account. Add as many as you have.</p>
      </div>

      <div className="max-w-md">
        <form onSubmit={addConnection} className="rounded-md border border-lx-border p-5" style={{ background: "#1c1c22" }}>
          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-lx-faint">Provider</label>
            <select
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              className="w-full rounded px-3 py-2 text-[13px] text-lx-text focus:outline-none focus:ring-1 focus:ring-lx-purple"
              style={{ background: "#111116", border: "1px solid #2a2a32" }}
            >
              <option value="stripe">Stripe</option>
              <option value="lemonsqueezy">Lemon Squeezy</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-lx-faint">Product name</label>
            <input
              type="text"
              placeholder="e.g. TypingMind"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              required
              className="w-full rounded px-3 py-2 text-[13px] text-lx-text placeholder:text-lx-faint focus:outline-none focus:ring-1 focus:ring-lx-purple"
              style={{ background: "#111116", border: "1px solid #2a2a32" }}
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-lx-faint">
              {form.provider === "stripe" ? "Stripe secret key" : "Lemon Squeezy API key"}
            </label>
            <input
              type="password"
              placeholder={form.provider === "stripe" ? "sk_live_…" : "eyJ…"}
              value={form.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              required
              className="w-full rounded px-3 py-2 font-mono text-[12px] text-lx-text placeholder:text-lx-faint focus:outline-none focus:ring-1 focus:ring-lx-purple"
              style={{ background: "#111116", border: "1px solid #2a2a32" }}
            />
            <p className="mt-1 text-[11px] text-lx-faint">Read-only restricted key recommended. We never write to your account.</p>
          </div>

          {error && <p className="mb-3 text-[12px] text-lx-red">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: "#5e6ad2" }}
          >
            {busy ? "Verifying…" : "Add product"}
          </button>
        </form>

        {connections.length > 0 && (
          <div className="mt-4">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center gap-2 py-2 text-[13px]">
                <div className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                <span className="text-lx-text">{c.label}</span>
                <span className="text-lx-faint">· {c.provider}</span>
                <span className="ml-auto text-[11px] text-lx-green">Connected ✓</span>
              </div>
            ))}
            <button
              onClick={syncAll}
              disabled={syncing}
              className="mt-3 w-full rounded py-2 text-[13px] font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: "#5e6ad2" }}
            >
              {syncing ? "Syncing…" : "Sync & go to dashboard →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
