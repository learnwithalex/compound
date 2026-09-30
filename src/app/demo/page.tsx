import Link from "next/link";
import { CompoundWordmark } from "../compound-logo";

const products = [
  { name: "Scarlet DB", provider: "Stripe", mrr: "$8,430", change: "+12.4%", subs: 680, color: "#5e6ad2" },
  { name: "NotePad Pro", provider: "Lemon Squeezy", mrr: "$3,200", change: "+4.1%", subs: 210, color: "#e5a00d" },
  { name: "FormKit", provider: "Polar", mrr: "$2,270", change: "−1.8%", subs: 63, color: "#111827" },
];

export const metadata = {
  title: "Live demo — Compound",
  description: "Explore Compound's sample revenue dashboard. No account required.",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f7] px-4 py-5 text-[#222528] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" aria-label="Compound home"><CompoundWordmark height={24} /></Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Sample data</span>
            <Link href="/login" className="rounded-lg bg-[#222528] px-4 py-2 text-sm font-semibold text-white">Connect your data</Link>
          </div>
        </header>
        <section className="mb-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#5e6ad2]">Portfolio overview · demo</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div><h1 className="text-sm font-medium text-black/50">Total monthly recurring revenue</h1><p className="mt-1 text-5xl font-semibold tracking-tight">$13,900</p><p className="mt-2 text-sm text-emerald-700">↑ 8.7% over the last 30 days</p></div>
            <div className="flex gap-6 text-sm"><div><p className="text-black/45">ARR</p><p className="mt-1 font-semibold">$166,800</p></div><div><p className="text-black/45">Active subscribers</p><p className="mt-1 font-semibold">953</p></div></div>
          </div>
          <div className="mt-7 grid h-24 grid-cols-12 items-end gap-1" aria-label="Sample revenue trend">
            {[35,39,34,47,43,51,48,59,54,68,71,82].map((h,i)=><div key={i} className="rounded-t bg-[#5e6ad2]/75" style={{height:`${h}%`}} />)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-black/40"><span>30 days ago</span><span>Today</span></div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <div className="border-b border-black/5 px-5 py-4"><h2 className="font-semibold">Products</h2><p className="mt-1 text-xs text-black/45">Sample MRR, normalized to monthly billing</p></div>
            {products.map(p=><div key={p.name} className="flex items-center gap-3 border-b border-black/5 px-5 py-4 last:border-0"><span className="h-3 w-3 rounded-full" style={{background:p.color}}/><div className="min-w-0 flex-1"><p className="font-medium">{p.name}</p><p className="text-xs text-black/45">{p.provider} · {p.subs} active subs</p></div><div className="text-right"><p className="font-semibold">{p.mrr}<span className="ml-1 text-xs font-normal text-black/45">/mo</span></p><p className={`text-xs ${p.change.startsWith("+")?"text-emerald-700":"text-red-600"}`}>{p.change}</p></div></div>)}
            <div className="bg-[#f8f8fb] px-5 py-3 text-xs text-black/50">$8,430 + $3,200 + $2,270 = $13,900 total MRR</div>
          </div>
          <aside className="rounded-2xl border border-[#5e6ad2]/20 bg-[#f0f1fb] p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-wider text-[#5e6ad2]">AI briefing · sample</p><h2 className="mt-3 text-lg font-semibold">Growth is led by Scarlet DB</h2><p className="mt-3 text-sm leading-6 text-black/65">Your sample portfolio is at <b>$13,900 MRR</b>, up <b>8.7%</b> over 30 days. Scarlet DB contributes $8,430 and has the strongest growth rate.</p><div className="mt-4 rounded-xl bg-white/80 p-4 text-sm leading-6 text-black/65"><b className="text-[#5e6ad2]">Suggested action</b><br/>Review FormKit&apos;s recent cancellations and ask a few customers what changed.</div><p className="mt-4 text-[11px] text-black/40">Illustrative briefing based on sample figures, not generated live.</p></aside>
        </section>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-black/50"><span>This is a product preview using fictional sample data.</span><Link href="/login" className="font-semibold text-[#5e6ad2]">Create an account to connect a provider →</Link></footer>
      </div>
    </main>
  );
}
