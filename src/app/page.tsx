import { Instrument_Serif } from "next/font/google";
import Link from "next/link";
import { AgentPillLink } from "./agent-pill";
import { CompoundMark, CompoundWordmark } from "./compound-logo";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

const GITHUB = "https://github.com/learnwithalex/compound";

export const metadata = {
  title: "Compound — Revenue OS for indie hackers",
  description:
    "Connect every Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack account. One dashboard for your whole portfolio, with AI that explains why the numbers moved.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3f1ec] font-sans text-[#1a1a1a] antialiased">
      <AnnouncementBar />
      <SiteNav />
      <Hero />
      <StatsStrip />
      <PortfolioShowcase />
      <AIBriefingShowcase />
      <FeatureGrid />
      <AgentSection />
      <PricingSection />
      <FAQSection />
      <SiteFooter />
    </div>
  );
}

/* ================================================================ shared */

function Icon({ children, className = "h-5 w-5" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}
const CheckIcon = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M4.5 12.5l5 5 10-11" /></Icon>
);
const ChevronDown = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M6 9l6 6 6-6" /></Icon>
);
const SparklesIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
  </Icon>
);
const ArrowRight = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);

/* Corner-bracketed box — the core sent.dm visual language */
function CornerBox({
  children,
  variant = "gray",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "orange" | "blue" | "gray";
  className?: string;
}) {
  const cfg = {
    orange: { border: "border-orange-400/70", corner: "#fb923c", dashed: true },
    blue:   { border: "border-blue-500/60",   corner: "#3b82f6", dashed: true },
    gray:   { border: "border-[#c8c4bc]",     corner: "#a8a49c", dashed: false },
  }[variant];

  const dash = cfg.dashed ? "border-dashed" : "";

  return (
    <div className={`relative border ${cfg.border} ${dash} bg-white ${className}`}>
      {/* TL */}
      <svg className="absolute -left-[2px] -top-[2px] z-10" width="12" height="12" viewBox="0 0 12 12">
        <path d="M0 8 L0 0 L8 0" fill="none" stroke={cfg.corner} strokeWidth="2" />
      </svg>
      {/* TR */}
      <svg className="absolute -right-[2px] -top-[2px] z-10" width="12" height="12" viewBox="0 0 12 12">
        <path d="M4 0 L12 0 L12 8" fill="none" stroke={cfg.corner} strokeWidth="2" />
      </svg>
      {/* BL */}
      <svg className="absolute -bottom-[2px] -left-[2px] z-10" width="12" height="12" viewBox="0 0 12 12">
        <path d="M0 4 L0 12 L8 12" fill="none" stroke={cfg.corner} strokeWidth="2" />
      </svg>
      {/* BR */}
      <svg className="absolute -bottom-[2px] -right-[2px] z-10" width="12" height="12" viewBox="0 0 12 12">
        <path d="M4 12 L12 12 L12 4" fill="none" stroke={cfg.corner} strokeWidth="2" />
      </svg>
      {children}
    </div>
  );
}

