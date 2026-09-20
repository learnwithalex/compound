import { Lora, IBM_Plex_Sans, IBM_Plex_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { AgentPillLink } from "./agent-pill";
import { CompoundWordmark, CompoundMark } from "./compound-logo";

const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const interBlack = Inter({ subsets: ["latin"], weight: ["700"], variable: "--font-inter-black" });

const GITHUB = "https://github.com/learnwithalex/compound";

export const metadata = {
  title: "Compound — Revenue OS for indie hackers",
  description:
    "Connect every Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack account. One dashboard for your whole portfolio, with AI that explains why the numbers moved.",
  alternates: { canonical: "https://usecompound.xyz" },
  openGraph: {
    title: "Compound — Revenue OS for indie hackers",
    description: "Connect every Stripe, Lemon Squeezy, Polar, DodoPayments, or Paystack account. One dashboard for your whole portfolio, with AI that explains why the numbers moved.",
    url: "https://usecompound.xyz",
    type: "website" as const,
  },
};

export default function Home() {
  return (
    <div className={`${plex.className} min-h-screen bg-[#f5f7f7] text-[#222528] antialiased`}>
      <SiteNav />
      <Hero />
      <StatsStrip />
      <PortfolioShowcase />
      <AIBriefingShowcase />
      <FeatureGrid />
      <AgentSection />
      <PricingSection />
      <FAQSection />
      <DarkCTA />
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

/* Brimble-style CTA arrow SVG — 1.5px stroke, not emoji */
function ArrowSVG({ stroke = "#FAFAFA" }: { stroke?: string }) {
  return (
    <svg viewBox="0 0 12.99 7.98" className="size-3 shrink-0" fill="none" aria-hidden>
      <path d="M0 3.99H12" stroke={stroke} strokeWidth="1.5" />
      <path d="M9 0.49L12 3.99L9 7.49" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

/* ================================================================ shared button */

function CTAButton({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light";
}) {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 h-9 rounded-md px-4 font-medium text-sm whitespace-nowrap shadow-[0px_0.646px_1.292px_#1212170d] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.98]";
  const dark =
    "bg-gradient-to-b from-[rgba(34,37,40,0.69)] via-[rgba(34,37,40,0.81)] to-[#222528] border border-[#222528] text-[#fafafa] hover:opacity-90";
  const light =
    "bg-[#fafafa] text-[#222528] hover:opacity-90";
  return (
    <Link href={href} className={`${base} ${variant === "dark" ? dark : light}`}>
      {children}
      <ArrowSVG stroke={variant === "dark" ? "#FAFAFA" : "#222528"} />
    </Link>
  );
}

/* ================================================================ nav */

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(152,157,164,0.2)] bg-[#f5f7f7]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-[1120px] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" aria-label="Compound home">
          <CompoundWordmark height={24} />
        </Link>

        <div className="ml-2 hidden items-center gap-0 md:flex">
          {[["Features", "#features"], ["How it works", "#agent"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <a key={label} href={href}
              className="relative inline-flex shrink-0 items-center whitespace-nowrap rounded px-2 py-1 text-sm font-medium text-[#222528]/50 transition-colors duration-150 hover:bg-[#fafafa] hover:text-[#222528]">
              {label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
<Link href="/login" className="text-sm text-[#222528]/50 transition-colors hover:text-[#222528]">
            Sign in
          </Link>
          <CTAButton href="/app">Get started</CTAButton>
        </div>
      </nav>
    </header>
  );
}

/* ================================================================ hero */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-0 pt-16">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid min-h-[640px] items-center gap-16 lg:grid-cols-2">

          {/* Left */}
          <div className="py-16">

            {/* Chip — light mode */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-3 py-1.5 shadow-sm">
              <CompoundMark size={14} />
              <span className={`${mono.className} text-[11px] tracking-[0.3px] text-[#222528]/70`}>Revenue OS</span>
            </div>

            {/* Heading — Inter 700, 2 clean lines, inline accent */}
            <h1 className={`${interBlack.className} mb-6 text-[#111111]`} style={{ fontWeight: 700 }}>
              <span className="block text-[46px] leading-[1.08] tracking-[-0.02em]">
                Connect and grow your
              </span>
              <span className="block text-[46px] leading-[1.08] tracking-[-0.02em]">
                revenue,{" "}<span className="text-[#5e6ad2]">effortlessly.</span>
              </span>
            </h1>

            <p className="mb-8 max-w-[400px] text-[15px] leading-[1.7] tracking-[-0.16px] text-[#222528]/55">
              Connect Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack.
              One number across your whole portfolio — with AI that explains exactly why it moved.
            </p>

            {/* Micro stats */}
            <div className="mb-8 flex items-center gap-4">
              {[
                { val: "5",   label: "providers"  },
                { val: "30s", label: "auto-sync"  },
                { val: "$9",  label: "per month"  },
              ].map((s, i) => (
                <div key={s.label} className={`flex items-baseline gap-1.5 ${i > 0 ? "border-l border-[#222528]/10 pl-4" : ""}`}>
                  <span className={`${plex.className} text-[18px] font-semibold text-[#222528]`}>{s.val}</span>
                  <span className={`${mono.className} text-[10px] uppercase tracking-[1px] text-[#222528]/40`}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mb-4 flex items-center gap-2">
              <CTAButton href="/app">Connect your revenue</CTAButton>
              <a href={GITHUB}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[rgba(152,157,164,0.35)] bg-white px-4 text-sm font-medium text-[#222528]/70 transition-all duration-150 hover:bg-[#f5f7f7] hover:text-[#222528]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden>
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Steal the code
              </a>
            </div>
            <div className="mb-8">
              <AgentPillLink />
            </div>

          </div>

          {/* Right */}
          <div className="flex items-center justify-center">
            <HeroFlowDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFlowDiagram() {
  return (
    <div className="w-full max-w-[420px] select-none">

      {/* Product inputs */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { img: "/event-organizer-icon.svg", provider: "Stripe", label: "Event Organizer", sub: "$129.8k" },
          { img: "/betterflow-icon.png", provider: "Stripe", label: "BetterFlow", sub: "$8.4k" },
          { img: "/obsidian-sync-icon.jpg", provider: "Lemon Squeezy", label: "Obsidian Sync", sub: "$2.3k" },
        ] as const).map((p) => (
          <div key={p.label}
            className="flex flex-col items-center gap-1 rounded-2xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] px-2 py-3 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
            <span className={`${mono.className} text-[9px] uppercase tracking-wider text-[#222528]/40`}>{p.provider}</span>
            <img src={p.img} alt={p.label} className="h-6 w-6 rounded object-contain" width={24} height={24} loading="eager" />
            <span className="text-[11px] font-medium text-[#222528]">{p.label}</span>
            <span className="text-[11px] tabular-nums text-[#222528]/60">{p.sub}</span>
          </div>
        ))}
      </div>

      {/* Funnel connectors */}
      <div className="relative h-9">
        <div className="absolute top-0 h-[18px] w-px bg-[#5e6ad2]/50" style={{ left: "calc(16.5% - 0.5px)" }} />
        <div className="absolute left-1/2 top-0 h-[18px] w-px -translate-x-px bg-[#5e6ad2]/50" />
        <div className="absolute top-0 h-[18px] w-px bg-[#5e6ad2]/50" style={{ right: "calc(16.5% - 0.5px)" }} />
        <div className="absolute left-[16.5%] right-[16.5%] top-[18px] h-px bg-[#5e6ad2]/50" />
        <div className="absolute bottom-0 left-1/2 top-[18px] w-px -translate-x-px bg-[#5e6ad2]/50" />
      </div>

      {/* Raw → Brief */}
      <div className="flex items-stretch justify-center gap-2">
        <div className="flex-1 rounded-xl border border-dashed border-[rgba(152,157,164,0.4)] bg-[#fafafa]/60 px-3 py-2.5">
          <div className={`${mono.className} mb-1.5 text-[9px] uppercase tracking-widest text-[#222528]/40`}>Raw</div>
          <div className={`${mono.className} space-y-1 text-[10px] leading-4 text-[#222528]/40`}>
            <div className="truncate">$468/yr · $49/mo · $1,188…</div>
            <div className="truncate">evt_8H2k · webhook · csv…</div>
            <div className="truncate line-through opacity-50">2,104 rows uncounted</div>
          </div>
        </div>
        <div className="flex items-center px-1">
          <ArrowRight className="h-4 w-4 shrink-0 text-[#5e6ad2]" />
        </div>
        <div className="flex-1 rounded-xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] px-3 py-2.5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
          <div className={`${mono.className} mb-1.5 text-[9px] uppercase tracking-widest text-[#222528]/50`}>Brief</div>
          <div className="space-y-1 text-[11px] font-medium leading-4 text-[#222528]">
            {["$140.5k total", "+2.1% this month", "BetterFlow leads"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckIcon className="h-3 w-3 shrink-0 text-emerald-500" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Single stem down */}
      <div className="flex justify-center">
        <div className="h-8 w-px bg-[#5e6ad2]/50" />
      </div>

      {/* Portfolio output */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
        <div className="flex items-center justify-between border-b border-[rgba(152,157,164,0.2)] px-4 py-2.5">
          <span className={`${mono.className} text-[10px] uppercase tracking-[1.2px] text-[#222528]/50`}>
            Your portfolio
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
          </span>
        </div>
        <div className="flex items-end justify-between px-5 py-4">
          <div>
            <div className={`${mono.className} text-[10px] uppercase tracking-[1.2px] text-[#222528]/40`}>Total MRR</div>
            <div className={`${lora.className} text-[28px] font-medium leading-tight text-[#222528]`}>$140.5k</div>
          </div>
          <div className="flex items-center gap-1 pb-1">
            {["/event-organizer-icon.svg", "/betterflow-icon.png", "/obsidian-sync-icon.jpg"].map((src, i) => (
              <img key={i} src={src} alt="" className="h-5 w-5 rounded object-contain" width={20} height={20} loading="eager" />
            ))}
          </div>
        </div>
        <div className={`${mono.className} border-t border-[rgba(152,157,164,0.2)] px-5 py-3 text-[11px] leading-5`}>
          <span className="text-[#222528]/60">GET</span>{" "}
          <span className="text-[#5e6ad2]">/api/portfolio</span>
          {" · "}
          <span className="text-[#222528]/40">Bearer</span>{" "}
          <span className="text-[#d97706]">&lt;token&gt;</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ integrations grid */

function StatsStrip() {
  return (
    <section className="bg-[#5e6ad2] px-6 py-16">
      <div className="mx-auto max-w-[1120px]">

        {/* Heading */}
        <p className="mb-10 text-center text-[15px] leading-[1.7] text-white/60">
          Connect every payment stack you already use.{" "}
          <span className="font-medium italic text-white">Built for portfolio builders.</span>
        </p>

        {/* Bento container */}
        <div className="overflow-hidden rounded-[20px] bg-[#f5f7f7] p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            {/* Stripe — large logo */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-8">
              <img src="https://cdn.simpleicons.org/stripe/635bff" alt="Stripe" className="h-7 w-7" width={28} height={28} />
              <span className="text-[20px] font-semibold tracking-tight text-[#635bff]">Stripe</span>
            </div>

            {/* Lemon Squeezy */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-8">
              <img src="https://cdn.simpleicons.org/lemonsqueezy/e5a00d" alt="Lemon Squeezy" className="h-7 w-7" width={28} height={28} />
              <span className="text-[16px] font-semibold tracking-tight text-[#e5a00d]">Lemon Squeezy</span>
            </div>

            {/* Quote — spans 2 cols */}
            <div className="col-span-2 flex flex-col justify-between rounded-2xl bg-white p-6">
              <p className="text-[14px] italic leading-[1.7] text-[#222528]/60">
                &ldquo;Finally replaced Baremetrics and ChartMogul with one tool that actually understands the indie hacker stack.&rdquo;
              </p>
              <p className={`${mono.className} mt-4 text-[11px] uppercase tracking-[1.2px] text-[#222528]/30`}>
                — portfolio founder
              </p>
            </div>

            {/* 30s stat */}
            <div className="flex flex-col justify-between rounded-2xl bg-white p-6">
              <span className={`${lora.className} text-[40px] font-medium leading-none tracking-[-2px] text-[#222528]`}>30s</span>
              <span className={`${mono.className} mt-3 text-[11px] uppercase tracking-[1.6px] text-[#5e6ad2]`}>Auto-sync</span>
            </div>

            {/* Polar */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-8">
              <img src="/polar-icon.svg" alt="Polar" className="h-7 w-7" width={28} height={28} />
              <span className="text-[20px] font-semibold tracking-tight text-[#222528]">Polar</span>
            </div>

            {/* DodoPayments */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-8">
              <img src="/dodopayments-icon.svg" alt="DodoPayments" className="h-7 w-7 rounded bg-[#222528] p-0.5" width={28} height={28} />
              <span className="text-[16px] font-semibold tracking-tight text-[#222528]">DodoPayments</span>
            </div>

            {/* Paystack */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-8">
              <img src="/paystack-icon.png" alt="Paystack" className="h-7 w-7 rounded" width={28} height={28} />
              <span className="text-[20px] font-semibold tracking-tight text-[#00c3f7]">Paystack</span>
            </div>

            {/* AI Briefings feature — spans 2 cols */}
            <div className="col-span-2 flex flex-col justify-between rounded-2xl bg-[#4a54b8] p-6">
              <div>
                <p className={`${mono.className} mb-2 text-[11px] uppercase tracking-[1.2px] text-white/35`}>AI Briefings</p>
                <p className="text-[15px] font-medium leading-[1.5] text-white">
                  Ask Claude what moved your MRR — across every provider, in plain English.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=64" alt="Claude" className="h-5 w-5 rounded-md" width={20} height={20} />
                <span className="text-[12px] text-white/50">Powered by Claude</span>
              </div>
            </div>

            {/* 5 providers stat */}
            <div className="flex flex-col justify-between rounded-2xl bg-white p-6">
              <span className={`${lora.className} text-[40px] font-medium leading-none tracking-[-2px] text-[#222528]`}>5</span>
              <span className={`${mono.className} mt-3 text-[11px] uppercase tracking-[1.6px] text-[#5e6ad2]`}>Providers</span>
            </div>

            {/* Agent API feature */}
            <div className="flex flex-col justify-between rounded-2xl bg-white p-6">
              <div>
                {/* Stacked agent logos */}
                <div className="mb-4 flex items-center">
                  {[
                    { src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",     alt: "Claude"   },
                    { src: "https://www.google.com/s2/favicons?domain=cursor.com&sz=64",    alt: "Cursor"   },
                    { src: "https://www.google.com/s2/favicons?domain=windsurf.com&sz=64",  alt: "Windsurf" },
                    { src: "https://www.google.com/s2/favicons?domain=openai.com&sz=64",    alt: "ChatGPT"  },
                  ].map((a, i) => (
                    <img
                      key={a.alt}
                      src={a.src}
                      alt={a.alt}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-lg border-2 border-white object-contain shadow-sm"
                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                    />
                  ))}
                </div>
                <p className={`${mono.className} mb-2 text-[11px] uppercase tracking-[1.2px] text-[#222528]/40`}>Agent API</p>
                <p className="text-[13px] leading-[1.5] text-[#222528]/70">
                  Give Claude, Cursor & Windsurf live access to your revenue.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ portfolio showcase */

function PortfolioShowcase() {
  const products = [
    { name: "Scarlet DB",   provider: "Stripe",        icon: "https://cdn.simpleicons.org/stripe/635bff",       mrr: "$8,430", subs: 680, pct: 60, change: "+12.4%", up: true  },
    { name: "NotePad Pro",  provider: "Lemon Squeezy", icon: "https://cdn.simpleicons.org/lemonsqueezy/e5a00d", mrr: "$3,200", subs: 210, pct: 23, change: "+4.1%",  up: true  },
    { name: "FormKit",      provider: "Polar",         icon: "/polar-icon.svg",                                  mrr: "$2,270", subs: 63,  pct: 17, change: "−1.8%",  up: false },
  ];

  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className={`${mono.className} mb-3 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Portfolio</p>
            <h2 className={`${lora.className} text-[40px] font-medium leading-[44px] tracking-[-0.576px] text-[#222528]`}>
              Every product.<br />One number.
            </h2>
          </div>
          <p className="hidden max-w-[260px] text-right text-[13px] leading-6 text-[#222528]/50 md:block">
            Connect Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack — Compound unifies everything.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="overflow-hidden rounded-[13.25px] border border-[rgba(152,157,164,0.3)] bg-[#fafafa] shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
          {/* macOS chrome */}
          <div className="relative bg-[#fafafa] px-5 pt-3 pb-0">
            <div className="flex items-center gap-3 pb-3">
              <div className="flex gap-[6.6px]">
                <span className="size-[10px] rounded-full bg-[#ff5f57]" />
                <span className="size-[10px] rounded-full bg-[#febc2e]" />
                <span className="size-[10px] rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[12px] font-medium text-[#222528]/60">Portfolio Overview</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-600 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
              </span>
              <div className="ml-auto flex items-center gap-4 text-[11px] text-[#222528]/40">
                <span className="font-medium text-[#222528]">Overview</span>
                <span>Products</span><span>Customers</span><span>Analytics</span>
              </div>
            </div>
            {/* Triple separator */}
            <div className="flex flex-col">
              <div className="h-[0.83px] w-full bg-[rgba(152,157,164,0.25)]" />
              <div className="h-[0.83px] w-full bg-[rgba(152,157,164,0.12)]" />
              <div className="h-[0.83px] w-full bg-[rgba(152,157,164,0.06)]" />
            </div>
          </div>

          {/* Total MRR row */}
          <div className="flex items-center justify-between border-b border-[rgba(152,157,164,0.2)] px-6 py-7">
            <div>
              <p className={`${mono.className} mb-1 text-[10px] uppercase tracking-[1.2px] text-[#222528]/40`}>Total MRR</p>
              <p className={`${lora.className} text-[52px] font-medium leading-none tracking-[-2px] text-[#222528]`}>$13,900</p>
              <p className="mt-2.5 flex items-center gap-2 text-[13px]">
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                  ↑ +8.7% this month
                </span>
                <span className="text-[#222528]/40">953 active subscribers</span>
              </p>
            </div>
            <div className="hidden gap-8 md:flex">
              {[{ l: "ARR", v: "$166,800" }, { l: "Net New MRR", v: "+$1,120" }, { l: "Churn MRR", v: "$240" }].map((s) => (
                <div key={s.l} className="text-right">
                  <p className={`${mono.className} mb-0.5 text-[10px] uppercase tracking-[1.2px] text-[#222528]/40`}>{s.l}</p>
                  <p className={`${lora.className} text-[22px] font-medium text-[#222528]`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product rows */}
          <div className="divide-y divide-[rgba(152,157,164,0.2)]">
            {products.map((p) => (
              <div key={p.name} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#fafafa]/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(152,157,164,0.2)] bg-white p-2">
                  <img src={p.icon} alt={p.provider} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#222528]">{p.name}</span>
                    <span className={`${mono.className} rounded-full border border-[rgba(152,157,164,0.3)] bg-[#f5f7f7] px-2 py-0.5 text-[9px] uppercase tracking-[1px] text-[#222528]/50`}>
                      {p.provider}
                    </span>
                    <span className="text-[10px] text-[#222528]/40">{p.subs} subs</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(152,157,164,0.2)]">
                    <div className="h-full rounded-full bg-[#5e6ad2]" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`${lora.className} text-[15px] font-medium tabular-nums text-[#222528]`}>{p.mrr}</p>
                  <p className="mt-0.5 text-[11px] font-medium tabular-nums"
                    style={{ color: p.up ? "#059669" : "#dc2626" }}>
                    {p.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[rgba(152,157,164,0.2)] bg-[#f5f7f7] px-6 py-3">
            <span className={`${mono.className} text-[10px] uppercase tracking-[1px] text-[#222528]/40`}>
              Last synced 18 seconds ago
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#222528]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Auto-sync every 30s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ AI briefing */

function AIBriefingShowcase() {
  return (
    <section className="overflow-hidden border-t border-[rgba(152,157,164,0.3)] px-6 py-6">
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-3xl bg-[#f0f1fb]">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">

          {/* Left: content */}
          <div className="flex flex-col justify-between px-10 py-12">
            <div>
              {/* Pill label */}
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-[#5e6ad2]/10 px-3 py-1">
                <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=64" alt="Claude" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} />
                <span className={`${mono.className} text-[11px] uppercase tracking-[1.2px] text-[#5e6ad2]`}>AI Briefings</span>
              </div>

              {/* Two-tone heading */}
              <h2 className={`${lora.className} mb-5 text-[44px] font-medium leading-[50px] tracking-[-0.576px] text-[#222528]`}>
                One click.<br />Claude reads{" "}
                <em className="not-italic text-[#5e6ad2]">everything.</em>
              </h2>

              <p className="mb-8 max-w-[380px] text-[15px] leading-[1.7] tracking-[-0.32px] text-[#222528]/60">
                Hit the briefing button — Compound feeds your full portfolio into Claude. Plain English back: what moved, why, and the one thing to act on.
              </p>
            </div>

            <div>
              {/* Social proof */}
              <div className="mb-6 flex items-start gap-3">
                <div className="flex shrink-0 items-center">
                  {[
                    "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",
                    "https://www.google.com/s2/favicons?domain=cursor.com&sz=64",
                    "https://www.google.com/s2/favicons?domain=windsurf.com&sz=64",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" width={22} height={22}
                      className="h-[22px] w-[22px] rounded-md border-2 border-[#f0f1fb]"
                      style={{ marginLeft: i === 0 ? 0 : -6 }} />
                  ))}
                </div>
                <p className="text-[12px] leading-[1.6] text-[#222528]/50">
                  <span className="font-medium text-[#222528]">Works with every AI tool.</span>{" "}
                  Claude, Cursor, Windsurf — give your agent live revenue context.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-4">
                <CTAButton href="/app">Get your first briefing</CTAButton>
                <a href="#agent" className="text-[13px] font-medium text-[#222528]/50 transition-colors hover:text-[#222528]">
                  See the Agent API →
                </a>
              </div>
            </div>
          </div>

          {/* Right: card visual — no padding, flush to edges */}
          <div className="relative flex items-end justify-center overflow-hidden bg-[#e4e6f8] px-8 pt-10">
            <div className="w-full max-w-[440px] overflow-hidden rounded-t-[13.25px] bg-white shadow-[0px_4px_6px_#0000000f,_0px_24px_48px_#00000018]">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-[rgba(152,157,164,0.15)] bg-[#fafafa] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=64" alt="Claude" className="h-7 w-7 rounded-lg" width={28} height={28} />
                  <div>
                    <span className="text-[12px] font-medium text-[#222528]">AI Briefing</span>
                    <span className={`${mono.className} ml-2 text-[10px] uppercase tracking-[1px] text-[#222528]/35`}>Today 9:04 AM</span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Done
                </span>
              </div>

              {/* Card body */}
              <div className="p-5">
                <p className="mb-3 text-[13px] font-medium text-[#222528]">Good morning, Alex. Here&apos;s what moved overnight.</p>
                <div className="space-y-2.5 text-[13px] leading-[1.7] tracking-[-0.16px] text-[#222528]/65">
                  <p>Your portfolio hit <span className="rounded bg-[#222528] px-1.5 py-0.5 font-mono text-[11px] font-medium text-white">$13,900 MRR</span> — up <span className="font-medium text-emerald-600">+$560 (+4.2%)</span> from yesterday. Scarlet DB added 14 new subs.</p>
                  <p><span className="font-medium text-[#222528]">FormKit</span> is down 3 subs this week — net-negative by end of month at this pace.</p>
                </div>
                <div className="mt-4 rounded-xl bg-[#eff0fb] px-4 py-3">
                  <p className="text-[12px] leading-5 text-[#3d4494]">
                    <span className="font-medium text-[#5e6ad2]">→ Action: </span>
                    Email FormKit&apos;s last 10 churned users — one question could tell you exactly what to fix.
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { l: "Fastest grower",  v: "Scarlet DB", s: "+14 subs",           accent: "#059669" },
                    { l: "Needs attention", v: "FormKit",    s: "−3 subs",            accent: "#dc2626" },
                    { l: "New MRR",         v: "+$560",      s: "across 3 products",  accent: "#5e6ad2" },
                    { l: "Churn risk",      v: "1 flagged",  s: "FormKit trend",      accent: "#d97706" },
                  ].map((c) => (
                    <div key={c.l} className="rounded-xl border border-[rgba(152,157,164,0.15)] bg-[#f5f7f7] px-3 py-2.5">
                      <p className={`${mono.className} text-[9px] uppercase tracking-wider text-[#222528]/35`}>{c.l}</p>
                      <p className="mt-0.5 text-[13px] font-medium" style={{ color: c.accent }}>{c.v}</p>
                      <p className="text-[10px] text-[#222528]/35">{c.s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ================================================================ feature grid */

function FeatureGrid() {
  return (
    <section id="features" className="border-t border-[rgba(152,157,164,0.3)] px-6 py-24">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-14 max-w-lg">
          <p className={`${mono.className} mb-3 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Everything included</p>
          <h2 className={`${lora.className} text-[40px] font-medium leading-[44px] tracking-[-0.576px] text-[#222528]`}>
            The full picture,<br />not just MRR.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Customer profiles */}
          <div className="group overflow-hidden rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a] transition-all hover:-translate-y-0.5">
            <p className={`${mono.className} mb-1 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Customers</p>
            <p className="mb-1 text-[15px] font-medium text-[#222528]">Customer profiles</p>
            <p className="mb-5 text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">See every subscriber — plan, MRR, status, and risk.</p>
            <div className="space-y-2">
              {[
                { name: "sarah@acme.com",  plan: "Pro Annual",   mrr: "$39", dot: "bg-emerald-400" },
                { name: "john@startup.io", plan: "Starter",      mrr: "$9",  dot: "bg-amber-400" },
                { name: "team@corp.com",   plan: "Team Monthly", mrr: "$99", dot: "bg-emerald-400" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-3 rounded-xl border border-[rgba(152,157,164,0.2)] bg-[#f5f7f7] px-3 py-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.dot}`} />
                  <span className="flex-1 truncate text-[11px] text-[#222528]/60">{r.name}</span>
                  <span className={`${mono.className} text-[10px] text-[#222528]/40`}>{r.plan}</span>
                  <span className="text-[11px] font-medium text-[#222528]">{r.mrr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time alerts */}
          <div className="group overflow-hidden rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a] transition-all hover:-translate-y-0.5">
            <p className={`${mono.className} mb-1 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Alerts</p>
            <p className="mb-1 text-[15px] font-medium text-[#222528]">Real-time alerts</p>
            <p className="mb-5 text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">Email the moment a sub is created, churns, or upgrades.</p>
            <div className="space-y-2">
              {[
                { icon: "↑", label: "New subscription", sub: "sarah@acme.com · Pro Annual", color: "#059669", bg: "#f0fdf4", border: "rgba(52,211,153,0.3)", t: "just now" },
                { icon: "↗", label: "Upgrade",          sub: "john@corp.com → Team plan",   color: "#5e6ad2", bg: "#eff0fb", border: "rgba(94,106,210,0.2)",  t: "4m ago" },
                { icon: "↓", label: "Churn",            sub: "mike@free.io · Starter",      color: "#dc2626", bg: "#fef2f2", border: "rgba(220,38,38,0.2)",   t: "1h ago" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3 rounded-xl border px-3 py-2"
                  style={{ background: r.bg, borderColor: r.border }}>
                  <span className="text-[13px] font-medium" style={{ color: r.color }}>{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-[#222528]">{r.label}</p>
                    <p className="truncate text-[10px] text-[#222528]/40">{r.sub}</p>
                  </div>
                  <span className={`${mono.className} shrink-0 text-[10px] text-[#222528]/40`}>{r.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Public page */}
          <div className="group overflow-hidden rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a] transition-all hover:-translate-y-0.5">
            <p className={`${mono.className} mb-1 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Public</p>
            <p className="mb-1 text-[15px] font-medium text-[#222528]">Public revenue page</p>
            <p className="mb-5 text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">Share a live stats page — show what you want, hide the rest.</p>
            <div className="overflow-hidden rounded-xl border border-[rgba(152,157,164,0.3)]">
              <div className="h-7 w-full rounded-t-xl" style={{ background: "linear-gradient(135deg, #5e6ad2 0%, #818cf8 100%)" }} />
              <div className="bg-[#f5f7f7] px-3.5 pb-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="-mt-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f5f7f7] bg-[#5e6ad2] text-[10px] font-bold text-white shadow-sm">A</div>
                  <div className="-mt-1">
                    <p className="text-[11px] font-medium text-[#222528]">Alex</p>
                    <p className={`${mono.className} text-[10px] text-[#222528]/40`}>@heisalexie</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className={`${lora.className} text-[22px] font-medium text-[#222528]`}>$13,900</span>
                  <span className="text-[11px] text-[#222528]/40">MRR</span>
                  <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">↑ live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="group overflow-hidden rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a] transition-all hover:-translate-y-0.5">
            <p className={`${mono.className} mb-1 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Goals</p>
            <p className="mb-1 text-[15px] font-medium text-[#222528]">Goals & streaks</p>
            <p className="mb-5 text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">Set MRR milestones. Compound tracks the pace.</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-[rgba(152,157,164,0.3)] bg-[#f5f7f7] p-3">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[#222528]/60">Goal: $20k MRR by Dec</span>
                  <span className="font-medium text-[#5e6ad2]">70%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(152,157,164,0.2)]">
                  <div className="h-full rounded-full bg-[#5e6ad2]" style={{ width: "70%" }} />
                </div>
                <p className="mt-1.5 text-[10px] text-[#222528]/40">$13,900 of $20,000</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[rgba(251,191,36,0.4)] bg-[#fffbeb] px-3 py-2.5">
                <span className="text-[20px]">🔥</span>
                <div>
                  <p className="text-[12px] font-medium text-[#92400e]">14-day streak</p>
                  <p className="text-[10px] text-[#b45309]">Logged in every day this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="group overflow-hidden rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a] transition-all hover:-translate-y-0.5">
            <p className={`${mono.className} mb-1 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Analytics</p>
            <p className="mb-1 text-[15px] font-medium text-[#222528]">Product analytics</p>
            <p className="mb-5 text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">Embed a snippet. See pageviews, events, and funnels.</p>
            <div className="space-y-2">
              {[
                { page: "/pricing",  views: "1,240", bar: 100 },
                { page: "/features", views: "844",   bar: 68  },
                { page: "/docs",     views: "512",   bar: 41  },
                { page: "/blog",     views: "231",   bar: 19  },
              ].map((r) => (
                <div key={r.page} className="flex items-center gap-2.5">
                  <span className={`${mono.className} w-20 truncate text-[10px] text-[#222528]/50`}>{r.page}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(152,157,164,0.2)]">
                    <div className="h-full rounded-full bg-[#5e6ad2]" style={{ width: `${r.bar}%` }} />
                  </div>
                  <span className="w-10 text-right text-[10px] font-medium text-[#222528]">{r.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly digest */}
          <div className="group overflow-hidden rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-5 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a] transition-all hover:-translate-y-0.5">
            <p className={`${mono.className} mb-1 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Digest</p>
            <p className="mb-1 text-[15px] font-medium text-[#222528]">Weekly digest email</p>
            <p className="mb-5 text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">AI-written summary hits your inbox every Monday.</p>
            <div className="overflow-hidden rounded-xl border border-[rgba(152,157,164,0.3)] bg-[#f5f7f7]">
              <div className="border-b border-[rgba(152,157,164,0.2)] bg-[#fafafa] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className={`${mono.className} text-[9px] uppercase tracking-wider text-[#222528]/40`}>Mon, Sep 15 · Weekly Digest</p>
                  <span className="rounded-full bg-[#eff0fb] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-[#5e6ad2]">AI</span>
                </div>
              </div>
              <div className="p-3">
                <p className="mb-1.5 text-[11px] font-medium text-[#222528]">Your week: +$1,120 net new MRR</p>
                <p className="text-[10px] leading-4 tracking-[-0.16px] text-[#222528]/50">Scarlet DB led growth with 44 new subs. FormKit needs attention — churn outpaced new signups for the second week running.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ agent section */

function AgentSection() {
  return (
    <section id="agent" className="border-t border-[rgba(152,157,164,0.3)] px-6 py-24">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">

          {/* Dark terminal card */}
          <div className="overflow-hidden rounded-[13.25px] bg-[#222528] shadow-[0px_1px_1px_#00000040,_0px_8.3px_21.8px_-2.5px_#0000008c,_0px_2.5px_3.3px_#00000040]">
            {/* Traffic lights */}
            <div className="relative h-[29px] bg-[#222528] px-3 pt-2">
              <div className="flex gap-[6.6px]">
                <span className="size-[10px] rounded-full bg-[#ff5f57]" />
                <span className="size-[10px] rounded-full bg-[#febc2e]" />
                <span className="size-[10px] rounded-full bg-[#28c840]" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex flex-col">
                <div className="h-[0.83px] w-full bg-[#282c2f]" />
                <div className="h-[0.83px] w-full bg-[#0c0b10]" />
                <div className="h-[0.83px] w-full bg-[#2f3338]" />
              </div>
            </div>

            {/* Code body */}
            <div className="border-t border-[#31363a] px-5 pb-5 pt-4">
              <p className={`${mono.className} text-xs leading-5 tracking-[-0.02px] text-white/40`}># Compound revenue access</p>

              <div className="mt-3 rounded-xl border border-[#31363a] bg-white/[0.04] p-4">
                <p className={`${mono.className} text-xs leading-5 text-white/60`}>
                  <span className="text-[#28c840]">GET</span>{" "}
                  <span className="text-[#5e6ad2]">https://usecompound.xyz/api/portfolio</span>
                </p>
                <p className={`${mono.className} mt-1 text-xs leading-5 text-white/40`}>
                  Authorization: Bearer{" "}
                  <span className="rounded bg-[#d97706]/20 px-1 text-[#d97706]">cpd_live_••••••••</span>
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-[#31363a] bg-white/[0.04] p-4">
                <p className={`${mono.className} text-xs leading-5 text-white/35`}>// Response</p>
                <p className={`${mono.className} mt-1 text-xs leading-5 text-white/40`}>{"{"}</p>
                <p className={`${mono.className} pl-4 text-xs leading-5`}>
                  <span className="text-[#28c840]">&quot;totalMrrCents&quot;</span>
                  <span className="text-white/35">: </span>
                  <span className="text-[#d97706]">1390000</span>
                  <span className="text-white/35">,</span>
                </p>
                <p className={`${mono.className} pl-4 text-xs leading-5`}>
                  <span className="text-[#28c840]">&quot;activeSubscriptions&quot;</span>
                  <span className="text-white/35">: </span>
                  <span className="text-[#d97706]">953</span>
                  <span className="text-white/35">,</span>
                </p>
                <p className={`${mono.className} pl-4 text-xs leading-5`}>
                  <span className="text-[#28c840]">&quot;netNewMrrCents&quot;</span>
                  <span className="text-white/35">: </span>
                  <span className="text-[#d97706]">56000</span>
                </p>
                <p className={`${mono.className} text-xs leading-5 text-white/40`}>{"}"}</p>
              </div>

              {/* Success line */}
              <div className="mt-3 flex items-center gap-1.5">
                <span className="inline-flex size-[14px] items-center justify-center rounded-full bg-[#28c840]/20">
                  <span className="text-[8px] leading-none text-[#28c840]">✓</span>
                </span>
                <p className={`${mono.className} text-xs leading-5 text-[#28c840]`}>
                  Connected → usecompound.xyz
                </p>
              </div>
              <span className="mt-1 inline-block h-[13px] w-[7px] rounded-[1px] bg-white/50" />
            </div>

            {/* Agent logos */}
            <div className="flex items-center gap-4 border-t border-[#31363a] px-5 py-3">
              <span className={`${mono.className} text-[10px] uppercase tracking-[1.2px] text-white/35`}>Works with</span>
              {[
                { src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=32", label: "Claude" },
                { src: "https://www.google.com/s2/favicons?domain=cursor.com&sz=32", label: "Cursor" },
                { src: "https://www.google.com/s2/favicons?domain=windsurf.com&sz=32", label: "Windsurf" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-1.5">
                  <img src={a.src} alt={a.label} width={14} height={14} className="h-3.5 w-3.5 rounded-sm opacity-70" />
                  <span className={`${mono.className} text-[10px] text-white/40`}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className={`${mono.className} mb-4 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Agent API</p>
            <h2 className={`${lora.className} mb-5 text-[40px] font-medium leading-[44px] tracking-[-0.576px] text-[#222528]`}>
              Give your AI live<br />revenue access.
            </h2>
            <p className="mb-8 text-base leading-[21px] tracking-[-0.32px] text-[#222528]/60">
              Create a read-only token. Point Claude, Cursor, Windsurf, or Opencode at{" "}
              <code className={`${mono.className} rounded border border-[rgba(152,157,164,0.4)] bg-[#fafafa] px-1.5 py-0.5 text-[13px] text-[#222528]`}>
                /api/portfolio
              </code>
              . Your agent can now answer revenue questions, spot churn, and brief you — automatically.
            </p>
            <CTAButton href="/onboard">Onboard your agent</CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ pricing */

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-[rgba(152,157,164,0.3)] px-6 py-28">
      <div className="mx-auto max-w-[1120px]">
        <p className={`${mono.className} mb-3 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Pricing</p>
        <h2 className={`${lora.className} mb-4 text-[40px] font-medium leading-[44px] tracking-[-0.576px] text-[#222528]`}>
          Simple, honest pricing.
        </h2>
        <p className="mb-14 max-w-lg text-base leading-[21px] tracking-[-0.32px] text-[#222528]/60">
          Try it free. Upgrade to Pro when you&apos;re ready for the full picture.
        </p>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] p-7 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
            <p className={`${mono.className} mb-2 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>Free trial</p>
            <div className="mb-1 flex items-baseline gap-1">
              <span className={`${lora.className} text-4xl font-medium tracking-tight text-[#222528]`}>Free</span>
            </div>
            <p className="mb-6 text-[13px] text-[#222528]/40">No credit card required</p>
            <ul className="mb-8 space-y-3">
              {["1 product", "30-day history", "Basic analytics"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-[#222528]/60">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/app"
              className="block rounded-md border border-[rgba(152,157,164,0.4)] py-2.5 text-center text-[13px] font-medium text-[#222528] transition-colors hover:bg-[#f5f7f7]">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-3xl border border-[#5e6ad2]/30 bg-[#fafafa] p-7 shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
            <p className={`${mono.className} mb-2 text-xs uppercase tracking-[1.2px] text-[#5e6ad2]`}>Pro</p>
            <div className="mb-1 flex items-baseline gap-1">
              <span className={`${lora.className} text-4xl font-medium tracking-tight text-[#222528]`}>$9</span>
              <span className="text-[14px] text-[#222528]/40">/month</span>
            </div>
            <p className="mb-6 text-[13px] text-[#222528]/40">Via DodoPayments</p>
            <ul className="mb-8 space-y-3">
              {[
                "Unlimited products",
                "Full history & trend charts",
                "AI briefings & weekly digest",
                "Goals, streaks & milestones",
                "Auto-sync every 30s",
                "Customer profiles & cohorts",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-[#222528]/60">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5e6ad2]" /> {f}
                </li>
              ))}
            </ul>
            <CTAButton href="/app">Upgrade to Pro</CTAButton>
          </div>
        </div>

        {/* Always free */}
        <div className="rounded-3xl border border-[rgba(152,157,164,0.3)] bg-[#fafafa] shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
          <div className="border-b border-[rgba(152,157,164,0.2)] px-6 py-4">
            <span className="text-[13px] font-medium text-[#222528]">Included at every level — always free</span>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-3">
            {[
              { label: "Public revenue page", desc: "Share your portfolio publicly at /u/[slug] with a shareable profile card." },
              { label: "Agent API tokens",    desc: "Create tokens so Claude, Cursor, ChatGPT, or Windsurf can query your data live." },
              { label: "Open source",         desc: "Full source on GitHub, MIT licensed. Self-host with your own Claude key." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[rgba(152,157,164,0.3)] bg-[#f5f7f7]">
                  <SparklesIcon className="h-3.5 w-3.5 text-[#5e6ad2]" />
                </div>
                <div>
                  <div className="mb-0.5 text-[13px] font-medium text-[#222528]">{item.label}</div>
                  <p className="text-[12px] leading-5 tracking-[-0.16px] text-[#222528]/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ FAQ */

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
    <section className="border-t border-[rgba(152,157,164,0.3)] px-6 py-28">
      <div className="mx-auto max-w-[720px]">
        <p className={`${mono.className} mb-3 text-xs uppercase tracking-[1.2px] text-[#222528]/50`}>FAQ</p>
        <h2 className={`${lora.className} mb-10 text-[40px] font-medium leading-[44px] tracking-[-0.576px] text-[#222528]`}>
          Common questions
        </h2>

        <div className="overflow-hidden rounded-[4px] border border-[rgba(152,157,164,0.3)] bg-[#fafafa] shadow-[0px_1.7px_2.6px_#0000000a,_0px_10.4px_27.7px_#0000000a]">
          {faqs.map((f, i) => (
            <details key={f.q}
              className={`group ${i < faqs.length - 1 ? "border-b border-[rgba(152,157,164,0.3)]" : ""} transition-colors duration-200 hover:bg-[#fafafa]`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm px-5 py-4 transition-all duration-200 ease-out">
                <span className="text-[15px] font-medium text-[#222528] group-hover:text-[#5e6ad2] transition-colors duration-200">{f.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#222528]/30 transition-all duration-200 group-hover:text-[#5e6ad2] group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 pt-0 text-base leading-[20px] tracking-[0.16px] text-[#222528]/50">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================ dark CTA */

function DarkCTA() {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] px-6 py-[88px]">
      <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center gap-6 text-center">
        <p className={`${mono.className} text-xs uppercase tracking-[1.2px] text-white/30`}>Get started</p>
        <h2 className={`${lora.className} text-[40px] font-medium leading-none tracking-[-0.576px] text-white`}>
          Your revenue, always on.
        </h2>
        <p className="max-w-md text-base leading-[21px] tracking-[-0.32px] text-white/50">
          Connect your first account in 60 seconds. Free to start, open source, always.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <CTAButton href="/app" variant="light">Get started free</CTAButton>
          <a href={GITHUB}
            className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-white/70 transition-colors duration-150 hover:text-white">
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ footer */

function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(152,157,164,0.2)] bg-[#0d1117] px-6 py-16">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4">
              <CompoundWordmark height={22} theme="dark" />
            </div>
            <p className="text-[12px] leading-relaxed text-white/30">
              Revenue OS for indie hackers.<br />Free forever, open source, MIT.
            </p>
          </div>

          <FooterCol title="Product" links={[
            { label: "Features", href: "#features" },
            { label: "Agent API", href: "#agent" },
            { label: "Pricing",  href: "#pricing" },
          ]} />
          <FooterCol title="Integrations" links={[
            { label: "Stripe",        href: "#" },
            { label: "Lemon Squeezy", href: "#" },
            { label: "Polar",         href: "#" },
            { label: "DodoPayments",  href: "#" },
            { label: "Paystack",      href: "#" },
          ]} />
          <FooterCol title="Project" links={[
            { label: "Source on GitHub",  href: GITHUB },
            { label: "The Build Games",   href: "https://canivibecodeit.com/thebuildgames" },
          ]} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-8 text-[12px] text-white/30">
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
      <div className={`${mono.className} mb-4 text-[10px] uppercase tracking-[1.2px] text-white/30`}>{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-[13px] text-white/40 transition-colors hover:text-white/70">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
