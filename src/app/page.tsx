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
      <AbstractionSection />
      <LifecycleSection />
      <ProblemSection />
      <HowItWorks />
      <BenefitsSection />
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

            {/* primary CTA + quiet agent link — one line */}
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/app"
                className="inline-flex h-11 items-center gap-2 rounded-lg border-2 border-[#1a1a1a] bg-[#1a1a1a] px-5 text-[14px] font-semibold text-white shadow-[3px_3px_0_#1a1a1a] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#1a1a1a]">
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
                <span className="font-mono text-[11px] text-[#9c9894]">$</span>
                <span className="font-mono text-[12px] text-[#5c5856]">compound connect --all</span>
              </div>
              <button className="shrink-0 border-l border-[#e7e3db] px-3 py-3 text-[#c8c4bc] hover:text-[#5c5856]">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="4" width="9" height="9" rx="1.5" />
                  <path d="M3 10H2.5A1.5 1.5 0 0 1 1 8.5v-6A1.5 1.5 0 0 1 2.5 1h6A1.5 1.5 0 0 1 10 2.5V3" />
                </svg>
              </button>
            </div>

            <p className="text-[13px] text-[#5c5856]">
              <span className="font-bold text-[#1a1a1a]">Free forever</span>
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
        <div className="border-t border-[#f0ede6] px-5 py-3 font-mono text-[12px] leading-5">
          <span className="text-[#7c3aed]">compound</span>
          <span className="text-[#1a1a1a]">.</span>
          <span className="text-[#1a6fba]">sync</span>
          <span className="text-[#1a1a1a]">(</span>
          <span className="text-[#b45309]">&quot;portfolio&quot;</span>
          <span className="text-[#1a1a1a]">);</span>
        </div>
      </CornerBox>
    </div>
  );
}