function StatusBadge({ label, color }: { label: string; color: "green" | "blue" | "teal" | "purple" }) {
  const styles = {
    green:  "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue:   "text-blue-700 bg-blue-50 border-blue-200",
    teal:   "text-teal-700 bg-teal-50 border-teal-200",
    purple: "text-violet-700 bg-violet-50 border-violet-200",
  }[color];
  const dots = {
    green:  "bg-emerald-500",
    blue:   "bg-blue-500",
    teal:   "bg-teal-500",
    purple: "bg-violet-500",
  }[color];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots}`} />
      {label}
    </span>
  );
}

/* ===================================================== announcement bar */
function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-3 bg-[#1a1a2e] px-4 py-2.5 text-[13px] text-white">
      <span className="rounded bg-[#5e6ad2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">NEW</span>
      <span className="text-white/80">Now with Polar, DodoPayments &amp; Paystack — 5 providers live</span>
      <a href={GITHUB} className="flex items-center gap-1 font-medium underline underline-offset-2 hover:text-white/80">
        View on GitHub <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ======================================================================= nav */

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e3db] bg-[#f3f1ec]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2" aria-label="Compound home">
          <CompoundWordmark height={24} />
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {[["Features", "#abstraction"], ["How it works", "#how"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <a key={label} href={href}
              className="flex items-center gap-0.5 rounded px-3 py-1.5 text-[13px] text-[#5c5856] transition-colors hover:text-[#1a1a1a]">
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a href={GITHUB}
            className="hidden text-[13px] text-[#5c5856] transition-colors hover:text-[#1a1a1a] sm:block">
            GitHub
          </a>
          <Link href="/login"
            className="text-[13px] text-[#5c5856] transition-colors hover:text-[#1a1a1a]">
            Sign in
          </Link>
          <Link href="/app"
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#1a1a2e] px-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-85">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ========================================================================= hero */
function Hero() {
  return (
    <section
      className="relative overflow-hidden pb-0 pt-16"
      style={{
        backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(0,0,0,0.028) 14px, rgba(0,0,0,0.028) 15px)`,
      }}
    >
      <div className="mx-auto max-w-6xl px-8">
        <div className="grid min-h-[640px] items-center gap-16 lg:grid-cols-2">

          {/* ── Left col ── */}
          <div className="py-16">
            <h1 className={`${instrumentSerif.className} mb-4 text-[76px] leading-[1.0] tracking-[-0.01em] text-[#1a1a1a]`}>
              One dashboard.<br /><em className="italic">Every product.</em>
            </h1>
            <p className="mb-7 text-[16px] leading-[1.65] text-[#5c5856]">
              Connect all your payment accounts. Compound shows
              total revenue across your whole portfolio, with AI that explains
              exactly why your numbers moved.
            </p>

            {/* primary CTA + agent onboard — always one line */}
            <div className="mb-6 flex items-center gap-5">
              <Link href="/app"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border-2 border-[#1a1a1a] bg-[#1a1a1a] px-5 text-[14px] font-semibold text-white shadow-[3px_3px_0_#1a1a1a] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#1a1a1a]">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <AgentPillLink />
            </div>

            {/* connect bar */}
            <div className="mb-5 flex items-center overflow-hidden rounded-lg border border-[#e7e3db] bg-white">
              <div className="flex shrink-0 items-center gap-1.5 border-r border-[#e7e3db] px-3 py-3">
                <img src="https://cdn.simpleicons.org/stripe/635bff" alt="Stripe" className="h-5 w-5 rounded" width={20} height={20} loading="eager" />
                <img src="https://cdn.simpleicons.org/lemonsqueezy/e5a00d" alt="Lemon Squeezy" className="h-5 w-5 rounded" width={20} height={20} loading="eager" />
                <img src="/polar-icon.svg" alt="Polar" className="h-5 w-5 rounded" width={20} height={20} loading="eager" />
                <img src="/dodopayments-icon.svg" alt="DodoPayments" className="h-5 w-5 rounded bg-[#1a1a1a]" width={20} height={20} loading="eager" />
                <img src="/paystack-icon.png" alt="Paystack" className="h-5 w-5 rounded" width={20} height={20} loading="eager" />
                <span className="flex h-5 w-5 items-center justify-center rounded border border-[#e5e7eb] text-[9px] font-semibold text-[#9c9894]">+</span>
              </div>
              <div className="flex flex-1 items-center gap-1.5 px-3 py-3">
                <span className="text-[12px] text-[#9c9894]">Paste your API key → connected in seconds</span>
              </div>
            </div>

            <p className="text-[13px] text-[#5c5856]">
              <span className="font-bold text-[#1a1a1a]">Free to start</span>
              {" · replaces "}
              <a href="#pricing" className="text-blue-600 hover:underline">Baremetrics, ChartMogul &amp; MultiMMR</a>
              {" · "}
              <Link href="/api/auth/demo" className="text-[#9c9894] hover:text-[#5c5856] hover:underline">or explore the demo →</Link>
            </p>
          </div>

          {/* ── Right col ── */}
          <div className="flex items-center justify-center">
            <HeroFlowDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Compact flow diagram that fits its grid column */
function HeroFlowDiagram() {
  return (
    <div className="w-full max-w-[420px] select-none">

      {/* ── 1. Three product inputs (fragmented revenue in) ── */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { img: "/event-organizer-icon.svg", provider: "Stripe", label: "Event Organizer", sub: "$129.8k" },
          { img: "/betterflow-icon.png", provider: "Stripe", label: "BetterFlow", sub: "$8.4k" },
          { img: "/obsidian-sync-icon.jpg", provider: "Lemon Squeezy", label: "Obsidian Sync Free", sub: "$2.3k" },
        ] as const).map((p) => (
          <CornerBox key={p.label} variant="gray" className="rounded-none">
            <div className="flex flex-col items-center gap-1 px-2 py-3">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#9c9894]">{p.provider}</span>
              <img src={p.img} alt={p.label} className="h-6 w-6 rounded object-contain" width={24} height={24} loading="eager" />
              <span className="text-[11px] font-semibold text-[#1a1a1a]">{p.label}</span>
              <span className="text-[11px] font-bold tabular-nums text-[#5c5856]">{p.sub}</span>
            </div>
          </CornerBox>
        ))}
      </div>

      {/* connector: three drops → horizontal bar → single stem (funnel in) */}
      <div className="relative h-9">
        <div className="absolute top-0 h-[18px] w-px bg-[#f97316]" style={{ left: "calc(16.5% - 0.5px)" }} />
        <div className="absolute left-1/2 top-0 h-[18px] w-px -translate-x-px bg-[#f97316]" />
        <div className="absolute top-0 h-[18px] w-px bg-[#f97316]" style={{ right: "calc(16.5% - 0.5px)" }} />
        <div className="absolute left-[16.5%] right-[16.5%] top-[18px] h-px bg-[#f97316]" />
        <div className="absolute bottom-0 left-1/2 top-[18px] w-px -translate-x-px bg-[#f97316]" />
      </div>

      {/* ── 2. Clearing house: messy raw in → refined brief out ── */}
      <div className="flex items-stretch justify-center gap-2">
        {/* raw pile — dashed, gray, unfinished */}
        <div className="flex-1 rounded-md border border-dashed border-[#d8d4cc] bg-[#fafaf8] px-3 py-2.5">
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-[#9c9894]">Raw</div>
          <div className="space-y-1 font-mono text-[10px] leading-4 text-[#9c9894]">
            <div className="truncate">$468/yr · $49/mo · $1,188…</div>
            <div className="truncate">evt_8H2k · webhook · csv…</div>
            <div className="truncate line-through opacity-70">2,104 rows uncounted</div>
          </div>
        </div>
        <div className="flex items-center">
          <ArrowRight className="h-4 w-4 shrink-0 text-[#f97316]" />
        </div>
        {/* refined brief — solid, shadowed, checked off */}
        <div className="flex-1 rounded-md border-2 border-[#1a1a1a] bg-white px-3 py-2.5 shadow-[2px_2px_0_#1a1a1a]">
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-[#5c5856]">Brief</div>
          <div className="space-y-1 text-[11px] font-medium leading-4 text-[#1a1a1a]">
            <div className="flex items-center gap-1.5">
              <CheckIcon className="h-3 w-3 shrink-0 text-emerald-500" /> $140.5k total
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon className="h-3 w-3 shrink-0 text-emerald-500" /> +2.1% this month
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon className="h-3 w-3 shrink-0 text-emerald-500" /> BetterFlow leads
            </div>
          </div>
        </div>
      </div>

      {/* connector: single vertical */}
      <div className="flex justify-center">
        <div className="h-8 w-px bg-[#f97316]" />
      </div>

      {/* ── 3. One portfolio out — the payoff ── */}
      <CornerBox variant="orange" className="rounded-none">
        <div className="flex items-center justify-between border-b border-[#f0ede6] bg-[#fafaf8] px-4 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c5856]">
            Your portfolio
          </span>
          <StatusBadge label="LIVE" color="green" />
        </div>
        <div className="flex items-end justify-between px-5 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#9c9894]">Total MRR</div>
            <div className="text-[28px] font-bold tabular-nums leading-tight text-[#1a1a1a]">$140.5k</div>
          </div>
          <div className="flex items-center gap-1 pb-1">
            <img src="/event-organizer-icon.svg" alt="Event Organizer" className="h-5 w-5 rounded object-contain" width={20} height={20} loading="eager" />
            <img src="/betterflow-icon.png" alt="BetterFlow" className="h-5 w-5 rounded object-contain" width={20} height={20} loading="eager" />
            <img src="/obsidian-sync-icon.jpg" alt="Obsidian Sync Free" className="h-5 w-5 rounded object-contain" width={20} height={20} loading="eager" />
          </div>
        </div>
        <div className="border-t border-[#f0ede6] px-5 py-3 font-mono text-[12px] leading-5 text-[#9c9894]">
          <span className="text-[#5c5856]">GET</span>
          {" "}
          <span className="text-[#1a6fba]">/api/portfolio</span>
          {" · "}
          <span className="text-[#7c3aed]">Bearer</span>
          {" "}
          <span className="text-[#b45309]">&lt;token&gt;</span>
        </div>
      </CornerBox>
    </div>
  );
}


/* ========================================================= stats strip */
function StatsStrip() {
  return (
    <div className="border-y border-[#e7e3db] bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#e7e3db] md:grid-cols-4">
        {[
          { value: "5", label: "Payment providers", accent: "#5e6ad2" },
          { value: "30s", label: "Auto-sync interval", accent: "#10b981" },
          { value: "∞", label: "Products on Pro", accent: "#f97316" },
          { value: "$9", label: "Per month, Pro plan", accent: "#5e6ad2" },
        ].map((s) => (
          <div key={s.label} className="group px-8 py-10 text-center transition-colors hover:bg-[#fafaf8]">
            <div className="mb-1 text-[52px] font-black leading-none tracking-tight text-[#1a1a1a]" style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">{s.label}</div>
            <div className="mx-auto mt-3 h-0.5 w-8 rounded-full transition-all group-hover:w-12" style={{ background: s.accent }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================================================== portfolio showcase */
function PortfolioShowcase() {
  const products = [
    { name: "Scarlet DB",   provider: "Stripe",        icon: "https://cdn.simpleicons.org/stripe/635bff",       mrr: "$8,430", subs: 680, pct: 60, change: "+12.4%", up: true,  color: "#5e6ad2" },
    { name: "NotePad Pro",  provider: "Lemon Squeezy", icon: "https://cdn.simpleicons.org/lemonsqueezy/e5a00d", mrr: "$3,200", subs: 210, pct: 23, change: "+4.1%",  up: true,  color: "#f97316" },
    { name: "FormKit",      provider: "Polar",          icon: "/polar-icon.svg",                                 mrr: "$2,270", subs: 63,  pct: 17, change: "−1.8%",  up: false, color: "#10b981" },
  ];

  return (
    <section className="bg-[#f3f1ec] px-6 pb-24 pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5e6ad2]">Portfolio</p>
            <h2 className="text-[38px] font-black leading-none tracking-tight text-[#1a1a1a]">
              Every product.<br />One number.
            </h2>
          </div>
          <p className="hidden max-w-[260px] text-right text-[13px] leading-6 text-[#9c9894] md:block">
            Connect Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack — Compound unifies everything.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="overflow-hidden rounded-2xl border border-[#e0ddd6] bg-white shadow-2xl shadow-[#1a1a1a]/10">
          {/* Top bar — macOS-style chrome */}
          <div className="flex items-center justify-between border-b border-[#ece9e3] bg-[#fafaf8] px-6 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-1 text-[12px] font-semibold text-[#1a1a1a]">Portfolio Overview</span>
              <span className="h-1 w-1 rounded-full bg-[#d0cdc8]" />
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#9c9894]">
              <span className="font-medium text-[#1a1a1a]">Overview</span><span>Products</span><span>Customers</span><span>Analytics</span>
            </div>
          </div>

          {/* Total MRR hero row */}
          <div className="flex items-center justify-between border-b border-[#f0ede6] px-6 py-7">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9c9894]">Total MRR</p>
              <p className="text-[52px] font-black leading-none tracking-tight text-[#1a1a1a]">$13,900</p>
              <p className="mt-2.5 flex items-center gap-2 text-[13px]">
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-200">↑ +8.7% this month</span>
                <span className="text-[#9c9894]">953 active subscribers</span>
              </p>
            </div>
            <div className="hidden gap-8 md:flex">
              {[{ l: "ARR", v: "$166,800" }, { l: "Net New MRR", v: "+$1,120" }, { l: "Churn MRR", v: "$240" }].map(s => (
                <div key={s.l} className="text-right">
                  <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em] text-[#9c9894]">{s.l}</p>
                  <p className="text-[22px] font-bold text-[#1a1a1a]">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product rows */}
          <div className="divide-y divide-[#f0ede6]">
            {products.map((p) => (
              <div key={p.name} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#fafaf8]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0ede6] bg-white p-2 shadow-sm">
                  <img src={p.icon} alt={p.provider} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{p.name}</span>
                    <span className="rounded-full border border-[#e7e3db] bg-[#f3f1ec] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#9c9894]">{p.provider}</span>
                    <span className="text-[10px] text-[#9c9894]">{p.subs} subs</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0ede6]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-bold tabular-nums text-[#1a1a1a]">{p.mrr}</p>
                  <p className="mt-0.5 text-[11px] font-semibold tabular-nums" style={{ color: p.up ? "#059669" : "#dc2626" }}>{p.change}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-[#f0ede6] bg-[#fafaf8] px-6 py-3">
            <span className="text-[11px] text-[#9c9894]">Last synced 18 seconds ago</span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#9c9894]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Auto-sync every 30s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================= AI briefing showcase */
function AIBriefingShowcase() {
  return (
    <section className="overflow-hidden bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">AI briefings</p>
            <h2 className="mb-5 text-[38px] font-black leading-[1.05] tracking-tight text-[#1a1a1a]">
              One click.<br />Claude reads<br />everything.
            </h2>
            <p className="mb-8 text-[15px] leading-[1.75] text-[#5c5856]">
              Hit the briefing button — Compound feeds your full portfolio into Claude. You get plain English: what moved, why, and the one thing to act on.
            </p>
            <div className="space-y-3">
              {[
                { text: "MRR, ARR, churn — all in context", color: "#5e6ad2" },
                { text: "Which product is carrying the portfolio", color: "#10b981" },
                { text: "One clear action, not a chart dump", color: "#f97316" },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3 text-[13px] text-[#5c5856]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: f.color }}>✓</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>

          {/* Briefing card mockup */}
          <div className="rounded-2xl border border-[#e0ddd6] bg-white shadow-2xl shadow-[#1a1a1a]/8">
            <div className="flex items-center justify-between border-b border-[#ece9e3] bg-[#fafaf8] px-5 py-3.5 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1a1a2e] shadow-sm">
                  <SparklesIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">AI Briefing</span>
                  <span className="ml-1.5 text-[11px] text-[#9c9894]">· Today 9:04 AM</span>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Done
              </span>
            </div>
            <div className="p-5">
              <p className="mb-4 text-[13px] font-semibold text-[#1a1a1a]">Good morning, Alex. Here&apos;s what moved overnight.</p>
              <div className="space-y-3 text-[13px] leading-[1.75] text-[#4a4845]">
                <p>Your portfolio hit <span className="rounded-md border border-[#1a1a2e]/20 bg-[#1a1a2e] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">$13,900 MRR</span> — up <span className="font-semibold text-emerald-600">+$560 (+4.2%)</span> from yesterday. Scarlet DB added 14 new subscribers at an average of $12.40/mo.</p>
                <p><span className="font-medium text-[#1a1a1a]">FormKit</span> is the one to watch — it&apos;s down 3 subs this week. Not alarming yet, but at this rate it&apos;ll be net-negative by end of month.</p>
              </div>
              <div className="mt-4 rounded-xl border border-[#5e6ad2]/25 bg-[#eff0fb] px-4 py-3.5">
                <p className="text-[12px] leading-5 text-[#3d4494]"><span className="font-bold text-[#5e6ad2]">→ Action: </span>Check FormKit&apos;s last 10 churned users — a single exit-survey email could tell you exactly what to fix.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { l: "Fastest grower", v: "Scarlet DB", s: "+14 subs", accent: "#059669" },
                  { l: "Needs attention", v: "FormKit", s: "−3 subs", accent: "#dc2626" },
                  { l: "New MRR", v: "+$560", s: "across 3 products", accent: "#5e6ad2" },
                  { l: "Churn risk", v: "1 flagged", s: "FormKit trend", accent: "#d97706" },
                ].map(c => (
                  <div key={c.l} className="rounded-xl border border-[#ece9e3] bg-[#fafaf8] px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9c9894]">{c.l}</p>
                    <p className="mt-0.5 text-[13px] font-semibold" style={{ color: c.accent }}>{c.v}</p>
                    <p className="text-[10px] text-[#9c9894]">{c.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================================================== feature grid */
function FeatureGrid() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-lg">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5e6ad2]">Everything included</p>
          <h2 className="text-[38px] font-black leading-[1.05] tracking-tight text-[#1a1a1a]">
            The full picture,<br />not just MRR.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Customer profiles */}
          <div className="group overflow-hidden rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#5e6ad2]/10 text-[13px]">👤</span>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Customer profiles</p>
            </div>
            <p className="mb-5 text-[12px] leading-5 text-[#9c9894]">See every subscriber — plan, MRR, status, and risk.</p>
            <div className="space-y-2">
              {[
                { name: "sarah@acme.com",  plan: "Pro Annual",   mrr: "$39", dot: "bg-emerald-400" },
                { name: "john@startup.io", plan: "Starter",      mrr: "$9",  dot: "bg-amber-400" },
                { name: "team@corp.com",   plan: "Team Monthly", mrr: "$99", dot: "bg-emerald-400" },
              ].map(r => (
                <div key={r.name} className="flex items-center gap-3 rounded-lg border border-[#f0ede6] bg-[#fafaf8] px-3 py-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.dot}`} />
                  <span className="flex-1 truncate text-[11px] text-[#5c5856]">{r.name}</span>
                  <span className="text-[10px] text-[#9c9894]">{r.plan}</span>
                  <span className="text-[11px] font-bold text-[#1a1a1a]">{r.mrr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time alerts */}
          <div className="group overflow-hidden rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f97316]/10 text-[13px]">🔔</span>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Real-time alerts</p>
            </div>
            <p className="mb-5 text-[12px] leading-5 text-[#9c9894]">Email the moment a sub is created, churns, or upgrades.</p>
            <div className="space-y-2">
              {[
                { icon: "↑", label: "New subscription", sub: "sarah@acme.com · Pro Annual", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", t: "just now" },
                { icon: "↗", label: "Upgrade",          sub: "john@corp.com → Team plan",   color: "#5e6ad2", bg: "#f0f0ff", border: "#c7d2fe", t: "4m ago" },
                { icon: "↓", label: "Churn",            sub: "mike@free.io · Starter",      color: "#dc2626", bg: "#fef2f2", border: "#fecaca", t: "1h ago" },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3 rounded-lg border px-3 py-2" style={{ background: r.bg, borderColor: r.border }}>
                  <span className="text-[13px] font-bold" style={{ color: r.color }}>{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-[#1a1a1a]">{r.label}</p>
                    <p className="truncate text-[10px] text-[#9c9894]">{r.sub}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[#9c9894]">{r.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Public page */}
          <div className="group overflow-hidden rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#10b981]/10 text-[13px]">🌐</span>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Public revenue page</p>
            </div>
            <p className="mb-5 text-[12px] leading-5 text-[#9c9894]">Share a live stats page — show what you want, hide the rest.</p>
            <div className="overflow-hidden rounded-xl border border-[#e7e3db] shadow-sm">
              <div className="h-7 w-full" style={{ background: "linear-gradient(135deg, #5e6ad2 0%, #7c86e8 100%)" }} />
              <div className="bg-white px-3.5 pb-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="-mt-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#5e6ad2] text-[10px] font-bold text-white shadow-sm">A</div>
                  <div className="-mt-1">
                    <p className="text-[11px] font-bold text-[#1a1a1a]">Alex</p>
                    <p className="text-[10px] text-[#9c9894]">@heisalexie</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-[22px] font-black text-[#1a1a1a]">$13,900</span>
                  <span className="text-[11px] font-medium text-[#9c9894]">MRR</span>
                  <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 border border-emerald-200">↑ live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals & streaks */}
          <div className="group overflow-hidden rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#fbbf24]/10 text-[13px]">🎯</span>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Goals & streaks</p>
            </div>
            <p className="mb-5 text-[12px] leading-5 text-[#9c9894]">Set MRR milestones. Compound tracks the pace.</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-[#f0ede6] bg-[#fafaf8] p-3">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[#5c5856]">Goal: $20k MRR by Dec</span>
                  <span className="font-bold text-[#5e6ad2]">70%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e7e3db]">
                  <div className="h-full rounded-full bg-[#5e6ad2]" style={{ width: "70%" }} />
                </div>
                <p className="mt-1.5 text-[10px] text-[#9c9894]">$13,900 of $20,000</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2.5">
                <span className="text-[20px]">🔥</span>
                <div>
                  <p className="text-[12px] font-bold text-[#92400e]">14-day streak</p>
                  <p className="text-[10px] text-[#b45309]">Logged in every day this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="group overflow-hidden rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#5e6ad2]/10 text-[13px]">📊</span>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Product analytics</p>
            </div>
            <p className="mb-5 text-[12px] leading-5 text-[#9c9894]">Embed a snippet. See pageviews, events, and funnels.</p>
            <div className="space-y-2">
              {[
                { page: "/pricing",  views: "1,240", bar: 100, color: "#5e6ad2" },
                { page: "/features", views: "844",   bar: 68,  color: "#818cf8" },
                { page: "/docs",     views: "512",   bar: 41,  color: "#a5b4fc" },
                { page: "/blog",     views: "231",   bar: 19,  color: "#c7d2fe" },
              ].map(r => (
                <div key={r.page} className="flex items-center gap-2.5">
                  <span className="w-20 truncate text-[10px] font-medium text-[#5c5856]">{r.page}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0ede6]">
                    <div className="h-full rounded-full" style={{ width: `${r.bar}%`, background: r.color }} />
                  </div>
                  <span className="w-10 text-right text-[10px] font-semibold text-[#1a1a1a]">{r.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly digest */}
          <div className="group overflow-hidden rounded-2xl border border-[#e7e3db] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#10b981]/10 text-[13px]">✉️</span>
              <p className="text-[14px] font-bold text-[#1a1a1a]">Weekly digest email</p>
            </div>
            <p className="mb-5 text-[12px] leading-5 text-[#9c9894]">AI-written summary hits your inbox every Monday.</p>
            <div className="overflow-hidden rounded-xl border border-[#e7e3db] bg-[#fafaf8]">
              <div className="border-b border-[#f0ede6] bg-white px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9c9894]">Mon, Sep 15 · Weekly Digest</p>
                  <span className="rounded-full bg-[#eff0fb] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#5e6ad2]">AI</span>
                </div>
              </div>
              <div className="p-3">
                <p className="mb-1.5 text-[11px] font-semibold text-[#1a1a1a]">Your week: +$1,120 net new MRR</p>
                <p className="text-[10px] leading-4 text-[#5c5856]">Scarlet DB led growth with 44 new subs. FormKit needs attention — churn outpaced new signups for the second week running.</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] text-[#9c9894]">Delivered every Monday · AI-written</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====================================================== agent section */
function AgentSection() {
  return (
    <section className="bg-[#f3f1ec] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Code mockup — light mode */}
          <div className="overflow-hidden rounded-2xl border border-[#e0ddd6] bg-white shadow-xl shadow-[#1a1a1a]/8">
            {/* macOS chrome */}
            <div className="flex items-center gap-2 border-b border-[#ece9e3] bg-[#fafaf8] px-5 py-3.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-2 text-[11px] font-medium text-[#9c9894]">Agent memory · Revenue access</span>
            </div>
            {/* Code body */}
            <div className="p-5 font-mono text-[12px] leading-7">
              <p className="text-[#9c9894]"># Compound revenue access</p>
              <div className="mt-3 rounded-xl border border-[#e7e3db] bg-[#fafaf8] p-4">
                <p>
                  <span className="font-bold text-[#5e6ad2]">GET</span>{" "}
                  <span className="text-[#059669]">https://usecompound.xyz/api/portfolio</span>
                </p>
                <p className="mt-1">
                  <span className="text-[#5c5856]">Authorization:</span>{" "}
                  <span className="text-[#9c9894]">Bearer</span>{" "}
                  <span className="rounded bg-[#fef3c7] px-1 font-semibold text-[#d97706]">cpd_live_••••••••</span>
                </p>
              </div>
              <div className="mt-3 rounded-xl border border-[#e7e3db] bg-[#fafaf8] p-4">
                <p className="text-[#9c9894]">// Response</p>
                <p className="mt-1 text-[#5c5856]">{"{"}</p>
                <p className="pl-4">
                  <span className="text-[#059669]">"totalMrrCents"</span>
                  <span className="text-[#9c9894]">: </span>
                  <span className="text-[#d97706]">1390000</span>
                  <span className="text-[#9c9894]">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#059669]">"totalActiveSubscriptions"</span>
                  <span className="text-[#9c9894]">: </span>
                  <span className="text-[#d97706]">953</span>
                  <span className="text-[#9c9894]">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#059669]">"netNewMrrCents"</span>
                  <span className="text-[#9c9894]">: </span>
                  <span className="text-[#d97706]">56000</span>
                </p>
                <p className="text-[#5c5856]">{"}"}</p>
              </div>
            </div>
            {/* Footer with agent logos */}
            <div className="flex items-center gap-4 border-t border-[#ece9e3] bg-[#fafaf8] px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9c9894]">Works with</span>
              {[
                { src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=32", label: "Claude" },
                { src: "https://www.google.com/s2/favicons?domain=cursor.com&sz=32", label: "Cursor" },
                { src: "https://www.google.com/s2/favicons?domain=windsurf.com&sz=32", label: "Windsurf" },
                { src: "https://www.google.com/s2/favicons?domain=opencode.ai&sz=32", label: "Opencode" },
              ].map(a => (
                <div key={a.label} className="flex items-center gap-1.5">
                  <img src={a.src} alt={a.label} width={14} height={14} className="h-3.5 w-3.5 rounded-sm" />
                  <span className="text-[10px] font-medium text-[#5c5856]">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Agent API</p>
            <h2 className="mb-5 text-[38px] font-black leading-[1.05] tracking-tight text-[#1a1a1a]">
              Give your AI live<br />revenue access.
            </h2>
            <p className="mb-8 text-[15px] leading-[1.75] text-[#5c5856]">
              Create a read-only token. Point Claude, Cursor, Windsurf, or Opencode at <code className="rounded border border-[#e7e3db] bg-[#f3f1ec] px-1.5 py-0.5 font-mono text-[13px] text-[#1a1a2e]">/api/portfolio</code>. Your agent can now answer revenue questions, spot churn, and brief you — automatically.
            </p>
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1a1a2e] bg-[#1a1a2e] px-5 py-3 text-[14px] font-semibold text-white shadow-[3px_3px_0_#c8c4bc] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_#c8c4bc]"
            >
              Onboard your agent <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-[#e7e3db] bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Pricing</p>
        <h2 className="mb-4 text-[36px] font-[680] tracking-[-0.025em] text-[#1a1a1a]">
          Simple, honest pricing.
        </h2>
        <p className="mb-14 max-w-lg text-[16px] leading-[1.7] text-[#5c5856]">
          Try it free. Upgrade to Pro when you&apos;re ready for the full picture.
        </p>

        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          {/* Free Trial */}
          <CornerBox variant="gray" className="rounded-sm">
            <div className="p-7">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9c9894]">Free trial</p>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-[#1a1a1a]">Free</span>
              </div>
              <p className="mb-6 text-[13px] text-[#9c9894]">No credit card required</p>
              <ul className="mb-8 space-y-3">
                {[
                  "1 product",
                  "30-day history",
                  "Basic analytics",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-[#5c5856]">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/app"
                className="block rounded border border-[#1a1a2e] py-2.5 text-center text-[13px] font-semibold text-[#1a1a2e] transition-colors hover:bg-[#1a1a2e] hover:text-white">
                Get started free
              </Link>
            </div>
          </CornerBox>

          {/* Pro */}
          <CornerBox variant="orange" className="rounded-sm">
            <div className="p-7">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#f97316]">Pro</p>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-[#1a1a1a]">$9</span>
                <span className="text-[14px] text-[#9c9894]">/month</span>
              </div>
              <p className="mb-6 text-[13px] text-[#9c9894]">Via DodoPayments</p>
              <ul className="mb-8 space-y-3">
                {[
                  "Unlimited products",
                  "Full history & trend charts",
                  "AI briefings & weekly digest",
                  "Goals, streaks & milestones",
                  "Auto-sync every 30s",
                  "Customer profiles & cohorts",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-[#5c5856]">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/app"
                className="block rounded bg-[#1a1a2e] py-2.5 text-center text-[13px] font-semibold text-white transition-opacity hover:opacity-85">
                Upgrade to Pro
              </Link>
            </div>
          </CornerBox>
        </div>

        {/* Always free */}
        <CornerBox variant="gray" className="rounded-sm">
          <div className="border-b border-[#ece9e3] bg-[#fafaf8] px-6 py-4">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">Included at every level — always free</span>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            {[
              {
                label: "Public revenue page",
                desc: "Share your portfolio publicly at /u/[slug] with a shareable profile card.",
              },
              {
                label: "Agent API tokens",
                desc: "Create tokens so Claude, Cursor, ChatGPT, Windsurf, or Opencode can query your data live.",
              },
              {
                label: "Open source",
                desc: "Full source on GitHub, MIT licensed. Self-host on your own infra with your own Claude key.",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#e7e3db] bg-white">
                  <SparklesIcon className="h-3.5 w-3.5 text-[#f97316]" />
                </div>
                <div>
                  <div className="mb-0.5 text-[13px] font-semibold text-[#1a1a1a]">{item.label}</div>
                  <p className="text-[12px] leading-5 text-[#5c5856]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CornerBox>
      </div>
    </section>
  );
}

/* ==================================================== FAQ */
function FAQSection() {
  const faqs = [
    {
      q: "What is Compound?",
      a: "Compound is a revenue OS for indie hackers and portfolio founders. Connect all your payment provider accounts — Stripe, Lemon Squeezy, Polar, DodoPayments, Paystack — and see your total MRR in one place. It also gives you per-product customer lists, AI briefings that explain why numbers moved, real-time alerts, and an Agent API so your AI tools can query your live portfolio.",
    },
    {
      q: "What's in the free trial vs Pro?",
      a: "The free trial lets you connect 1 product with 30-day history and basic analytics — enough to see if Compound fits your workflow, no credit card needed. Pro ($9/mo via DodoPayments) unlocks unlimited products, full history and trend charts, AI briefings and weekly digest, goals/streaks/milestones, auto-sync every 30 seconds, and customer profiles with cohorts.",
    },
    {
      q: "How do the AI briefings work?",
      a: "Click the briefing button in the header and Compound feeds your entire portfolio snapshot into Claude — every product's MRR, growth rate, subscriber count, and recent trend. Claude returns a CFO-style briefing in plain English: what moved, which product drove it, what's at risk, and one specific action. You also get a weekly digest version delivered to your inbox.",
    },
    {
      q: "What payment providers are supported?",
      a: "Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack. You connect each with a read-only API key — no OAuth flow, no approval process. Compound validates the key immediately and shows you your active subscription count before you save.",
    },
    {
      q: "Can I share my revenue publicly?",
      a: "Yes. Compound gives every account a public page at /u/[your-slug] with a shareable profile card showing your portfolio. It's completely optional — you control whether it's visible. The public page is free at every plan level, including the free trial.",
    },
    {
      q: "How do I connect Claude or Cursor to my data?",
      a: "Compound has an Agent API. Go to Settings → API tokens, create a token, and configure your AI tool to use it. Claude, Cursor, ChatGPT, Windsurf, and Opencode can all query your live portfolio data through the token — MRR, product breakdown, customer info, whatever you ask for.",
    },
  ];

  return (
    <section className="border-t border-[#e7e3db] px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">FAQ</p>
        <h2 className="mb-14 text-[32px] font-[680] tracking-[-0.022em] text-[#1a1a1a]">Common questions</h2>
        <div className="divide-y divide-[#e7e3db]">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-[15px] font-semibold text-[#1a1a1a]">{f.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#9c9894] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[14px] leading-6 text-[#5c5856]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================================================== footer */
function SiteFooter() {
  return (
    <footer className="border-t border-[#e7e3db] bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Newsletter strip */}
        <div className="mb-14 flex flex-col items-start gap-4 rounded-lg border border-[#e7e3db] bg-[#f3f1ec] p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-[14px] font-semibold text-[#1a1a1a]">Stay updated</p>
            <p className="text-[13px] text-[#9c9894]">New integrations, product updates, and indie hacker stories. No spam.</p>
          </div>
          <div className="flex w-full max-w-xs items-center gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded border border-[#e7e3db] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] placeholder:text-[#9c9894] focus:outline-none focus:ring-1 focus:ring-[#1a1a2e]"
            />
            <button className="rounded bg-[#1a1a2e] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85">
              Subscribe
            </button>
          </div>
        </div>

        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CompoundWordmark height={22} />
            </div>
            <p className="text-[12px] leading-relaxed text-[#9c9894]">
              Revenue OS for indie hackers.<br />Free forever, open source, MIT.
            </p>
          </div>

          <FooterCol title="Product" links={[
            { label: "Features", href: "#abstraction" },
            { label: "How it works", href: "#how" },
            { label: "Pricing", href: "#pricing" },
          ]} />
          <FooterCol title="Integrations" links={[
            { label: "Stripe", href: "#" },
            { label: "Lemon Squeezy", href: "#" },
            { label: "Polar", href: "#" },
            { label: "DodoPayments", href: "#" },
            { label: "Paystack", href: "#" },
          ]} />
          <FooterCol title="Project" links={[
            { label: "Source on GitHub", href: GITHUB },
            { label: "The Build Games", href: "https://canivibecodeit.com/thebuildgames" },
            { label: "Open demo", href: "/api/auth/demo" },
          ]} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e3db] pt-8 text-[12px] text-[#9c9894]">
          <span>© 2026 Compound. MIT licensed.</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
          <span>Built for The Build Games · Sep 2026</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-[13px] text-[#5c5856] transition-colors hover:text-[#1a1a1a]">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
