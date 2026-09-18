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

const ORIGIN = "https://usecompound.xyz";

function buildPrompt(agentId: AgentId): string {
  const saveInstructions: Record<AgentId, string> = {
    claude: `Save to your memory so you always have access:
  Compound token: {the token I gave you}
  Revenue API: GET ${ORIGIN}/api/portfolio — Authorization: Bearer {token}`,
    cursor: `Add to my .cursorrules file:
  # Compound revenue API
  GET ${ORIGIN}/api/portfolio — Authorization: Bearer {token}
  Use this when I ask about MRR, subscribers, or business metrics.`,
    windsurf: `Add to my .windsurfrules file:
  # Compound revenue API
  GET ${ORIGIN}/api/portfolio — Authorization: Bearer {token}
  Use this when I ask about MRR, subscribers, or business metrics.`,
    opencode: `Add to my AGENTS.md file:
  # Compound revenue API
  GET ${ORIGIN}/api/portfolio — Authorization: Bearer {token}
  Use this when I ask about MRR, subscribers, or business metrics.`,
    chatgpt: `Remember for all future conversations:
  Compound token: {the token I gave you}
  Revenue API: GET ${ORIGIN}/api/portfolio — Authorization: Bearer {token}`,
    other: `Store the token and endpoint:
  GET ${ORIGIN}/api/portfolio — Authorization: Bearer {token}`,
  };

  return `You are onboarding me to Compound — a live revenue dashboard at ${ORIGIN}. I have already signed in and created an agent token for you. Everything below is driven by API — no UI navigation needed.

STEP 1 — Get my token
Ask me: "Please paste your Compound agent token (it starts with cpd_live_…)"
Wait for me to paste it before continuing.

STEP 2 — Collect my product details
Ask me:
  a) Which payment provider do I use? (Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack)
  b) What is my product called?
  c) What is my read-only API key for that provider?
  d) What is my product's website URL? (optional — used for the logo)

STEP 3 — Connect my product via API
Make this request with the details I gave you:

  POST ${ORIGIN}/api/connections
  Authorization: Bearer {the token I gave you}
  Content-Type: application/json
  {
    "provider": "{provider from step 2a, lowercase: stripe | lemonsqueezy | polar | dodopayments | paystack}",
    "label": "{product name from step 2b}",
    "apiKey": "{API key from step 2c}",
    "websiteUrl": "{URL from step 2d, omit if not given}"
  }

If the response is 200, continue. If it errors, tell me the error message exactly.

STEP 4 — Sync my data
Trigger a sync so your portfolio reflects the connection you just made:

  POST ${ORIGIN}/api/sync
  Authorization: Bearer {the token I gave you}

Wait for the response before continuing.

STEP 5 — Pull my live data and brief me
Make this request:

  GET ${ORIGIN}/api/portfolio
  Authorization: Bearer {the token I gave you}

Parse the JSON response and give me a CFO-style briefing:
  - My total MRR and ARR
  - Active subscribers
  - 30-day trend (growing or declining, and by how much?)
  - The one thing I should focus on this week

STEP 6 — Save access for future use
${saveInstructions[agentId]}

Then tell me: "You're all set. I have live access to your revenue — ask me anything about your MRR."`;
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
            Your agent does<br />the setup. Via API.
          </h1>
          <p className="text-[16px] leading-[1.7] text-[#5c5856]">
            You do one thing: sign in and create a token. Paste it to your agent — it connects your payment provider, pulls your data, and briefs you. All via API, no UI hand-holding.
          </p>
        </div>

        {/* Pre-requisite banner */}
        <div className="mb-10 flex items-start gap-4 rounded-xl border border-[#e7e3db] bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[14px] font-bold text-white">!</div>
          <div className="flex-1">
            <p className="mb-1 text-[13px] font-semibold text-[#1a1a1a]">Do this once before copying the prompt</p>
            <p className="mb-3 text-[12px] leading-5 text-[#9c9894]">Sign in to Compound, then go to <strong className="text-[#1a1a1a]">Settings → Agents</strong> and create a token. Copy it — you&apos;ll paste it to your agent in the prompt below.</p>
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
                    { n: "1", label: "Asks for your token", desc: "You paste it once — that's the only manual step.", api: null },
                    { n: "2", label: "Collects provider details", desc: "Asks for your provider, product name, and read-only API key.", api: null },
                    { n: "3", label: "Connects your product", desc: "No form, no browser — pure API call.", api: "POST /api/connections" },
                    { n: "4", label: "Syncs your data", desc: "Pulls fresh data from your payment provider.", api: "POST /api/sync" },
                    { n: "5", label: "Briefs you on your revenue", desc: "Parses live portfolio data and explains what moved.", api: "GET /api/portfolio" },
                    { n: "6", label: "Saves access for later", desc: "Stores the token so it can answer revenue questions any time.", api: null },
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
                <p className="mb-1 text-[12px] font-semibold text-[#1a1a1a]">Your API key stays private</p>
                <p className="text-[11px] leading-5 text-[#9c9894]">
                  Compound stores your payment provider key encrypted. Your agent only gets a read-only Compound token — never your raw API keys.
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