/* ============================================ abstraction section */
function AbstractionSection() {
  const totalMrr = 140501;
  const providers = [
    { logo: "https://cdn.simpleicons.org/stripe/635bff", name: "Stripe",        product: "Event Organizer",   subs: 2104, mrr: 129801, mrrLabel: "$129,801", pct: 92 },
    { logo: "https://cdn.simpleicons.org/lemonsqueezy/e5a00d", name: "Lemon Squeezy", product: "BetterFlow",   subs: 680,  mrr: 8430,   mrrLabel: "$8,430",   pct: 6  },
    { logo: "/polar-icon.svg",                          name: "Polar",          product: "Obsidian Sync Free", subs: 63,   mrr: 2270,   mrrLabel: "$2,270",   pct: 2  },
  ];
  const barColors = ["bg-[#5e6ad2]", "bg-[#f97316]", "bg-emerald-400"];
  const dotColors = ["bg-[#5e6ad2]", "bg-[#f97316]", "bg-emerald-400"];

  return (
    <section id="abstraction" className="scroll-mt-20 border-t border-[#e7e3db] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="mb-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Revenue intelligence</p>
          <h2 className="mb-4 max-w-2xl text-[36px] font-[680] leading-[1.1] tracking-[-0.025em] text-[#1a1a1a]">
            Five providers. One number.{" "}
            <span className={`${instrumentSerif.className} font-normal italic text-[#5c5856]`}>explained in plain English.</span>
          </h2>
          <p className="max-w-lg text-[16px] leading-[1.7] text-[#5c5856]">
            Compound syncs every account, normalizes billing intervals, and writes your daily briefing — so you open one tab, not five.
          </p>
        </div>

        {/* two-panel grid */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* LEFT — portfolio breakdown */}
          <CornerBox variant="gray" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#ece9e3] bg-[#f7f5f1] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[12px] font-semibold text-[#1a1a1a]">Portfolio · Sep 11, 2026</span>
              </div>
              <StatusBadge label="Live" color="green" />
            </div>

            <div className="divide-y divide-[#ece9e3]">
              {providers.map((r, i) => (
                <div key={r.name} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#ece9e3] bg-white">
                    <img src={r.logo} alt={r.name} className="h-5 w-5 object-contain" width={20} height={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{r.name}</span>
                      <span className="rounded bg-[#f3f1ec] px-1.5 py-0.5 text-[9px] text-[#9c9894]">{r.subs.toLocaleString()} active</span>
                    </div>
                    <div className="text-[11px] text-[#9c9894]">{r.product}</div>
                    {/* contribution bar */}
                    <div className="mt-2 h-1 w-full rounded-full bg-[#ece9e3]">
                      <div className={`h-1 rounded-full ${barColors[i]}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-semibold tabular-nums text-[#1a1a1a]">{r.mrrLabel}</div>
                    <div className="text-[10px] text-[#9c9894]">{r.pct}% of MRR</div>
                  </div>
                </div>
              ))}
            </div>

            {/* total bar */}
            <div className="border-t border-[#e7e3db] bg-[#1a1a2e] px-5 py-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[12px] font-medium text-white/60">Total Portfolio MRR</span>
                <span className="text-[26px] font-bold tabular-nums text-white">$140,501</span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full">
                {providers.map((r, i) => (
                  <div key={r.name} className={barColors[i]} style={{ flex: r.mrr }} />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {providers.map((r, i) => (
                  <span key={r.name} className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <span className={`h-1.5 w-1.5 rounded-full ${dotColors[i]}`} />
                    {r.name} {r.pct}%
                  </span>
                ))}
              </div>
            </div>
          </CornerBox>

          {/* RIGHT — AI brief */}
          <CornerBox variant="orange" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-orange-200/60 bg-orange-50/70 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-3.5 w-3.5 text-[#f97316]" />
                <span className="text-[12px] font-semibold text-[#1a1a1a]">AI Daily Briefing</span>
              </div>
              <StatusBadge label="Generated" color="teal" />
            </div>

            <div className="px-5 py-5">
              <p className="mb-0.5 text-[10px] uppercase tracking-widest text-[#9c9894]">Sep 11, 2026 · 09:00 AM</p>
              <p className="mb-5 text-[14px] font-semibold text-[#1a1a1a]">Good morning, Alex. Here's your portfolio.</p>

              <div className="space-y-3.5 text-[13px] leading-[1.75] text-[#4a4845]">
                <p>
                  Your portfolio closed yesterday at{" "}
                  <span className="inline-block rounded bg-[#1a1a2e] px-1.5 py-0.5 font-mono text-[12px] font-bold text-white">$140,501 MRR</span>
                  {" "}— up{" "}
                  <span className="font-semibold text-emerald-600">+$2,340 (+1.7%)</span> from the prior day.
                </p>
                <p>
                  <span className="font-medium text-[#1a1a1a]">Event Organizer</span> added 43 subscribers overnight at an average of <span className="font-medium">$61.73/mo</span>, pushing it past its 30-day high.
                </p>
                <p>
                  <span className="font-medium text-[#1a1a1a]">BetterFlow</span> had 4 annual-plan conversions from monthly — Compound auto-normalized <span className="font-medium">$2,388</span> of annualized revenue into MRR.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  { label: "Fastest grower",   value: "Event Organizer", sub: "+43 subs today",  dot: "bg-[#5e6ad2]" },
                  { label: "Plan conversions",  value: "4 annual",        sub: "BetterFlow",      dot: "bg-[#f97316]" },
                  { label: "New MRR today",     value: "+$2,340",         sub: "across 3 apps",   dot: "bg-emerald-500" },
                  { label: "Churn risk",         value: "0 flagged",       sub: "No expiries due", dot: "bg-[#c8c4bc]" },
                ].map((c) => (
                  <div key={c.label} className="rounded border border-[#ece9e3] bg-[#f7f5f1] px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#9c9894]">
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      {c.label}
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-[#1a1a1a]">{c.value}</div>
                    <div className="text-[10px] text-[#9c9894]">{c.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded border border-orange-200/60 bg-orange-50/60 px-3 py-2.5">
                <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-[#f97316]" />
                <p className="text-[12px] text-[#5c5856]">
                  <span className="font-semibold text-[#1a1a1a]">Insight:</span> If BetterFlow keeps its current conversion rate, it'll hit <span className="font-medium">$10k MRR</span> by month-end.
                </p>
              </div>
            </div>
          </CornerBox>

        </div>
      </div>
    </section>
  );
}

/* ============================================= lifecycle section */
function LifecycleSection() {
  const features = [
    {
      n: "01",
      label: "Portfolio overview",
      sub: "All your products unified — one total MRR number across every provider and billing interval.",
      badge: { label: "LIVE", color: "green" as const },
    },
    {
      n: "02",
      label: "Customer profiles",
      sub: "Who's paying, which plan they're on, their MRR contribution, and who's at risk of churning.",
      badge: { label: "LIVE", color: "green" as const },
    },
    {
      n: "03",
      label: "AI briefings",
      sub: "One click: Claude reads your full portfolio and writes a CFO-style briefing — what moved, why, one action.",
      badge: { label: "CLAUDE", color: "purple" as const },
    },
    {
      n: "04",
      label: "Real-time alerts",
      sub: "Email you the moment a new subscription lands, a customer churns, upgrades, or goes past due.",
      badge: { label: "EMAIL", color: "blue" as const },
    },
    {
      n: "05",
      label: "Public revenue page",
      sub: "Share your portfolio publicly with a shareable /u/[slug] profile page — optional, always your call.",
      badge: { label: "PUBLIC", color: "teal" as const },
    },
    {
      n: "06",
      label: "Agent API",
      sub: "Create tokens so Claude, Cursor, ChatGPT, Windsurf, or Opencode can query your live portfolio data.",
      badge: { label: "API", color: "blue" as const },
    },
  ];

  return (
    <section className="border-t border-[#e7e3db] bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Features</p>
        <h2 className="mb-4 text-[32px] font-[680] leading-[1.1] tracking-[-0.022em] text-[#1a1a1a]">
          Everything your portfolio needs.
        </h2>
        <p className="mb-14 max-w-md text-[15px] leading-[1.7] text-[#5c5856]">
          Not a chart dump — actual intelligence. Connect your providers and Compound handles the rest.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((s) => (
            <CornerBox key={s.n} variant="gray" className="rounded-sm">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#c8c4bc]">{s.n}</span>
                  <StatusBadge label={s.badge.label} color={s.badge.color} />
                </div>
                <div className="mb-1 text-[16px] font-semibold text-[#1a1a1a]">{s.label}</div>
                <p className="text-[13px] leading-6 text-[#5c5856]">{s.sub}</p>
              </div>
            </CornerBox>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================= problem section */
function ProblemSection() {
  return (
    <section className="border-t border-[#e7e3db] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">The problem</p>
        <h2 className="mb-4 text-[32px] font-[680] leading-[1.1] tracking-[-0.022em] text-[#1a1a1a]">
          The problem with multi-product analytics.
        </h2>
        <p className="mb-16 max-w-lg text-[16px] leading-[1.7] text-[#5c5856]">
          You want to see your numbers. Instead, you&apos;re logging into dashboards.
        </p>

        <div className="grid gap-px overflow-hidden rounded-sm border border-[#e7e3db] bg-[#e7e3db] sm:grid-cols-2">
          {[
            {
              title: "Six dashboards for six products",
              body: "Separate logins for each Stripe account, each Lemon Squeezy store, Polar, DodoPayments, Paystack. Six tabs open just to answer \"what's my MRR today?\"",
            },
            {
              title: "No portfolio total",
              body: "Every platform shows its own total. You add them up manually — in a note, a spreadsheet, or your head — every single time.",
            },
            {
              title: "Numbers without explanation",
              body: "Charts tell you MRR moved. They don't tell you which product drove it, whether it'll hold, or what to do next.",
            },
            {
              title: "$100+/mo analytics tools",
              body: "Baremetrics ($108/mo), ChartMogul ($100+/mo) — both built for one business on one processor. You have a portfolio. They don't know what that is.",
            },
          ].map((c) => (
            <div key={c.title} className="bg-[#f3f1ec] p-8">
              <div className="mb-4 h-4 w-4 rounded-full border border-red-300 bg-red-100" />
              <h3 className="mb-2 text-[15px] font-semibold text-[#1a1a1a]">{c.title}</h3>
              <p className="text-[13px] leading-6 text-[#5c5856]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================= how it works */
function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-[#e7e3db] bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">How it works</p>
        <h2 className="mb-4 text-[32px] font-[680] leading-[1.1] tracking-[-0.022em] text-[#1a1a1a]">
          Portfolio intelligence, handled for you.
        </h2>
        <p className="mb-20 max-w-lg text-[16px] leading-[1.7] text-[#5c5856]">
          Three steps from zero to a complete view of your portfolio revenue.
        </p>

        <div className="space-y-20">
          {/* Step 1: Connect */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Step 1 — Connect</p>
              <h3 className="mb-4 text-[24px] font-[680] leading-tight tracking-[-0.018em] text-[#1a1a1a]">
                One API key per account.<br />No OAuth, no approval flow.
              </h3>
              <p className="mb-6 text-[14px] leading-6 text-[#5c5856]">
                Paste a read-only API key from any supported provider account.
                Compound validates it immediately — active subscription count and
                estimated MRR shown before you save.
              </p>
              <div className="space-y-2 text-[13px] text-[#5c5856]">
                {["Key validated in under a second", "Stored encrypted, never logged", "Connect as many accounts as you have"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <CornerBox variant="gray" className="rounded-sm">
              <div className="border-b border-[#ece9e3] bg-[#fafaf8] px-5 py-3">
                <span className="text-[12px] font-semibold text-[#1a1a1a]">Add connection</span>
              </div>
              <div className="p-5">
                <div className="mb-3 space-y-2">
                  <div className="flex items-center justify-between rounded border border-[#ece9e3] bg-[#fafaf8] px-3 py-2.5 text-[13px]">
                    <span className="text-[#9c9894]">Provider</span>
                    <span className="font-medium text-[#1a1a1a]">Stripe</span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-[#ece9e3] bg-[#fafaf8] px-3 py-2.5 text-[13px]">
                    <span className="text-[#9c9894]">Label</span>
                    <span className="font-medium text-[#1a1a1a]">Event Organizer</span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-[#ece9e3] bg-[#fafaf8] px-3 py-2.5 font-mono text-[13px]">
                    <span className="text-[#9c9894]">API key</span>
                    <span className="text-[#9c9894]">rk_live_••••••••••</span>
                  </div>
                </div>
                <button className="w-full rounded bg-[#1a1a2e] py-2.5 text-[13px] font-semibold text-white">
                  Validate &amp; connect
                </button>
                <div className="mt-3 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="text-[12px] text-emerald-700">Valid — 2,104 active subscriptions · ~$129.8k MRR</span>
                </div>
              </div>
            </CornerBox>
          </div>

          {/* Step 2: Sync */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="lg:order-2">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Step 2 — Normalize</p>
              <h3 className="mb-4 text-[24px] font-[680] leading-tight tracking-[-0.018em] text-[#1a1a1a]">
                Monthly, annual, custom intervals.<br />All normalized to monthly MRR.
              </h3>
              <p className="mb-6 text-[14px] leading-6 text-[#5c5856]">
                Compound pulls every active subscription and normalizes billing intervals
                to a monthly figure. Annual plan? Divided by 12. Daily snapshot. Automatic.
              </p>
              <div className="space-y-2 text-[13px] text-[#5c5856]">
                {[
                  "Monthly billing used as-is",
                  "Annual detected via variant name → ÷ 12",
                  "Trialing subscriptions included",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:order-1">
              <CornerBox variant="gray" className="rounded-sm">
                <div className="border-b border-[#ece9e3] bg-[#fafaf8] px-5 py-3">
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">Normalization engine</span>
                </div>
                <div className="divide-y divide-[#f3f4f6]">
                  {[
                    { plan: "Pro Monthly",  interval: "month × 1", price: "$49.00",   mrr: "$49.00" },
                    { plan: "Pro Annual",   interval: "year × 1",  price: "$468.00",  mrr: "$39.00" },
                    { plan: "Team Yearly",  interval: "year × 1",  price: "$1,188.00",mrr: "$99.00" },
                    { plan: "Starter + LS", interval: "month × 1", price: "$19.00",   mrr: "$19.00" },
                  ].map((row) => (
                    <div key={row.plan} className="px-5 py-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[#1a1a1a]">{row.plan}</span>
                        <span className="text-[11px] text-[#9c9894]">{row.interval}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[#9c9894]">{row.price} billed</span>
                        <span className="font-semibold text-blue-700">{row.mrr} MRR</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#fafaf8] px-5 py-3">
                    <span className="text-[12px] text-[#5c5856]">Total MRR (this account)</span>
                    <span className="text-[14px] font-bold text-[#1a1a1a]">$206.00</span>
                  </div>
                </div>
              </CornerBox>
            </div>
          </div>

          {/* Step 3: AI */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c9894]">Step 3 — Analyze</p>
              <h3 className="mb-4 text-[24px] font-[680] leading-tight tracking-[-0.018em] text-[#1a1a1a]">
                One click. Claude writes<br />a CFO-style briefing.
              </h3>
              <p className="mb-6 text-[14px] leading-6 text-[#5c5856]">
                Compound feeds your full portfolio into Claude — every product, every
                trend, every churn signal. You get plain English: what's working,
                what's at risk, one specific action. No chart dump.
              </p>
              <div className="space-y-2 text-[13px] text-[#5c5856]">
                {[
                  "Reads your entire portfolio in context",
                  "Spots concentration risk, churn signals, momentum",
                  "One action — not a list of vague suggestions",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <CornerBox variant="gray" className="rounded-sm">
              <div className="flex items-center gap-2 border-b border-[#ece9e3] bg-[#fafaf8] px-5 py-3">
                <SparklesIcon className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-[12px] font-semibold text-[#1a1a1a]">AI portfolio analysis</span>
                <StatusBadge label="COMPLETE" color="green" />
              </div>
              <div className="p-5 text-[13px] leading-6">
                <p className="mb-3 text-[#5c5856]">
                  <span className="font-semibold text-[#1a1a1a]">Portfolio healthy but lopsided.</span>{" "}
                  Event Organizer is 92% of MRR — concentration risk, not a portfolio.
                  BetterFlow is the momentum story at +18% month-over-month.
                </p>
                <p className="mb-4 text-[#5c5856]">
                  Obsidian Sync Free is sliding at −4.1%. Small products churn faster — if
                  you're not actively improving it, it'll hit zero before you notice.
                </p>
                <div className="rounded border border-violet-200 bg-violet-50 px-4 py-3 text-[#5b21b6]">
                  <span className="font-semibold">Action this week: </span>
                  Look at BetterFlow trial-to-paid conversion — one better onboarding
                  email could double the growth rate.
                </div>
              </div>
            </CornerBox>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================= benefits */
function BenefitsSection() {
  return (
    <section className="border-t border-[#e7e3db] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            {
              title: "Start free, scale to Pro",
              body: "Explore with one product on the free trial. When you're ready for unlimited products, full history, AI briefings, and goals — Pro is $9/mo.",
            },
            {
              title: "AI that explains, not just charts",
              body: "Claude reads your whole portfolio and writes a CFO-style briefing — what moved, which product drove it, one specific action. Plus a weekly digest in your inbox.",
            },
            {
              title: "Built for portfolio founders",
              body: "Multi-product and multi-provider from day one. Connect Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack in a single dashboard — not five.",
            },
          ].map((b) => (
            <div key={b.title}>
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e7e3db] bg-white">
                <CheckIcon className="h-4 w-4 text-[#5c5856]" />
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-[#1a1a1a]">{b.title}</h3>
              <p className="text-[13px] leading-6 text-[#5c5856]">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================ pricing */
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
