import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const GITHUB = "https://github.com/learnwithalex/compound";

export const metadata = {
  title: "Compound — Revenue OS for indie hackers",
  description:
    "Connect every Stripe and Lemon Squeezy account. Compound shows your total MRR across every product, with AI that explains why your numbers moved.",
};

export default function Home() {
  return (
    <div className={`${inter.variable} font-sans min-h-screen bg-[#111116] text-[#e2e2e9] antialiased`}>
      <SiteNav />
      <Hero />
      <TrustBar />
      <PortfolioSection />
      <AISection />
      <IntegrationsSection />
      <Pricing />
      <ClosingCta />
      <SiteFooter />
    </div>
  );
}

/* ================================================================ icons */
function Icon({ children, className = "h-5 w-5" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}
const ArrowRight = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M4.5 12.5l5 5 10-11" /></Icon>
);
const SparklesIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M3 12H2M22 12h-1M4.93 19.07l-.71.71M19.78 4.93l-.71-.71" />
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </Icon>
);
const GridIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </Icon>
);
const LinkIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Icon>
);

/* ===================================================================== nav */
function CompoundMark({ size = "h-6 w-6" }: { size?: string }) {
  return (
    <span className={`flex ${size} items-center justify-center rounded bg-[#5e6ad2] text-[11px] font-bold text-white`}>
      C
    </span>
  );
}

function SiteNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#111116]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <CompoundMark />
          <span className="text-[15px] font-semibold tracking-tight text-[#e2e2e9]">Compound</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[["#portfolio", "Features"], ["#ai", "AI insights"], ["#pricing", "Pricing"]].map(
            ([href, label]) => (
              <a key={href} href={href}
                className="rounded px-3 py-1.5 text-[13px] text-[#8a8a99] transition-colors hover:text-[#e2e2e9]">
                {label}
              </a>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <a href={GITHUB} className="text-[13px] text-[#8a8a99] transition-colors hover:text-[#e2e2e9]">
            GitHub
          </a>
          <Link href="/app"
            className="flex h-8 items-center rounded-md border border-[#5e6ad2]/50 bg-[#5e6ad2] px-3 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-opacity hover:opacity-90">
            Open app
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ====================================================================== hero */
function Hero() {
  return (
    <section className="px-6 pb-24 pt-40">
      <div className="mx-auto max-w-[1200px] text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#5e6ad2]/25 bg-[#5e6ad2]/10 px-4 py-1.5 text-[13px] text-[#9ba3e8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5e6ad2]" />
          Built for The Build Games · open source
        </div>

        <h1 className="mx-auto mb-6 max-w-3xl text-balance text-[44px] font-[580] leading-[1.0] tracking-[-0.025em] text-[#e2e2e9] sm:text-[68px]">
          All your MRR,<br />
          <span className="text-[#5e6ad2]">one command center.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-[16px] leading-7 text-[#8a8a99]">
          Connect every Stripe and Lemon Squeezy account. Compound shows your
          total revenue across every product, with AI that explains exactly why
          your numbers moved.
        </p>

        <div className="mb-20 flex flex-wrap items-center justify-center gap-3">
          <Link href="/app"
            className="flex h-10 items-center rounded-md bg-[#5e6ad2] px-5 text-[15px] font-medium text-white shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-opacity hover:opacity-90">
            Connect your products
          </Link>
          <a href={GITHUB}
            className="flex h-10 items-center rounded-md border border-white/[0.1] bg-white/[0.04] px-5 text-[15px] font-medium text-[#e2e2e9] transition-colors hover:bg-white/[0.07]">
            View source
          </a>
        </div>

        <DashboardMock />
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#14141a] shadow-[0_0_120px_-40px_rgba(94,106,210,0.3),0_20px_60px_-30px_rgba(0,0,0,1)]">
      {/* Mock header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#14141a] px-5 py-3">
        <CompoundMark size="h-5 w-5" />
        <span className="text-[13px] font-semibold text-[#e2e2e9]">Compound</span>
        <div className="ml-4 hidden items-center gap-5 text-[13px] sm:flex">
          <span className="-mb-3 border-b border-[#5e6ad2] pb-3 font-medium text-[#e2e2e9]">Portfolio</span>
          <span className="text-[#8a8a99]">Connections</span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-b border-white/[0.06] sm:grid-cols-4">
        {[
          { label: "Total MRR", value: "$140.5k", delta: "+8.2%" },
          { label: "Active Subs", value: "2,847", delta: "+124" },
          { label: "Net new MRR", value: "$11.2k", delta: "+3.1%" },
          { label: "Products", value: "3", delta: null },
        ].map((k) => (
          <div key={k.label} className="px-5 py-4 text-left">
            <div className="mb-1 text-[11px] uppercase tracking-wider text-[#4a4a5a]">{k.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tabular-nums text-[#e2e2e9]">{k.value}</span>
              {k.delta && (
                <span className="text-[11px] font-medium text-[#5e6ad2]">{k.delta}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3">
        {[
          { name: "TypingMind", provider: "Stripe", mrr: "$129.8k", subs: 2104, change: "+5.1%", positive: true },
          { name: "DevUtils", provider: "Stripe", mrr: "$8.4k", subs: 680, change: "+18.3%", positive: true },
          { name: "X Napper", provider: "Lemon Squeezy", mrr: "$2.3k", subs: 63, change: "-4.1%", positive: false },
        ].map((p) => (
          <div key={p.name} className="bg-[#14141a] p-5 text-left">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-[#e2e2e9]">{p.name}</div>
                <div className="mt-0.5 text-[11px] text-[#4a4a5a]">{p.provider}</div>
              </div>
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                p.positive ? "bg-[#5e6ad2]/15 text-[#9ba3e8]" : "bg-red-500/10 text-red-400"
              }`}>{p.change}</span>
            </div>
            <div className="mb-1 text-2xl font-semibold tabular-nums tracking-tight text-[#e2e2e9]">{p.mrr}</div>
            <div className="text-[11px] text-[#8a8a99]">{p.subs.toLocaleString()} subscribers</div>
            {/* Mini sparkline */}
            <svg viewBox="0 0 120 32" className="mt-3 h-8 w-full" aria-hidden>
              <defs>
                <linearGradient id={`g-${p.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5e6ad2" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5e6ad2" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none" stroke="#5e6ad2" strokeWidth="1.5"
                points="0,24 20,20 40,18 60,22 80,14 100,10 120,8"
              />
              <path
                fill={`url(#g-${p.name})`}
                d="M0,24 20,20 40,18 60,22 80,14 100,10 120,8 120,32 0,32 Z"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* AI insight strip */}
      <div className="border-t border-white/[0.06] bg-[#5e6ad2]/[0.06] px-5 py-4 text-left">
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5e6ad2]" />
          <p className="text-[13px] leading-5 text-[#8a8a99]">
            <span className="font-medium text-[#e2e2e9]">Portfolio growing 8.2% this month.</span>{" "}
            DevUtils is your standout — 18% MRR growth driven by new annual plan uptake.
            X Napper is sliding; your churn rate there (4.1%) needs attention before it compounds.
            Recommendation: double down on DevUtils onboarding while you still have momentum.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ trust bar */
function TrustBar() {
  return (
    <div className="border-y border-white/[0.06] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-[10px] uppercase tracking-[0.15em] text-[#4a4a5a]">Works with</p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {[
            { name: "Stripe", d: "M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" },
          ].map((b) => (
            <div key={b.name} className="flex items-center gap-2 text-[#4a4a5a]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d={b.d} />
              </svg>
              <span className="text-sm font-semibold">{b.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[#4a4a5a]">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#4a4a5a]/40 text-[8px] font-bold text-[#4a4a5a]">LS</span>
            <span className="text-sm font-semibold">Lemon Squeezy</span>
          </div>
          <span className="text-[11px] text-[#4a4a5a]">More coming</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================== portfolio section */
function PortfolioSection() {
  return (
    <section id="portfolio" className="scroll-mt-20 px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-16 grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.15em] text-[#5e6ad2]">Portfolio view</p>
            <h2 className="text-[32px] font-[580] leading-[1.1] tracking-[-0.022em] text-[#e2e2e9] sm:text-[44px]">
              Stop logging into<br />five dashboards.
            </h2>
          </div>
          <div>
            <p className="text-[17px] leading-7 text-[#8a8a99]">
              Every product, every payment processor, one unified view.
              Compound pulls in live data from all your connected accounts and
              shows you total MRR, net new, churn, and subscriber counts —
              across everything you've built.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Total portfolio MRR + ARR at a glance",
                "Per-product breakdown with 30-day trends",
                "New vs churned MRR delta every day",
                "One-click sync across all accounts",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#8a8a99]">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5e6ad2]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <GridIcon className="h-5 w-5" />,
              title: "Portfolio overview",
              body: "Combined MRR, ARR, and subscription count across every product in one number.",
            },
            {
              icon: <ArrowRight className="h-5 w-5" />,
              title: "Daily snapshots",
              body: "MRR is snapshotted daily so you can see exactly when things moved and by how much.",
            },
            {
              icon: <LinkIcon className="h-5 w-5" />,
              title: "Multiple accounts",
              body: "One product on Stripe, another on Lemon Squeezy — connect as many as you have.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-lg border border-white/[0.07] bg-[#14141a] p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-[#5e6ad2]">
                {c.icon}
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-[#e2e2e9]">{c.title}</h3>
              <p className="text-[14px] leading-6 text-[#8a8a99]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== AI section */
function AISection() {
  return (
    <section id="ai" className="scroll-mt-20 border-t border-white/[0.06] px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-16 grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.15em] text-[#5e6ad2]">AI insights</p>
            <h2 className="text-[32px] font-[580] leading-[1.1] tracking-[-0.022em] text-[#e2e2e9] sm:text-[44px]">
              Numbers are facts.<br />
              <span className="text-[#5e6ad2]">AI gives context.</span>
            </h2>
          </div>
          <div>
            <p className="text-[17px] leading-7 text-[#8a8a99]">
              Compound connects to Claude to give you a CFO-style briefing on demand.
              It reads your entire portfolio, spots what's working and what's sliding,
              and gives you one specific action to take. No fluff — written like a text
              from a sharp co-founder.
            </p>
          </div>
        </div>

        {/* AI mock */}
        <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#14141a]">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="h-4 w-4 text-[#5e6ad2]" />
              <span className="text-[13px] font-medium text-[#e2e2e9]">AI portfolio analysis</span>
              <span className="ml-auto text-[11px] text-[#4a4a5a]">Powered by Claude</span>
            </div>
          </div>
          <div className="px-6 py-8">
            <div className="max-w-2xl">
              <p className="mb-6 text-[15px] leading-7 text-[#8a8a99]">
                <span className="font-medium text-[#e2e2e9]">Portfolio is healthy but lopsided.</span>{" "}
                TypingMind carries 92% of your MRR at $129.8k — that's concentration risk, not a
                portfolio. DevUtils is the bright spot: 18% growth month-over-month means your
                developer tooling angle is working.
              </p>
              <p className="mb-6 text-[15px] leading-7 text-[#8a8a99]">
                X Napper is a concern. At $2.3k MRR and -4.1% trend, it's losing ground
                consistently. Small products churn faster than big ones — if you're not actively
                improving it, it'll hit zero before you notice.
              </p>
              <p className="text-[15px] leading-7 text-[#8a8a99]">
                <span className="font-medium text-[#e2e2e9]">One thing to do this week:</span>{" "}
                Look at your DevUtils trial-to-paid conversion. If 18% MRR growth is coming from
                volume rather than conversion rate, you have untapped leverage — one better
                onboarding email could double that number.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <button className="flex h-8 items-center gap-2 rounded-md bg-[#5e6ad2] px-3 text-[13px] font-medium text-white opacity-60">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Re-analyze
                </button>
                <span className="text-[12px] text-[#4a4a5a]">Analyzes in ~2 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================= integrations */
function IntegrationsSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[#5e6ad2]">Integrations</p>
        <h2 className="mb-4 max-w-lg text-[32px] font-[580] leading-[1.1] tracking-[-0.022em] text-[#e2e2e9] sm:text-[44px]">
          Connect in 30 seconds.
        </h2>
        <p className="mb-16 max-w-md text-[16px] leading-7 text-[#8a8a99]">
          Paste an API key and you're live. No OAuth flows, no sales calls, no 14-day
          trial period before you can see your own numbers.
        </p>

        <div className="grid gap-px bg-white/[0.06] overflow-hidden rounded-xl sm:grid-cols-2">
          {[
            {
              name: "Stripe",
              status: "Live",
              desc: "Connect any Stripe account. Compound reads active subscriptions and normalizes billing intervals to monthly MRR.",
              items: ["Active subscriptions", "MRR by billing interval", "Daily snapshots", "New + churned MRR"],
            },
            {
              name: "Lemon Squeezy",
              status: "Coming soon",
              desc: "Same integration pattern as Stripe. Paste your API key and your Lemon Squeezy products join the portfolio.",
              items: ["Active subscriptions", "MRR normalization", "Combined portfolio view", "Variant-level breakdown"],
            },
          ].map((i) => (
            <div key={i.name} className="bg-[#14141a] p-8">
              <div className="mb-1 flex items-center gap-3">
                <h3 className="text-[16px] font-semibold text-[#e2e2e9]">{i.name}</h3>
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  i.status === "Live" ? "bg-[#5e6ad2]/15 text-[#9ba3e8]" : "bg-white/[0.05] text-[#4a4a5a]"
                }`}>{i.status}</span>
              </div>
              <p className="mb-6 text-[14px] leading-6 text-[#8a8a99]">{i.desc}</p>
              <ul className="space-y-2.5">
                {i.items.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#8a8a99]">
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#5e6ad2]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================= pricing */
function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-white/[0.06] px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[#5e6ad2]">Pricing</p>
        <h2 className="mb-3 text-[40px] font-[580] tracking-[-0.025em] text-[#e2e2e9]">
          Free for indie hackers, forever.
        </h2>
        <p className="mb-14 text-[#8a8a99]">
          Baremetrics charges $108/mo. ChartMogul starts at $100.
          Compound is free — because you're already building on tight margins.
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              name: "Indie",
              price: "Free",
              note: "forever",
              highlight: true,
              features: [
                "Up to 5 connected accounts",
                "Stripe + Lemon Squeezy",
                "Daily MRR snapshots",
                "AI portfolio analysis",
                "30-day history",
              ],
              cta: "Connect your products",
              href: "/app",
            },
            {
              name: "Studio",
              price: "$19",
              note: "/month",
              features: [
                "Unlimited connected accounts",
                "Full MRR history",
                "Expansion + contraction tracking",
                "CSV export",
                "Email digest",
              ],
              cta: "Coming soon",
              href: "#",
            },
            {
              name: "Self-hosted",
              price: "Free",
              note: "forever",
              features: [
                "Deploy on your own infra",
                "Bring your own Claude key",
                "Full source code",
                "MIT licensed",
              ],
              cta: "View on GitHub",
              href: GITHUB,
            },
          ].map((plan) => (
            <div key={plan.name}
              className={`relative flex flex-col rounded-xl border p-7 ${
                plan.highlight
                  ? "border-[#5e6ad2]/40 bg-[#5e6ad2]/[0.06]"
                  : "border-white/[0.07] bg-[#14141a]"}`}>
              {plan.highlight && (
                <span className="absolute -top-px left-6 rounded-b-none rounded-t-xl bg-[#5e6ad2] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  For you
                </span>
              )}
              <p className={`mb-2 text-[11px] uppercase tracking-wider ${plan.highlight ? "text-[#9ba3e8]" : "text-[#4a4a5a]"}`}>
                {plan.name}
              </p>
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-[#e2e2e9]">{plan.price}</span>
                <span className="text-sm text-[#8a8a99]">{plan.note}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-[#8a8a99]">
                    <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-[#5e6ad2]" : "text-[#4a4a5a]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`rounded-lg py-2.5 text-center text-[14px] font-medium transition-opacity ${
                  plan.highlight
                    ? "bg-[#5e6ad2] text-white hover:opacity-90"
                    : "border border-white/[0.1] text-[#8a8a99] hover:bg-white/[0.04]"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================= closing cta */
function ClosingCta() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-32 text-center">
      <div className="mx-auto max-w-2xl">
        <CompoundMark size="h-10 w-10" />
        <h2 className="mx-auto mb-5 mt-8 text-[36px] font-[580] leading-[1.05] tracking-[-0.022em] text-[#e2e2e9] sm:text-[52px]">
          One view for everything you've built.
        </h2>
        <p className="mb-10 text-[16px] leading-7 text-[#8a8a99]">
          Free to use. Open source. Built specifically for founders with more than one thing going on.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/app"
            className="flex h-10 items-center rounded-md bg-[#5e6ad2] px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90">
            Connect your products
          </Link>
          <a href={GITHUB}
            className="flex h-10 items-center gap-1.5 rounded-md border border-white/[0.1] bg-white/[0.04] px-5 text-[15px] font-medium text-[#e2e2e9] transition-colors hover:bg-white/[0.07]">
            Star on GitHub
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================================= footer */
function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CompoundMark />
              <span className="text-sm font-semibold text-[#e2e2e9]">Compound</span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-[#4a4a5a]">
              Revenue OS for indie hackers with multiple products.
              Free forever, open source.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "Features", href: "#portfolio" },
            { label: "AI insights", href: "#ai" },
            { label: "Pricing", href: "#pricing" },
          ]} />
          <FooterCol title="Get started" links={[
            { label: "Open app", href: "/app" },
            { label: "Connect Stripe", href: "/app/connect" },
          ]} />
          <FooterCol title="Project" links={[
            { label: "Source on GitHub", href: GITHUB },
            { label: "The Build Games", href: "https://canivibecodeit.com/thebuildgames" },
          ]} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-7 text-xs text-[#4a4a5a]">
          <span>© 2026 Compound. MIT licensed.</span>
          <span>Built for The Build Games · Sep 2026</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-[10px] uppercase tracking-[0.15em] text-[#4a4a5a]">{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-xs text-[#4a4a5a] transition-colors hover:text-[#e2e2e9]">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
