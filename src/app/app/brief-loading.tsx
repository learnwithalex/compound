"use client";
import { useEffect, useState } from "react";

/** Emoji, not drawn art: these all render on Windows, and the joke lands faster
 *  than a spinner does. Order is shuffled per run so it doesn't feel scripted. */
const MEMES: { face: string; caption: string; sub: string }[] = [
  { face: "🤖", caption: "Waking the analyst", sub: "He was asleep. He is always asleep." },
  { face: "🧮", caption: "Counting your money", sub: "Twice. Once for luck." },
  { face: "📉", caption: "Looking at the churn", sub: "…and then looking away." },
  { face: "🫠", caption: "Converting vibes to basis points", sub: "This is harder than it sounds." },
  { face: "🔮", caption: "Consulting the crystal ball", sub: "It says 'ship faster'. It always says that." },
  { face: "💸", caption: "Rounding in your favour", sub: "Don't tell your accountant." },
  { face: "🧠", caption: "Pretending to have read the P&L", sub: "Nobody reads the P&L." },
  { face: "🚀", caption: "Verifying whether this is, in fact, stonks", sub: "Early signs: promising." },
  { face: "☕", caption: "Making the CFO a coffee", sub: "He gets grumpy without one." },
];

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function BriefLoading({ onCancel }: { onCancel: () => void }) {
  const [deck] = useState(() => shuffled(MEMES));
  const [i, setI] = useState(0);
  const [pct, setPct] = useState(6);

  useEffect(() => {
    const slide = setInterval(() => setI((n) => (n + 1) % deck.length), 2600);
    // Asymptotic: always moving, never arrives, so a slow model never looks stuck.
    const creep = setInterval(() => setPct((p) => p + (96 - p) * 0.06), 220);
    return () => {
      clearInterval(slide);
      clearInterval(creep);
    };
  }, [deck.length]);

  const meme = deck[i];

  return (
    <div className="brief-anim pb-14">
      <section className="overflow-hidden rounded-sm bg-white" style={{ border: "1px solid #ebebeb" }}>
        <div
          className="flex flex-col items-center px-6 py-14 text-center"
          style={{ background: "linear-gradient(180deg,#fafafa 0%,#ffffff 70%)" }}
        >
          <div className="relative mb-7 flex h-[104px] w-[104px] items-center justify-center">
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle,rgba(94,106,210,0.16) 0%,rgba(94,106,210,0) 68%)" }}
            />
            <span
              key={meme.face}
              className="text-[58px] leading-none"
              style={{ animation: "brief-bob 2.4s ease-in-out infinite" }}
            >
              {meme.face}
            </span>
          </div>

          <div key={meme.caption} style={{ animation: "brief-pop 0.35s ease-out" }}>
            <p className="text-[19px] font-bold tracking-tight text-lx-text" style={{ letterSpacing: "-0.02em" }}>
              {meme.caption}…
            </p>
            <p className="mt-1.5 text-[13px] text-lx-muted">{meme.sub}</p>
          </div>

          <div className="relative mt-8 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full" style={{ background: "#ebebeb" }}>
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-linear"
              style={{ width: `${pct}%`, background: "#5e6ad2" }}
            />
            <div
              className="absolute inset-y-0 w-1/4"
              style={{
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)",
                animation: "brief-sweep 1.5s ease-in-out infinite",
              }}
            />
          </div>

          <div className="mt-5 flex items-center gap-2">
            {deck.slice(0, 5).map((_, n) => (
              <span
                key={n}
                className="h-1 w-1 rounded-full"
                style={{ background: "#5e6ad2", animation: `fig-pulse 1.4s ease-in-out ${n * 0.18}s infinite` }}
              />
            ))}
          </div>

          <button
            onClick={onCancel}
            className="mt-8 text-[12px] font-medium text-lx-faint underline-offset-4 transition-colors hover:text-lx-muted hover:underline"
          >
            Never mind, back to the dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
