"use client";
import { useEffect, useState } from "react";

interface Token {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function AgentsPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<{ id: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/tokens");
    if (res.ok) setTokens(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setBusy(true);
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() || "agent" }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setFresh({ id: data.id, token: data.token });
    setName("");
    load();
  }

  async function revoke(id: string) {
    await fetch("/api/tokens", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="px-7 py-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Agents</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Connect your AI agent</h1>
        <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-lx-muted">
          Give Claude, Cursor, or any script read access to your portfolio.
          The agent can fetch live MRR, trends, and history over HTTP — then brief you, write reports, or power automations.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Create token */}
        <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #ddd9d0" }}>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Token name</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. claude-desktop, cursor, cron-report"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2.5 text-[13px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
              style={{ background: "#f7f5f1", border: "1px solid #ddd9d0" }}
            />
            <button
              onClick={create}
              disabled={busy}
              className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ background: "#5e6ad2" }}
            >
              {busy ? "Creating…" : "Create token"}
            </button>
          </div>
        </div>

        {/* Fresh token — shown once */}
        {fresh && (
          <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.08)" }}>
            <div className="mb-2 text-[13px] font-semibold text-lx-text">Copy this now — it won&apos;t be shown again</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-lg px-3 py-2.5 font-mono text-[12px] text-lx-muted" style={{ background: "#f7f5f1", border: "1px solid #ddd9d0" }}>
                {fresh.token}
              </code>
              <button
                onClick={() => copy(fresh.token)}
                className="rounded-lg px-3 py-2.5 text-[12px] font-semibold text-lx-muted transition-colors hover:text-lx-text"
                style={{ background: "#f7f5f1", border: "1px solid #ddd9d0" }}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-lg p-3 font-mono text-[11px] leading-5 text-lx-muted" style={{ background: "#f7f5f1", border: "1px solid #ddd9d0" }}>
{`curl -H "Authorization: Bearer ${fresh.token.slice(0, 12)}…" \\
  ${typeof window !== "undefined" ? window.location.origin : ""}/api/portfolio`}
            </pre>
            <button onClick={() => setFresh(null)} className="mt-2 text-[12px] text-lx-faint transition-colors hover:text-lx-muted">
              Dismiss
            </button>
          </div>
        )}

        {/* Existing tokens */}
        {tokens.length > 0 && (
          <div className="rounded-xl bg-white" style={{ border: "1px solid #ddd9d0" }}>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid #ddd9d0" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Active tokens</p>
            </div>
            <div className="divide-y divide-[#ddd9d0]">
              {tokens.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <div>
                    <div className="text-[13px] font-medium text-lx-text">{t.name}</div>
                    <div className="font-mono text-[11px] text-lx-faint">
                      {t.tokenPrefix}… · created {new Date(t.createdAt).toLocaleDateString()}
                      {t.lastUsedAt ? ` · used ${new Date(t.lastUsedAt).toLocaleDateString()}` : " · never used"}
                    </div>
                  </div>
                  <button onClick={() => revoke(t.id)} className="ml-auto text-[12px] font-medium text-lx-red transition-opacity hover:opacity-80">
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How agents use it */}
        <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #ddd9d0" }}>
          <div className="mb-3 text-[13px] font-semibold text-lx-text">What your agent can do</div>
          <pre className="overflow-x-auto rounded-lg p-4 font-mono text-[11px] leading-6 text-lx-muted" style={{ background: "#f7f5f1", border: "1px solid #ddd9d0" }}>
{`GET /api/portfolio              → full snapshot (MRR, ARR, subs, 30d trend)
POST /api/sync                   → refresh all connections first
POST /api/analyze                → Claude CFO briefing as JSON

# skill prompt you can paste into Claude / Cursor:
"Fetch my portfolio from ${typeof window !== "undefined" ? window.location.origin : "<app-url>"}/api/portfolio
 with header Authorization: Bearer <token>, then brief
 me on what's working, what's at risk, and one action."`}
          </pre>
        </div>
      </div>
    </div>
  );
}
