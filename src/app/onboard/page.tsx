"use client";
import { useState } from "react";
import Link from "next/link";
import { CompoundWordmark } from "../compound-logo";

const AGENTS = [
  { id: "claude",    label: "Claude",       sub: "Desktop or Code",      domain: "claude.ai" },
  { id: "cursor",    label: "Cursor",        sub: "via .cursorrules",     domain: "cursor.com" },
  { id: "chatgpt",   label: "ChatGPT",       sub: "Custom instruction",   domain: "chatgpt.com" },
  { id: "windsurf",  label: "Windsurf",      sub: "via .windsurfrules",   domain: "windsurf.com" },
  { id: "opencode",  label: "Opencode",      sub: "via AGENTS.md",        domain: "opencode.ai" },
  { id: "other",     label: "Other agent",   sub: "any HTTP client",      domain: "" },
] as const;

type AgentId = (typeof AGENTS)[number]["id"];

const ORIGIN = "https://compound.apps.orizon.ng";

function buildPrompt(_agentId: AgentId): string {
  return `You are my revenue analysis assistant. Compound provides a read-only portfolio API at ${ORIGIN}/api/portfolio.

If I have not already provided a Compound API token, ask me for one. Then fetch the endpoint using:

  GET ${ORIGIN}/api/portfolio
  Authorization: Bearer <my Compound token>

Never ask me for payment provider API keys, and do not try to connect, change, or sync accounts. I manage those inside Compound. Do not save the token in long-term memory unless I explicitly ask you to.

Use the returned data to summarize MRR, ARR, subscribers, product breakdown, and 30-day changes. If currencyWarning is true, say clearly that currencies are not converted and avoid presenting the combined total as comparable money. Do not invent missing facts.

Give me a concise CFO-style briefing and one useful action based only on the returned data.`;
}

