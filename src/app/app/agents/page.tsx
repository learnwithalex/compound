"use client";
import { useEffect, useState } from "react";

interface Token {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function LogoImg({ domain, alt }: { domain: string; alt: string }) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={alt}
      width={24}
      height={24}
      className="h-6 w-6 rounded-sm object-contain"
    />
  );
}

const AGENTS = [
  {
    id: "claude",
    label: "Claude",
    sub: "Desktop or Code",
    defaultName: "claude",
    icon: <LogoImg domain="claude.ai" alt="Claude" />,
  },
  {
    id: "cursor",
    label: "Cursor",
    sub: "via .cursorrules",
    defaultName: "cursor",
    icon: <LogoImg domain="cursor.com" alt="Cursor" />,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    sub: "Custom instruction",
    defaultName: "chatgpt",
    icon: <LogoImg domain="chatgpt.com" alt="ChatGPT" />,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    sub: "via .windsurfrules",
    defaultName: "windsurf",
    icon: <LogoImg domain="windsurf.com" alt="Windsurf" />,
  },
  {
    id: "script",
    label: "Script / API",
    sub: "cURL, Python, any HTTP",
    defaultName: "api-script",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#6b7280" />
        <path d="M8 9l-3 3 3 3M16 9l3 3-3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7l-4 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

type AgentId = typeof AGENTS[number]["id"];

const STEP_IN = `
  @keyframes stepIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .step-in { animation: stepIn 0.22s ease both; }
`;

function getInstructions(agentId: AgentId, token: string, origin: string) {
  const url = `${origin}/api/portfolio`;

  if (agentId === "claude") {
    return {
      steps: [
        {
          title: "Add a system prompt in Claude Desktop / Claude.ai",
          description: 'Go to Settings → Custom instructions (or paste in any conversation before asking).',
          copy: `You have access to my live revenue dashboard. When I ask about MRR, customers, trends, or business performance, fetch data from:

GET ${url}
Authorization: Bearer ${token}

Then give me a clear, direct answer with the numbers.`,
          lang: "text",
        },
        {
          title: "Or use the API endpoint directly",
          description: "Pipe the JSON response into any Claude conversation.",
          copy: `curl -H "Authorization: Bearer ${token}" ${url}`,
          lang: "bash",
        },
      ],
    };
  }

  if (agentId === "cursor") {
    return {
      steps: [
        {
          title: "Add to .cursorrules in your project root",
          description: "Cursor will automatically pass this context to the AI on every request.",
          copy: `# Revenue data
When the user asks about MRR, ARR, subscribers, or business metrics, fetch live data:
GET ${url}
Authorization: Bearer ${token}

Use the response to answer accurately. Do not guess revenue numbers.`,
          lang: "text",
        },
        {
          title: "Or paste as a Cursor rule in Settings → Rules for AI",
          description: "This applies globally across all your Cursor projects.",
          copy: `Compound revenue API: GET ${url} with Authorization: Bearer ${token}`,
          lang: "text",
        },
      ],
    };
  }

  if (agentId === "chatgpt") {
    return {
      steps: [
        {
          title: "Add to your Custom Instructions",
          description: 'In ChatGPT, go to your profile → Customize ChatGPT → "What would you like ChatGPT to know about you?"',
          copy: `I track my product revenue via Compound. My live data is at ${url} — use Authorization: Bearer ${token} to fetch it when I ask about my MRR, customers, or business metrics.`,
          lang: "text",
        },
        {
          title: "Or build a Custom GPT with an Action",
          description: "Add an OpenAPI action that calls the portfolio endpoint with your token.",
          copy: `{
  "openapi": "3.1.0",
  "info": { "title": "Compound Portfolio", "version": "1.0" },
  "servers": [{ "url": "${origin}" }],
  "paths": {
    "/api/portfolio": {
      "get": {
        "operationId": "getPortfolio",
        "summary": "Fetch live MRR and subscription data",
        "security": [{ "bearer": [] }]
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearer": { "type": "http", "scheme": "bearer" }
    }
  }
}`,
          lang: "json",
        },
      ],
    };
  }

  if (agentId === "windsurf") {
    return {
      steps: [
        {
          title: "Add to .windsurfrules in your project root",
          description: "Windsurf (Codeium) reads this file as persistent AI context.",
          copy: `# Revenue context
Live MRR and subscription data is at ${url}
Use Authorization: Bearer ${token}
Fetch this when the user asks about revenue, MRR, customers, or business metrics.`,
          lang: "text",
        },
      ],
    };
  }

  // script
  return {
    steps: [
      {
        title: "Fetch your portfolio snapshot",
        description: "Returns full MRR, ARR, active subs, 30-day trend, and per-product breakdown.",
        copy: `curl -H "Authorization: Bearer ${token}" \\
  ${url}`,
        lang: "bash",
      },
      {
        title: "Force a sync first (optional)",
        description: "Refreshes all your connected payment providers before reading.",
        copy: `curl -X POST -H "Authorization: Bearer ${token}" \\
  ${origin}/api/sync`,
        lang: "bash",
      },
      {
        title: "Get an AI briefing as JSON",
        description: "Returns a Claude-written CFO analysis of your current metrics.",
        copy: `curl -X POST -H "Authorization: Bearer ${token}" \\
  ${origin}/api/analyze`,
        lang: "bash",
      },
    ],
  };
}

export default function AgentsPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [animKey, setAnimKey] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/tokens");
    if (res.ok) setTokens(await res.json());
  }
  useEffect(() => { load(); }, []);

  function pickAgent(id: AgentId) {
    const agent = AGENTS.find((a) => a.id === id)!;
    setSelectedAgent(id);
    setName(agent.defaultName);
    setAnimKey((k) => k + 1);
    setStep(2);
  }

  async function createToken() {
    setBusy(true);
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() || selectedAgent || "agent" }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setFreshToken(data.token);
    setAnimKey((k) => k + 1);
    setStep(3);
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

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  function reset() {
    setStep(1);
    setSelectedAgent(null);
    setFreshToken(null);
    setAnimKey((k) => k + 1);
  }

  const agent = AGENTS.find((a) => a.id === selectedAgent);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://usecompound.xyz";
  const instructions = freshToken && selectedAgent ? getInstructions(selectedAgent, freshToken, origin) : null;

  return (
    <div>
      <style>{STEP_IN}</style>

      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">Agents</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.025em" }}>Connect your AI agent</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-lx-muted max-w-md">
          Give your AI agent live read access to your portfolio — then let it brief you, write reports, or trigger automations.
        </p>
      </div>

      <div className="flex gap-10 items-start">
        {/* Main flow */}
        <div className="flex-1 max-w-[540px]">

          {/* Step breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            {[
              { n: 1, label: "Pick agent" },
              { n: 2, label: "Create token" },
              { n: 3, label: "Set up" },
            ].map(({ n, label }, i) => (
              <span key={n} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#d0d0d0] text-[12px]">/</span>}
                <span
                  className="text-[12px] font-medium"
                  style={{ color: step === n ? "#1a1a1a" : step > n ? "#10b981" : "#c0c0c0" }}
                >
                  {step > n ? "✓ " : ""}{label}
                </span>
              </span>
            ))}
          </div>

          {/* Step 1: Pick agent */}
          {step === 1 && (
            <div key={`s1-${animKey}`} className="step-in">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {AGENTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => pickAgent(a.id)}
                    className="flex flex-col items-start gap-3 rounded-sm bg-white p-4 text-left transition-all hover:shadow-sm hover:-translate-y-px"
                    style={{ border: "1px solid #ebebeb" }}
                  >
                    {a.icon}
                    <div>
                      <p className="text-[13px] font-semibold text-lx-text">{a.label}</p>
                      <p className="text-[11px] text-lx-faint">{a.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Name & create token */}
          {step === 2 && agent && (
            <div key={`s2-${animKey}`} className="step-in">
              <div className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm" style={{ background: "#f5f5f4", border: "1px solid #ebebeb" }}>
                    {agent.icon}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-lx-text">{agent.label}</p>
                    <p className="text-[12px] text-lx-faint">{agent.sub}</p>
                  </div>
                </div>

                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Token name</label>
                <p className="mb-2 text-[12px] text-lx-faint">Give it a name so you can recognise it later.</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createToken()}
                  className="mb-4 w-full rounded-sm px-3 py-2.5 text-[13px] text-lx-text focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/25"
                  style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => { setStep(1); setAnimKey((k) => k + 1); }}
                    className="rounded-sm px-4 py-2.5 text-[13px] font-medium text-lx-faint transition-colors hover:text-lx-muted"
                    style={{ border: "1px solid #ebebeb" }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={createToken}
                    disabled={busy}
                    className="flex-1 rounded-sm py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                    style={{ background: "#5e6ad2" }}
                  >
                    {busy ? "Creating…" : "Create token →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Setup guide */}
          {step === 3 && agent && freshToken && instructions && (
            <div key={`s3-${animKey}`} className="step-in space-y-4">
              {/* Token copy */}
              <div className="rounded-sm bg-white p-5" style={{ border: "1px solid #10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.07)" }}>
                <div className="mb-1 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,8 6,12 14,4" />
                  </svg>
                  <p className="text-[13px] font-semibold text-lx-text">Token created — copy it now</p>
                </div>
                <p className="mb-3 text-[12px] text-lx-faint">This is shown once. Store it somewhere safe before continuing.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-sm px-3 py-2 font-mono text-[11px] text-lx-muted" style={{ background: "#f9f9f8", border: "1px solid #ebebeb" }}>
                    {freshToken}
                  </code>
                  <button
                    onClick={() => copy(freshToken, "token")}
                    className="shrink-0 rounded-sm px-3 py-2 text-[12px] font-semibold transition-colors"
                    style={{ background: copied === "token" ? "#10b981" : "#f9f9f8", color: copied === "token" ? "white" : "#6b6b6b", border: "1px solid #ebebeb" }}
                  >
                    {copied === "token" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Agent-specific steps */}
              {instructions.steps.map((s, i) => (
                <div key={i} className="rounded-sm bg-white p-5" style={{ border: "1px solid #ebebeb" }}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#5e6ad2" }}>{i + 1}</span>
                    <p className="text-[13px] font-semibold text-lx-text">{s.title}</p>
                  </div>
                  <p className="mb-3 pl-7 text-[12px] text-lx-faint">{s.description}</p>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-sm p-4 font-mono text-[11px] leading-5 text-lx-muted" style={{ background: "#f9f9f8", border: "1px solid #ebebeb" }}>
                      {s.copy}
                    </pre>
                    <button
                      onClick={() => copy(s.copy, `step-${i}`)}
                      className="absolute right-2 top-2 rounded-sm px-2 py-1 text-[10px] font-semibold transition-colors"
                      style={{ background: copied === `step-${i}` ? "#5e6ad2" : "white", color: copied === `step-${i}` ? "white" : "#8a8a8a", border: "1px solid #e0e0e0" }}
                    >
                      {copied === `step-${i}` ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={reset}
                className="text-[12px] text-lx-faint transition-colors hover:text-lx-muted"
              >
                ← Connect another agent
              </button>
            </div>
          )}
        </div>

        {/* Right: active tokens */}
        {tokens.length > 0 && (
          <div className="w-[240px] shrink-0 sticky top-6">
            <div className="rounded-sm bg-white overflow-hidden" style={{ border: "1px solid #ebebeb" }}>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-lx-faint">Active tokens</p>
              </div>
              <div className="divide-y divide-[#f0f0f0]">
                {tokens.map((t) => (
                  <div key={t.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-lx-text">{t.name}</p>
                        <p className="font-mono text-[10px] text-lx-faint">{t.tokenPrefix}…</p>
                      </div>
                      <button
                        onClick={() => revoke(t.id)}
                        className="shrink-0 text-[11px] text-[#e3493c] opacity-60 hover:opacity-100 transition-opacity"
                      >
                        Revoke
                      </button>
                    </div>
                    <p className="mt-0.5 text-[10px] text-lx-faint">
                      {t.lastUsedAt ? `Used ${new Date(t.lastUsedAt).toLocaleDateString()}` : "Never used"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
