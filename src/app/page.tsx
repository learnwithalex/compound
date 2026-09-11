import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

const GITHUB = "https://github.com/learnwithalex/booked";

export const metadata = {
  title: "Booked — bookkeeping that runs itself",
  description:
    "Bench shut down. Pilot starts at $499. Booked connects your bank and Stripe, categorises every transaction, reconciles payouts, and closes your month from a real double-entry ledger.",
};

export default function Home() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#08090A] text-[#F7F8F8] antialiased`}>
      <SiteNav />
      <Hero />
      <LogoBar />
      <LedgerStatement />
      <ReconcileSection />
      <CategoriseSection />
      <ReportingSection />
      <Pricing />
      <Changelog />
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

const IconArrow = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
const IconCheck = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M4.5 12.5l5 5 10-11" /></Icon>
);
const IconCode = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" /></Icon>
);
const IconSwap = ({ className }: { className?: string }) => (
  <Icon className={className}><path d="M4 8h13l-3.2-3.2M20 16H7l3.2 3.2" /></Icon>
);

/* ================================================================== nav */

function Mark({ size = "h-6 w-6" }: { size?: string }) {
  return (
    <span className={`flex ${size} items-center justify-center rounded bg-[#1f7d59] text-[11px] font-bold text-white`}>
      B
    </span>
  );
}

function SiteNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#08090A]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-[15px] font-semibold tracking-tight">Booked</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[["#how", "How it works"], ["#features", "Features"], ["#pricing", "Pricing"]].map(
            ([href, label]) => (
              <a key={href} href={href}
                className="rounded px-3 py-1.5 text-[13px] text-[#8A8F98] transition-colors hover:text-[#F7F8F8]">
                {label}
              </a>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/login" className="text-[13px] text-[#8A8F98] transition-colors hover:text-[#F7F8F8]">
            Log in
          </Link>
          <Link href="/login"
            className="flex h-8 items-center rounded-lg border border-black/25 bg-[#E5E5E6] px-3 text-[13px] font-medium text-[#08090A] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.6)] transition-colors hover:bg-white">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* =============================================================== hero */

const BRAND_MARKS = [
  {
    name: "Stripe",
    d: "M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z",
  },
  {
    name: "Chase",
    d: "M0 15.415c0 .468.38.85.848.85h5.937V.575L0 7.72v7.695m15.416 8.582c.467 0 .846-.38.846-.849v-5.937H.573l7.146 6.785h7.697M24 8.587a.844.844 0 0 0-.847-.846h-5.938V23.43l6.782-7.148L24 8.586M8.585.003a.847.847 0 0 0-.847.847v5.94h15.688L16.282.003H8.585Z",
  },
  {
    name: "Shopify",
    d: "M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z",
  },
  {
    name: "Square",
    d: "M4.01 0A4.01 4.01 0 000 4.01v15.98c0 2.21 1.8 4 4.01 4.01h15.98C22.2 24 24 22.2 24 19.99V4A4.01 4.01 0 0019.99 0H4zm1.62 4.36h12.74c.7 0 1.26.57 1.26 1.27v12.74c0 .7-.56 1.27-1.26 1.27H5.63c-.7 0-1.26-.57-1.26-1.27V5.63a1.27 1.27 0 011.26-1.27zm3.83 4.35a.73.73 0 00-.73.73v5.09c0 .4.32.72.72.72h5.1a.73.73 0 00.73-.72V9.44a.73.73 0 00-.73-.73h-5.1Z",
  },
];

function BrandMark({ name, d }: { name: string; d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={name} className="h-[15px] w-[15px]">
      <path d={d} />
    </svg>
  );
}

function AnnouncementPill() {
  return (
    <Link href="#how"
      className="group mb-9 inline-flex items-center gap-3 rounded-full border border-white/[0.13] bg-white/[0.04] py-1.5 pl-4 pr-3 text-[13px] font-medium text-[#F7F8F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.5)] transition-colors hover:bg-white/[0.08]">
      <span>Connect everything you already use</span>
      <span className="h-4 w-px bg-white/[0.14]" />
      <span className="flex items-center gap-2.5 text-[#C1C5CC]">
        {BRAND_MARKS.map((m) => (
          <BrandMark key={m.name} name={m.name} d={m.d} />
        ))}
      </span>
      <IconArrow className="h-3.5 w-3.5 text-[#8A8F98] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function Hero() {
  return (
    <section className="px-6 pb-24 pt-40">
      <div className="mx-auto max-w-[1344px] text-center">
        <AnnouncementPill />

        <h1 className="mx-auto mb-6 max-w-4xl text-balance text-[44px] font-[510] leading-[1.0] tracking-[-0.022em] text-[#F7F8F8] sm:text-[64px]">
          Bookkeeping that closes itself
        </h1>

        <p className="mx-auto mb-10 max-w-md text-[15px] leading-6 text-[#8A8F98]">
          Built on a real double-entry ledger. Closes your month automatically, for $29.
        </p>

        <div className="mb-20 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login"
            className="flex h-10 items-center rounded-lg border border-black/25 bg-[#E5E5E6] px-5 text-[16px] font-[510] text-[#08090A] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.6)] transition-colors hover:bg-white">
            Get started free
          </Link>
          <a href="#how"
            className="flex h-10 items-center rounded-lg border border-black/40 bg-white/[0.06] px-5 text-[16px] font-[510] text-[#F7F8F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.6)] transition-colors hover:bg-white/[0.1]">
            See how it works
          </a>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_140px_-50px_rgba(74,222,128,0.25),0_20px_60px_-30px_rgba(0,0,0,1)]">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="bg-[#0F1011] text-left text-[#F7F8F8]">
      <div className="flex items-center gap-6 border-b border-white/[0.07] bg-[#131415] px-5 py-3">
        <div className="flex items-center gap-2">
          <Mark size="h-5 w-5" />
          <span className="text-[13px] font-semibold tracking-tight">Booked</span>
        </div>
        <div className="hidden items-center gap-5 text-[13px] sm:flex">
          <span className="-mb-3 border-b-2 border-[#4ade80] pb-3 font-medium">Overview</span>
          <span className="text-[#8A8F98]">Transactions</span>
          <span className="text-[#8A8F98]">Statements</span>
        </div>
        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-medium text-[#8A8F98]">
          NS
        </span>
      </div>

      <div className="p-6 sm:p-9">
        <div className="mb-1 text-xs uppercase tracking-wider text-[#8A8F98]">Northwind Studio</div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="text-2xl font-semibold tracking-tight">August 2026</div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 px-3 py-1 text-xs font-medium text-[#4ade80]">
            <IconCheck className="h-3.5 w-3.5" /> Books closed
          </span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Revenue", value: "$12,480.00" },
            { label: "Expenses", value: "$4,932.18" },
            { label: "Net income", value: "$7,547.82", green: true },
            { label: "Cash balance", value: "$18,204.55" },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="mb-1 text-[11px] uppercase tracking-wider text-[#8A8F98]">{k.label}</div>
              <div className={`text-lg font-semibold tabular-nums tracking-tight ${k.green ? "text-[#4ade80]" : ""}`}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.07]">
          <div className="border-b border-white/[0.07] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
            Profit &amp; loss — August
          </div>
          <div className="divide-y divide-white/[0.04] px-5 py-2">
            {[
              ["4000 · Product revenue", "$11,940.00", false],
              ["4100 · Consulting", "$540.00", false],
              ["6000 · Hosting", "($1,284.30)", true],
              ["6100 · Software", "($2,447.88)", true],
              ["6300 · Payment fees", "($1,200.00)", true],
            ].map(([l, v, dim]) => (
              <div key={String(l)} className={`flex justify-between py-1.5 text-sm ${dim ? "text-[#8A8F98]" : "text-[#F7F8F8]"}`}>
                <span>{l}</span>
                <span className="font-mono tabular-nums">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-white/[0.07] px-5 py-3 text-sm font-semibold">
            <span>Net income</span>
            <span className="font-mono tabular-nums text-[#4ade80]">$7,547.82</span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#4ade80]/15 bg-[#4ade80]/[0.06] px-5 py-4">
          <IconSwap className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" />
          <p className="text-xs leading-relaxed text-[#8A8F98]">
            <span className="font-semibold text-[#F7F8F8]">3 Stripe payouts reconciled.</span>{" "}
            Each payout matched to its bank deposit — revenue counted once, fees split out, clearing account back to zero.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================== ledger statement */

const STROKE = "rgba(255,255,255,0.3)";

function FigLedger() {
  const cx = 130, w = 86, h = 43;
  const layers = [90, 109, 128, 147, 166];
  const last = layers[layers.length - 1];
  return (
    <svg viewBox="0 0 260 260" fill="none" className="fig-anim h-full w-full" aria-hidden>
      <g stroke={STROKE} strokeWidth="1">
        {layers.map((cy, i) => (
          <path key={cy} opacity={1 - i * 0.12}
            style={{ animation: `fig-drift 6s ease-in-out ${i * 0.4}s infinite` }}
            d={`M${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} L${cx - w} ${cy} Z`} />
        ))}
        <g strokeDasharray="2 3" opacity="0.45">
          <path d={`M${cx - w} ${layers[0]} L${cx - w} ${last}`} />
          <path d={`M${cx + w} ${layers[0]} L${cx + w} ${last}`} />
          <path d={`M${cx} ${layers[0] + h} L${cx} ${last + h}`} />
        </g>
      </g>
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="1">
        <ellipse cx={cx} cy={layers[0]} rx="44" ry="22" />
        <path opacity="0.55" d={`M${cx - 40} ${layers[0] - 7} L${cx + 40} ${layers[0] - 7}`} />
        <path opacity="0.55" d={`M${cx - 43} ${layers[0]} L${cx + 43} ${layers[0]}`} />
        <path opacity="0.55" d={`M${cx - 40} ${layers[0] + 7} L${cx + 40} ${layers[0] + 7}`} />
      </g>
    </svg>
  );
}

function Cube({ cx, cy, w, h, d, o, delay }: {
  cx: number; cy: number; w: number; h: number; d: number; o: number; delay: number;
}) {
  return (
    <g stroke={STROKE} strokeWidth="1" opacity={o}
      style={{ animation: `fig-drift 5.5s ease-in-out ${delay}s infinite` }}>
      <path d={`M${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} L${cx - w} ${cy} Z`} />
      <path d={`M${cx - w} ${cy} L${cx} ${cy + h} L${cx} ${cy + h + d} L${cx - w} ${cy + d} Z`} />
      <path d={`M${cx + w} ${cy} L${cx} ${cy + h} L${cx} ${cy + h + d} L${cx + w} ${cy + d} Z`} />
      <g opacity="0.5">
        <path d={`M${cx - 12} ${cy - h * 0.32} L${cx + 2} ${cy - h * 0.32 + 7}`} />
        <path d={`M${cx - 12} ${cy - h * 0.32 + 6} L${cx + 2} ${cy - h * 0.32 + 13}`} />
      </g>
    </g>
  );
}

function FigSources() {
  return (
    <svg viewBox="0 0 260 260" fill="none" className="fig-anim h-full w-full" aria-hidden>
      <Cube cx={140} cy={54} w={46} h={23} d={32} o={0.75} delay={0} />
      <Cube cx={82} cy={104} w={42} h={21} d={29} o={0.9} delay={0.9} />
      <Cube cx={190} cy={116} w={42} h={21} d={29} o={0.6} delay={1.8} />
      <Cube cx={132} cy={158} w={45} h={22} d={31} o={1} delay={2.6} />
    </svg>
  );
}

function FigClose() {
  const blades = Array.from({ length: 11 });
  return (
    <svg viewBox="0 0 260 260" fill="none" className="fig-anim h-full w-full" aria-hidden>
      <g stroke={STROKE} strokeWidth="1">
        {blades.map((_, i) => {
          const x = 22 + i * 13;
          const y = 200 - i * 6.5;
          const H = 18 + i * 7;
          return (
            <g key={i} opacity={0.35 + i * 0.05}
              style={{ animation: `fig-pulse 3.2s ease-in-out ${i * 0.16}s infinite` }}>
              <path d={`M${x} ${y} L${x + 74} ${y - 37} L${x + 74} ${y - 37 - H} L${x} ${y - H} Z`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

const FIGURES = [
  {
    fig: "FIG 0.1",
    node: <FigLedger />,
    title: "Double-entry, always",
    body: "Every transaction posts a debit and a credit. The books balance because they cannot do anything else.",
  },
  {
    fig: "FIG 0.2",
    node: <FigSources />,
    title: "Connected at the source",
    body: "Bank, Stripe and card feeds arrive as journal entries. No exports, no CSVs, no month-end scramble.",
  },
  {
    fig: "FIG 0.3",
    node: <FigClose />,
    title: "Closes on schedule",
    body: "Reconciliation runs every night, so closing the month is a review rather than a reconstruction.",
  },
];

function LedgerStatement() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-[1344px]">
        <h2 className="mb-24 max-w-5xl text-[30px] font-[510] leading-[1.1] tracking-[-0.022em] text-[#8A8F98] sm:text-[48px]">
          <span className="text-[#F7F8F8]">A ledger, not a spreadsheet.</span> Booked posts both
          sides of every entry, reconciles every payout to the cent, and closes the month without
          being asked.
        </h2>

        <div className="grid gap-px sm:grid-cols-3">
          {FIGURES.map((f, i) => (
            <div key={f.fig}
              className={`sm:px-10 ${i === 0 ? "sm:pl-0" : "sm:border-l sm:border-white/[0.07]"} ${i === 2 ? "sm:pr-0" : ""}`}>
              <p className="mb-6 font-mono text-[11px] tracking-[0.1em] text-[#4b5058]">{f.fig}</p>
              <div className="mx-auto mb-10 h-[260px] w-full max-w-[300px]">{f.node}</div>
              <h3 className="mb-2 text-[15px] font-semibold text-[#F7F8F8]">{f.title}</h3>
              <p className="max-w-[300px] text-[15px] leading-6 text-[#8A8F98]">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ logo bar */

function LogoBar() {
  return (
    <div className="border-y border-white/[0.06] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-7 text-[10px] uppercase tracking-[0.15em] text-zinc-600">Integrates with</p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          {["Stripe", "Plaid", "Mercury", "Chase", "Shopify", "Square"].map((name) => (
            <span key={name} className="text-base font-semibold text-zinc-600">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======================================================= feature rows */

function FeatureList({ items }: { items: string[] }) {
  const half = Math.ceil(items.length / 2);
  const col = (list: string[], divider: boolean) => (
    <ul className={`space-y-3 ${divider ? "sm:border-l sm:border-white/[0.07] sm:pl-10" : ""}`}>
      {list.map((f) => (
        <li key={f} className="flex items-center gap-2 text-[14px] text-[#C1C5CC]">
          {f} <span className="text-[#4b5058]">+</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="mt-16 grid gap-8 sm:grid-cols-3">
      <p className="text-[14px] text-[#8A8F98]">Features</p>
      {col(items.slice(0, half), false)}
      {col(items.slice(half), true)}
    </div>
  );
}

function FeatureRow({
  id, title, body, features, children,
}: {
  id?: string; title: string; body: string; features: string[]; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-white/[0.06] px-6 py-32">
      <div className="mx-auto max-w-[1344px]">
        <div className="mb-16 grid gap-12 md:grid-cols-2 md:items-start">
          <h2 className="max-w-xs text-[30px] font-[510] leading-[1.1] tracking-[-0.022em] text-[#F7F8F8] sm:text-[40px]">
            {title}
          </h2>
          <div>
            <p className="max-w-lg text-[17px] leading-7 text-[#8A8F98]">{body}</p>
            <a href="#pricing"
              className="group mt-7 inline-flex items-center gap-1.5 text-[15px] text-[#8A8F98] transition-colors hover:text-[#F7F8F8]">
              Learn more
              <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_120px_-50px_rgba(74,222,128,0.2)]">
          {children}
        </div>

        <FeatureList items={features} />
      </div>
    </section>
  );
}

/* --------------------------------------------------------- reconcile */

const ENTRY = [
  { code: "1000", name: "Bank — checking", debit: "4,058.78", credit: "" },
  { code: "6300", name: "Payment processing fees", debit: "121.22", credit: "" },
  { code: "4000", name: "Product revenue", debit: "", credit: "4,180.00" },
];

function ReconcileMock() {
  return (
    <div className="bg-[#0F1011] p-8 text-[#F7F8F8] sm:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
          One Stripe payout, one entry
        </div>
        <div className="mb-6 font-mono text-xs text-[#6b7079]">po_1QxA7f · settled 28 Aug 2026</div>

        <div className="overflow-hidden rounded-lg border border-white/[0.07]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-white/[0.07] bg-white/[0.03] px-5 py-3 text-[10px] uppercase tracking-wider text-[#6b7079]">
            <span>Account</span><span>Debit</span><span>Credit</span>
          </div>
          {ENTRY.map((r) => (
            <div key={r.code} className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-white/[0.05] px-5 py-3.5 text-sm last:border-0">
              <span>
                <span className="font-mono text-[#6b7079]">{r.code}</span>{" "}
                <span className="text-[#C1C5CC]">{r.name}</span>
              </span>
              <span className="font-mono tabular-nums text-[#C1C5CC]">{r.debit || "—"}</span>
              <span className="font-mono tabular-nums text-[#C1C5CC]">{r.credit || "—"}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-t border-white/[0.07] bg-white/[0.03] px-5 py-3 text-sm font-semibold">
            <span className="text-[#4ade80]">Balanced ✓</span>
            <span className="font-mono tabular-nums">4,180.00</span>
            <span className="font-mono tabular-nums">4,180.00</span>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-[#8A8F98]">
          <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4ade80]" />
          Debits equal credits or the entry does not post. Revenue is never counted twice.
        </p>
      </div>
    </div>
  );
}

function ReconcileSection() {
  return (
    <FeatureRow id="how"
      title="Stripe payouts, one entry each"
      body="Each payout is matched to the bank deposit it became and booked as a single balanced entry — gross revenue in, processing fees out, clearing account back to zero. The hardest thing to get right in SaaS books, done automatically."
      features={["Payout matching", "Fee splitting", "Clearing accounts", "Bank feeds", "Multi-currency", "Audit trail"]}>
      <ReconcileMock />
    </FeatureRow>
  );
}

/* --------------------------------------------------------- categorise */

const TXNS = [
  { merchant: "AWS", category: "Hosting", amount: "-$284.30", conf: 99, auto: true },
  { merchant: "Figma", category: "Software", amount: "-$45.00", conf: 97, auto: true },
  { merchant: "Framer", category: "Software", amount: "-$19.00", conf: 71, auto: false },
  { merchant: "Notion Labs", category: "Software", amount: "-$16.00", conf: 68, auto: false },
  { merchant: "Uber Trip", category: "Travel", amount: "-$23.50", conf: 58, auto: false },
];

function CategoriseMock() {
  return (
    <div className="bg-[#0F1011] p-8 text-[#F7F8F8] sm:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-[#8A8F98]">Transactions · August</span>
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-amber-300">
            3 need review
          </span>
        </div>
        <div className="divide-y divide-white/[0.05] overflow-hidden rounded-lg border border-white/[0.07]">
          {TXNS.map((t) => (
            <div key={t.merchant} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#F7F8F8]">{t.merchant}</div>
                <div className="text-xs text-[#8A8F98]">{t.category}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                t.conf >= 90 ? "bg-[#4ade80]/10 text-[#4ade80]"
                : t.conf >= 70 ? "bg-amber-400/10 text-amber-300"
                : "bg-red-400/10 text-red-300"}`}>
                {t.conf}%
              </span>
              <div className="w-20 text-right font-mono text-sm tabular-nums text-[#C1C5CC]">{t.amount}</div>
              {t.auto
                ? <span className="w-20 text-right text-[10px] font-medium text-[#4ade80]">Auto-posted</span>
                : <button className="w-20 rounded border border-white/[0.07] px-2 py-1 text-[11px] text-[#8A8F98] text-center">Review</button>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#8A8F98]">
          392 transactions auto-posted · High-confidence entries never reach your inbox
        </p>
      </div>
    </div>
  );
}

function CategoriseSection() {
  return (
    <FeatureRow id="features"
      title="Eight to review, not four hundred"
      body="Deterministic rules handle everything predictable. The model takes the rest and shows its confidence score. Correct one merchant and the rule is written for next month — the same vendor is never asked about again."
      features={["Merchant rules", "Confidence scores", "Learned corrections", "Chart of accounts", "Split transactions", "Bulk review"]}>
      <CategoriseMock />
    </FeatureRow>
  );
}

/* --------------------------------------------------------- reporting */

function ReportingMock() {
  return (
    <div className="bg-[#0F1011] p-8 text-[#F7F8F8] sm:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wider text-[#8A8F98]">Profit &amp; loss</div>
            <div className="font-semibold text-[#F7F8F8]">August 2026 · Northwind Studio</div>
          </div>
          <button className="rounded border border-white/[0.07] px-3 py-1.5 text-xs text-[#8A8F98]">
            Export PDF
          </button>
        </div>

        <div className="rounded-lg border border-white/[0.07] overflow-hidden">
          <div className="border-b border-white/[0.07] bg-white/[0.03] px-5 py-3 flex justify-between text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
            <span>Revenue</span><span className="font-mono tabular-nums">$12,480.00</span>
          </div>
          {[["4000 · Product revenue", "$11,940.00"], ["4100 · Consulting", "$540.00"]].map(([l, v]) => (
            <div key={String(l)} className="flex justify-between border-b border-white/[0.05] px-5 py-2.5 pl-8 text-sm">
              <span className="text-[#8A8F98]">{l}</span>
              <span className="font-mono tabular-nums text-[#C1C5CC]">{v}</span>
            </div>
          ))}
          <div className="border-b border-white/[0.07] bg-white/[0.03] px-5 py-3 flex justify-between text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
            <span>Expenses</span><span className="font-mono tabular-nums">($4,932.18)</span>
          </div>
          {[["6000 · Hosting", "($1,284.30)"], ["6100 · Software", "($2,447.88)"], ["6300 · Payment fees", "($1,200.00)"]].map(([l, v]) => (
            <div key={String(l)} className="flex justify-between border-b border-white/[0.05] px-5 py-2.5 pl-8 text-sm last:border-0">
              <span className="text-[#8A8F98]">{l}</span>
              <span className="font-mono tabular-nums text-[#C1C5CC]">{v}</span>
            </div>
          ))}
          <div className="flex justify-between border-t-2 border-white/25 px-5 py-4 text-sm font-bold">
            <span>Net income</span>
            <span className="font-mono tabular-nums text-[#4ade80]">$7,547.82</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportingSection() {
  return (
    <FeatureRow
      title="Statements on demand"
      body="P&L and balance sheet generated straight from the ledger for any period — every figure traceable to its journal entry. Export the moment your accountant asks. Cash flow statement is next."
      features={["Profit & loss", "Balance sheet", "Trial balance", "Any date range", "CSV and PDF export", "Drill-down to entry"]}>
      <ReportingMock />
    </FeatureRow>
  );
}

/* ============================================================ pricing */

const PLANS = [
  {
    name: "Free", price: "$0", note: "during beta",
    features: ["Up to 100 transactions/mo", "Bank + Stripe connections", "Agent categorisation", "P&L and balance sheet"],
    cta: "Get started", href: "/login",
  },
  {
    name: "Starter", price: "$29", note: "/month",
    features: ["Unlimited transactions", "Stripe payout reconciliation", "Learned rules from corrections", "Statement export", "Monthly close packet"],
    cta: "Get started", href: "/login", highlight: true,
  },
  {
    name: "Self-hosted", price: "Free", note: "forever",
    features: ["Run it on your own infra", "Bring your own model key", "Full ledger, full source", "MIT licensed"],
    cta: "View source", href: GITHUB,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-white/[0.06] px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-zinc-600">Pricing</p>
        <h2 className="mb-3 text-[40px] font-bold tracking-[-0.03em]">
          One tenth of what the books used to cost.
        </h2>
        <p className="mb-14 text-zinc-500">Free while we're in beta. No card, no sales call.</p>

        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                plan.highlight
                  ? "border-[#4ade80]/25 bg-[#4ade80]/[0.04]"
                  : "border-white/[0.07] bg-white/[0.02]"}`}>
              {plan.highlight && (
                <span className="absolute -top-px left-7 rounded-b-none rounded-t-2xl bg-[#4ade80] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  Most popular
                </span>
              )}
              <p className={`mb-2 text-[11px] uppercase tracking-wider ${plan.highlight ? "text-[#4ade80]" : "text-zinc-500"}`}>
                {plan.name}
              </p>
              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm text-zinc-500">{plan.note}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <IconCheck className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-[#4ade80]" : "text-zinc-600"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-[#4ade80] text-black hover:bg-[#22c55e]"
                    : "border border-white/10 text-white hover:bg-white/[0.06]"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================== closing cta */

const CHANGELOG = [
  {
    title: "Payout reconciliation",
    body: "Stripe payouts now match to their bank deposit automatically and post as one balanced entry.",
    date: "SEP 4, 2026",
  },
  {
    title: "Learned merchant rules",
    body: "Correcting a category once writes the rule. The same vendor is never queued for review again.",
    date: "AUG 27, 2026",
  },
  {
    title: "Balance sheet",
    body: "Balance sheet joins the P&L, generated from the ledger for any date range you ask for.",
    date: "AUG 19, 2026",
  },
  {
    title: "Bench importer",
    body: "Bring your history across from a Bench export — opening balances land as a journal entry.",
    date: "AUG 8, 2026",
  },
];

function Changelog() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-32">
      <div className="mx-auto max-w-[1344px]">
        <h2 className="mb-14 text-[30px] font-[510] leading-[1.1] tracking-[-0.022em] text-[#F7F8F8] sm:text-[40px]">
          Changelog
        </h2>

        <div className="relative mb-9 h-2">
          <div className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-white/[0.09]" />
          <div className="relative grid grid-cols-2 sm:grid-cols-4">
            {CHANGELOG.map((c, i) => (
              <span key={c.title}
                className={`h-2 w-2 rounded-full ${i === 0 ? "bg-[#4ade80]" : "bg-[#3a3f47]"}`} />
            ))}
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-10 grid-cols-2 sm:grid-cols-4">
          {CHANGELOG.map((c) => (
            <div key={c.title} className="pr-6">
              <h3 className="mb-2 text-[15px] text-[#F7F8F8]">{c.title}</h3>
              <p className="mb-5 text-[14px] leading-6 text-[#8A8F98]">{c.body}</p>
              <p className="font-mono text-[11px] tracking-[0.08em] text-[#4b5058]">{c.date}</p>
            </div>
          ))}
        </div>

        <a href={GITHUB}
          className="group mt-14 inline-flex items-center gap-1.5 text-[15px] text-[#8A8F98] transition-colors hover:text-[#F7F8F8]">
          View all
          <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="border-t border-white/[0.06] px-6 pb-36 pt-16">
      <div className="mx-auto max-w-[1344px]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-32 text-[15px] text-[#8A8F98]">
          <p>
            Booked is <span className="text-[#F7F8F8]">open source</span> and built in public for
            The Build Games.
          </p>
          <a href={GITHUB}
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-[#F7F8F8]">
            <IconCode className="h-4 w-4" />
            Read the source
            <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="text-center">
          <h2 className="mx-auto mb-9 max-w-2xl text-[36px] font-[510] leading-[1.05] tracking-[-0.022em] text-[#F7F8F8] sm:text-[56px]">
            Built on a real ledger.
            <br />
            Closed by tomorrow.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login"
              className="flex h-10 items-center rounded-lg border border-black/25 bg-[#E5E5E6] px-5 text-[16px] font-[510] text-[#08090A] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.6)] transition-colors hover:bg-white">
              Get started free
            </Link>
            <a href="#pricing"
              className="flex h-10 items-center rounded-lg border border-black/40 bg-white/[0.06] px-5 text-[16px] font-[510] text-[#F7F8F8] shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.6)] transition-colors hover:bg-white/[0.1]">
              See pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================= footer */

function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <Mark />
              <span className="text-sm font-semibold">Booked</span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
              Autonomous bookkeeping for small businesses and solo founders. Built to replace the service that left.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "How it works", href: "#how" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
          ]} />
          <FooterCol title="Get started" links={[
            { label: "Create account", href: "/login" },
            { label: "Log in", href: "/login" },
          ]} />
          <FooterCol title="Project" links={[
            { label: "Source on GitHub", href: GITHUB },
            { label: "The Build Games", href: "https://canivibecodeit.com/thebuildgames" },
          ]} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-7 text-xs text-zinc-600">
          <span>© 2026 Booked. MIT licensed.</span>
          <span>Built in public, Sep 6–30 2026 · Best Replacement track.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-[10px] uppercase tracking-[0.15em] text-zinc-600">{title}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-xs text-zinc-500 transition-colors hover:text-white">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