export default function OnboardPage() {
  const [selected, setSelected] = useState<AgentId>("claude");
  const [copied, setCopied] = useState(false);

  const prompt = buildPrompt(selected);

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedAgent = AGENTS.find((a) => a.id === selected)!;

  return (
    <div className="min-h-screen bg-[#f3f1ec] font-sans text-[#1a1a1a] antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#e7e3db] bg-[#f3f1ec]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="Compound home">
            <CompoundWordmark height={22} />
          </Link>
          <Link
            href="/login"
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#1a1a2e] px-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 max-w-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Agent onboarding</p>
          <h1 className="mb-4 text-[40px] font-[700] leading-[1.1] tracking-[-0.025em] text-[#1a1a1a]">
            Your agent reads<br />your revenue.
          </h1>
          <p className="text-[16px] leading-[1.7] text-[#5c5856]">
            Connect providers in Compound first, then create a read-only agent token. Paste the prompt below into your AI client to let it read portfolio metrics. The token cannot add connections or trigger changes.
          </p>
        </div>

        {/* Pre-requisite banner */}
        <div className="mb-10 flex items-start gap-4 rounded-xl border border-[#e7e3db] bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[14px] font-bold text-white">!</div>
          <div className="flex-1">
            <p className="mb-1 text-[13px] font-semibold text-[#1a1a1a]">Do this once before copying the prompt</p>
            <p className="mb-3 text-[12px] leading-5 text-[#9c9894]">Sign in and connect a payment provider from Connect. Then go to <strong className="text-[#1a1a1a]">Settings → Agents</strong> to create a read-only token. Paste it to your AI client only when it asks for it.</p>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-md bg-[#1a1a2e] px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-85"
              >
                Sign in →
              </Link>
              <Link
                href="/app/agents"
                className="rounded-md border border-[#e7e3db] bg-[#f3f1ec] px-3.5 py-2 text-[12px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#eceae4]"
              >
                Create token →
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: agent picker + prompt */}
          <div>
            {/* Agent picker */}
            <div className="mb-8">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">1 — Pick your agent</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {AGENTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                    className="flex flex-col items-center gap-2 rounded-sm border p-3 text-center transition-all"
                    style={{
                      borderColor: selected === a.id ? "#1a1a2e" : "#e7e3db",
                      background: selected === a.id ? "#1a1a2e" : "white",
                      boxShadow: selected === a.id ? "2px 2px 0 #1a1a2e" : "none",
                    }}
                  >
                    {a.domain ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${a.domain}&sz=32`}
                        alt={a.label}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-sm"
                      />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill={selected === a.id ? "#374151" : "#6b7280"} />
                        <path d="M8 9l-3 3 3 3M16 9l3 3-3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 7l-4 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )}
                    <span
                      className="text-[10px] font-semibold leading-tight"
                      style={{ color: selected === a.id ? "white" : "#1a1a1a" }}
                    >
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">2 — Copy this prompt into {selectedAgent.label}</p>
              <div className="relative rounded-sm border border-[#e7e3db] bg-white">
                <div className="flex items-center justify-between border-b border-[#f0ede6] bg-[#fafaf8] px-4 py-3">
                  <div className="flex items-center gap-2">
                    {selectedAgent.domain ? (
                      <img src={`https://www.google.com/s2/favicons?domain=${selectedAgent.domain}&sz=32`} alt={selectedAgent.label} width={14} height={14} className="h-3.5 w-3.5 rounded-sm" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect width="16" height="16" rx="3" fill="#6b7280" /></svg>
                    )}
                    <span className="text-[12px] font-semibold text-[#1a1a1a]">Onboarding prompt for {selectedAgent.label}</span>
                  </div>
                  <button
                    onClick={copy}
                    className="rounded-sm px-3 py-1 text-[12px] font-semibold transition-all"
                    style={{
                      background: copied ? "#10b981" : "#1a1a2e",
                      color: "white",
                    }}
                  >
                    {copied ? "Copied ✓" : "Copy prompt"}
                  </button>
                </div>
                <pre className="max-h-[480px] overflow-y-auto p-5 font-mono text-[11px] leading-6 text-[#4a4845] whitespace-pre-wrap">
                  {prompt}
                </pre>
              </div>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="lg:pt-[52px]">
            <div className="sticky top-[80px] space-y-4">
              <div className="rounded-sm border border-[#e7e3db] bg-white p-5">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">What your agent does via API</p>
                <div className="space-y-4">
                  {[
                    { n: "1", label: "Connects a provider", desc: "You manage provider credentials inside Compound.", api: "Connect" },
                    { n: "2", label: "Creates a read-only token", desc: "Generate it under Settings → Agents.", api: null },
                    { n: "3", label: "Reads portfolio metrics", desc: "The agent fetches MRR, subscribers, and product changes.", api: "GET /api/portfolio" },
                    { n: "4", label: "Explains what moved", desc: "It uses the returned metrics to prepare a briefing.", api: null },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] font-bold text-white">
                        {s.n}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{s.label}</p>
                          {s.api && (
                            <span className="rounded bg-[#eff0fb] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#5e6ad2]">{s.api}</span>
                          )}
                        </div>
                        <p className="text-[12px] leading-5 text-[#9c9894]">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-[#e7e3db] bg-[#fafaf8] p-4">
                <p className="mb-1 text-[12px] font-semibold text-[#1a1a1a]">Use a dedicated read-only key</p>
                <p className="text-[11px] leading-5 text-[#9c9894]">
                  Compound uses your provider key for revenue sync; it is stored without application-layer encryption. Your agent token does not expose the raw key and only reads portfolio data.
                </p>
              </div>

              <div className="rounded-sm border border-[#e7e3db] bg-[#fafaf8] p-4">
                <p className="mb-2 text-[12px] font-semibold text-[#1a1a1a]">Supported providers</p>
                <div className="flex items-center gap-2">
                  <img src="https://cdn.simpleicons.org/stripe/635bff" alt="Stripe" className="h-5 w-5" width={20} height={20} />
                  <img src="https://cdn.simpleicons.org/lemonsqueezy/e5a00d" alt="Lemon Squeezy" className="h-5 w-5" width={20} height={20} />
                  <img src="/polar-icon.svg" alt="Polar" className="h-5 w-5 rounded" width={20} height={20} />
                  <img src="/dodopayments-icon.svg" alt="DodoPayments" className="h-5 w-5 rounded bg-[#1a1a1a]" width={20} height={20} />
                  <img src="/paystack-icon.png" alt="Paystack" className="h-5 w-5 rounded" width={20} height={20} />
                </div>
                <p className="mt-2 text-[11px] text-[#9c9894]">Also supported: Paddle and Gumroad.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e7e3db] py-8 text-center text-[12px] text-[#9c9894]">
        <Link href="/" className="hover:text-[#1a1a1a]">← Back to Compound</Link>
      </footer>
    </div>
  );
}
