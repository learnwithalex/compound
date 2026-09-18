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
  const agent = AGENTS.find((a) => a.id === agentId)!;

  const intro = `You are helping me set up Compound — a live revenue dashboard for indie hackers at ${ORIGIN}.

I want you to do the entire onboarding for me. Here is exactly what to do, step by step:`;

  const step1 = `
STEP 1 — Sign in (I'll do this part myself)
Tell me: "Please sign in at ${ORIGIN}/login using Google, then let me know when you're done."
Wait for my confirmation before continuing.`;

  const step2 = `
STEP 2 — Collect my product details
Ask me:
  a) Which payment provider do I use? (Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack)
  b) What is my product called?
  c) What is my read-only API key for that provider?
  d) What is my product's website URL? (optional, for the logo)`;

  const step3 = `
STEP 3 — Create your access token
Tell me: "Please go to ${ORIGIN}/app/agents, pick your agent type, create a token, and paste it back to me."
Wait for me to paste the token before continuing.`;

  const step4 = `
STEP 4 — Add my product connection
Navigate me to ${ORIGIN}/app/connect and guide me to:
  - Select the provider I told you in Step 2
  - Enter the product name and API key
  - Submit the form
Tell me what to click or fill in at each field.`;

  const step5 = `
STEP 5 — Verify everything is working
Call the Compound API with the token I gave you:
  GET ${ORIGIN}/api/portfolio
  Authorization: Bearer {the token I gave you}

Parse the JSON response and give me a CFO-style briefing:
  - My total MRR and ARR
  - Active subscribers
  - 30-day trend (is it growing or declining, and by how much?)
  - The one thing I should focus on this week`;

  const step6 = `
STEP 6 — Set up ongoing access
${agentId === "claude" ? `Save this to your memory or system prompt so you can always check my revenue:
  GET ${ORIGIN}/api/portfolio  —  Authorization: Bearer {token}` : ""}
${agentId === "cursor" ? `Add this to my .cursorrules file:
  # Compound revenue API
  GET ${ORIGIN}/api/portfolio with Authorization: Bearer {token}
  Use this when I ask about MRR, subscribers, or business metrics.` : ""}
${agentId === "windsurf" ? `Add this to my .windsurfrules file:
  # Compound revenue API
  GET ${ORIGIN}/api/portfolio with Authorization: Bearer {token}
  Use this when I ask about MRR, subscribers, or business metrics.` : ""}
${agentId === "opencode" ? `Add this to my AGENTS.md file:
  # Compound revenue API
  GET ${ORIGIN}/api/portfolio with Authorization: Bearer {token}
  Use this when I ask about MRR, subscribers, or business metrics.` : ""}
${(agentId === "chatgpt" || agentId === "other") ? `Remember this for future conversations:
  My revenue data: GET ${ORIGIN}/api/portfolio
  Authorization: Bearer {token}` : ""}

Tell me: "You're all set. I now have live access to your revenue. Ask me anything about your MRR."`;

  return [intro, step1, step2, step3, step4, step5, step6].join("\n");
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
            Let your AI agent<br />set up Compound.
          </h1>
          <p className="text-[16px] leading-[1.7] text-[#5c5856]">
            Sign in, pick your agent, copy the prompt. Your AI does the rest — connects your payment provider, creates its own access token, and briefs you on your revenue.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: agent picker + prompt */}
          <div>
            {/* Step 1 */}
            <div className="mb-8">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">1 — Sign in first</p>
              <div className="flex items-center gap-4 rounded-sm border border-[#e7e3db] bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[15px] font-bold text-white">1</div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#1a1a1a]">Create your Compound account</p>
                  <p className="text-[12px] text-[#9c9894]">One-click Google sign-in — your agent needs an account to connect to.</p>
                </div>
                <Link
                  href="/login"
                  className="shrink-0 rounded-sm bg-[#1a1a2e] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
                >
                  Sign in →
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">2 — Pick your agent</p>
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

            {/* Step 3: prompt */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">3 — Copy this prompt into {selectedAgent.label}</p>
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

          {/* Right: how it works */}
          <div className="lg:pt-[68px]">
            <div className="sticky top-[80px] space-y-4">
              <div className="rounded-sm border border-[#e7e3db] bg-white p-5">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">What the agent does</p>
                <div className="space-y-4">
                  {[
                    { n: "1", label: "Confirms you're signed in", desc: "Waits for your confirmation before continuing." },
                    { n: "2", label: "Asks for your payment details", desc: "Provider, product name, and read-only API key — it types nothing without asking." },
                    { n: "3", label: "Guides you to create a token", desc: "Walks you to /app/agents where you create its access token." },
                    { n: "4", label: "Connects your product", desc: "Guides you through the Connect form step by step." },
                    { n: "5", label: "Runs your first briefing", desc: "Fetches live data and gives you a CFO-style read on your MRR." },
                    { n: "6", label: "Saves access for future use", desc: "Stores the token so it can answer revenue questions anytime." },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[10px] font-bold text-white mt-0.5">
                        {s.n}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{s.label}</p>
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
