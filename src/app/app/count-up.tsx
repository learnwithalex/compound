"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fmtDollars, fmtMrr } from "@/lib/format";

type Kind = "dollars" | "mrr" | "plain";

const FORMAT: Record<Kind, (n: number) => string> = {
  dollars: (n) => fmtDollars(n),
  mrr: (n) => fmtMrr(n),
  plain: (n) => Math.round(n).toLocaleString(),
};

// Layout effect on the client only; on the server it would warn and do nothing.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Counts from zero to `value` on mount. Renders the true value server-side, so
 *  the number is correct before hydration and for anyone without JS. */
export function CountUp({
  value,
  kind = "dollars",
  durationMs = 900,
  className,
  style,
}: {
  value: number;
  kind?: Kind;
  durationMs?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [shown, setShown] = useState(value);
  const frame = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }

    setShown(0);
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setShown(value * (1 - (1 - p) ** 4));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value, durationMs]);

  return (
    <span className={className} style={style}>
      {FORMAT[kind](shown)}
    </span>
  );
}
