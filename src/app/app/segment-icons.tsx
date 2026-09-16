const S = {
  viewBox: "0 0 24 24",
  width: 12,
  height: 12,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Badge({
  bg, fg, border, children,
}: { bg: string; fg: string; border?: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-sm text-[10px] font-bold leading-none"
      style={{ background: bg, color: fg, border }}
    >
      {children}
    </span>
  );
}

/* ============================================================ acquisition */

function RedditMark() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13">
      <circle cx="12" cy="14" r="7.5" fill="#fff" />
      <circle cx="9.2" cy="13.4" r="1.7" fill="#FF4500" />
      <circle cx="14.8" cy="13.4" r="1.7" fill="#FF4500" />
      <path d="M9 17.4c1.8 1.2 4.2 1.2 6 0" stroke="#FF4500" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="17" cy="4.3" r="2.1" fill="#fff" />
      <path d="M12.6 7.2 15.6 5.2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11">
      <path
        d="M3 3h4.2l5 6.7L17.6 3H21l-7.1 8.2L21.4 21h-4.2l-5.4-7.2L5.4 21H2l7.6-8.8L3 3z"
        fill="#fff"
      />
    </svg>
  );
}

function MailMark() {
  return (
    <svg {...S} width="12" height="12" stroke="#fff">
      <rect x="3" y="6" width="18" height="12.5" rx="2.5" />
      <path d="M4.5 8.5 12 14l7.5-5.5" />
    </svg>
  );
}

function GlobeMark() {
  return (
    <svg {...S} width="12" height="12" stroke="#fff">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 3 2.6 15 0 18-2.6-3-2.6-15 0-18z" />
    </svg>
  );
}

export function SourceMark({ source }: { source: string }) {
  const k = source.toLowerCase();
  if (k === "unattributed") return <Badge bg="#e7e3dc" fg="#8a857e">?</Badge>;
  if (k.includes("google")) return <Badge bg="#ffffff" fg="#4285F4" border="1px solid #e0dcd5">G</Badge>;
  if (k.includes("producthunt") || k.includes("product hunt")) return <Badge bg="#DA552F" fg="#fff">P</Badge>;
  if (k.includes("reddit")) return <Badge bg="#FF4500" fg="#fff"><RedditMark /></Badge>;
  if (k.includes("twitter") || k === "x") return <Badge bg="#0f0f0f" fg="#fff"><XMark /></Badge>;
  if (k.includes("hackernews") || k.includes("hacker news")) return <Badge bg="#FF6600" fg="#fff">Y</Badge>;
  if (k.includes("newsletter") || k.includes("email")) return <Badge bg="#5e6ad2" fg="#fff"><MailMark /></Badge>;
  if (k.includes("github")) return <Badge bg="#24292f" fg="#fff">GH</Badge>;
  if (k.includes("linkedin")) return <Badge bg="#0A66C2" fg="#fff">in</Badge>;
  if (k.includes("youtube")) return <Badge bg="#FF0000" fg="#fff">▶</Badge>;
  if (k.includes("direct") || k.includes("organic")) return <Badge bg="#9a9a9a" fg="#fff"><GlobeMark /></Badge>;
  return <Badge bg="#9a9a9a" fg="#fff">{source.charAt(0).toUpperCase()}</Badge>;
}

/* ============================================================ country */

/** Flags are drawn, not emoji: regional-indicator pairs fall back to bare
 *  letters on Windows, where most desktop traffic is. */
const FLAGS: Record<string, React.ReactNode> = {
  US: (
    <>
      <rect width="24" height="16" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * (16 / 13)} width="24" height={16 / 13} fill="#B22234" />
      ))}
      <rect width="10" height={(16 / 13) * 7} fill="#3C3B6E" />
    </>
  ),
  GB: (
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.8" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.4" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.2" />
    </>
  ),
  DE: (
    <>
      <rect width="24" height="16" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#DD0000" />
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
    </>
  ),
  CA: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="6" height="16" fill="#D80621" />
      <rect x="18" width="6" height="16" fill="#D80621" />
      <path d="M12 3.2l1.1 2.4 2.2-.8-.8 2.4 2.1.4-1.9 1.5.5 1.3-2.4-.5.3 2.6h-1.2l.3-2.6-2.4.5.5-1.3L8.4 7.6l2.1-.4-.8-2.4 2.2.8z" fill="#D80621" />
    </>
  ),
  AU: (
    <>
      <rect width="24" height="16" fill="#00247D" />
      <path d="M0 0l12 8M12 0L0 8" stroke="#fff" strokeWidth="1.8" />
      <path d="M6 0v8M0 4h12" stroke="#fff" strokeWidth="2.8" />
      <path d="M6 0v8M0 4h12" stroke="#C8102E" strokeWidth="1.5" />
      <g fill="#fff">
        <circle cx="6" cy="12.6" r="1.5" />
        <circle cx="17" cy="4" r="0.9" />
        <circle cx="20" cy="8" r="0.9" />
        <circle cx="17" cy="12" r="0.9" />
        <circle cx="14.5" cy="7.6" r="0.7" />
      </g>
    </>
  ),
  FR: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#002395" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </>
  ),
  NL: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.33" fill="#AE1C28" />
      <rect y="10.67" width="24" height="5.33" fill="#21468B" />
    </>
  ),
  IN: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.33" fill="#FF9933" />
      <rect y="10.67" width="24" height="5.33" fill="#138808" />
      <circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth="0.8" />
    </>
  ),
  BR: (
    <>
      <rect width="24" height="16" fill="#009C3B" />
      <path d="M12 2.2 21.6 8 12 13.8 2.4 8z" fill="#FFDF00" />
      <circle cx="12" cy="8" r="3.2" fill="#002776" />
    </>
  ),
  NG: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#008751" />
      <rect x="16" width="8" height="16" fill="#008751" />
    </>
  ),
  SE: (
    <>
      <rect width="24" height="16" fill="#006AA7" />
      <path d="M8 0v16M0 8h24" stroke="#FECC00" strokeWidth="3.2" />
    </>
  ),
  JP: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <circle cx="12" cy="8" r="4.6" fill="#BC002D" />
    </>
  ),
};

export function CountryMark({ code }: { code: string }) {
  const cc = (code ?? "").toUpperCase();
  const flag = FLAGS[cc];
  if (!flag) {
    return (
      <Badge bg="#e7e3dc" fg="#6f6a63">
        <span className="text-[8px] tracking-tight">{/^[A-Z]{2}$/.test(cc) ? cc : "?"}</span>
      </Badge>
    );
  }
  return (
    <span
      className="inline-flex h-[13px] w-[19px] shrink-0 overflow-hidden rounded-[3px]"
      style={{ boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)" }}
    >
      <svg viewBox="0 0 24 16" width="19" height="13">{flag}</svg>
    </span>
  );
}

/* ============================================================ plan */

const PLAN_TINTS = ["#5e6ad2", "#10b981", "#e8a838", "#e54d2e", "#8b5cf6", "#0ea5e9"];

/** Stable colour per plan name, so unseen plans still get a consistent tint. */
export function planTint(plan: string | null): string {
  if (!plan) return "#9a9a9a";
  let h = 0;
  for (let i = 0; i < plan.length; i++) h = (h * 31 + plan.charCodeAt(i)) >>> 0;
  return PLAN_TINTS[h % PLAN_TINTS.length];
}

function PlanGlyph({ plan }: { plan: string }) {
  const k = plan.toLowerCase();
  if (/free|hobby|starter|basic|lite/.test(k)) {
    return <svg {...S}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>;
  }
  if (/solo|personal|individual/.test(k)) {
    return <svg {...S}><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
  }
  if (/team|studio|squad|growth/.test(k)) {
    return <svg {...S}><path d="M16 20v-1.4a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" /><circle cx="9.5" cy="7.5" r="3.5" /><path d="M16.5 4.3a3.5 3.5 0 0 1 0 6.4M21 20v-1.4a4 4 0 0 0-3-3.8" /></svg>;
  }
  if (/business|enterprise|scale|company/.test(k)) {
    return <svg {...S}><path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M14 21V11h4a2 2 0 0 1 2 2v8M3 21h18M7.5 8h3M7.5 12h3M7.5 16h3" /></svg>;
  }
  if (/pro|plus|premium|advanced/.test(k)) {
    return <svg {...S}><path d="M13 2.5 4.5 13.8H11l-1 7.7 8.5-11.3H12l1-7.7z" /></svg>;
  }
  return <svg {...S}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" /></svg>;
}

export function PlanMark({ plan, tint }: { plan: string; tint: string }) {
  return (
    <span
      className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-sm"
      style={{ background: `${tint}18`, color: tint }}
    >
      <PlanGlyph plan={plan} />
    </span>
  );
}

/* ============================================================ lifecycle */

const FUNNEL_GLYPHS: Record<string, React.ReactElement> = {
  "Signed up": <svg {...S}><circle cx="9.5" cy="8" r="4" /><path d="M2.5 20a7 7 0 0 1 14 0M18 8v6M21 11h-6" /></svg>,
  "Converted to paid": <svg {...S}><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19M6.5 14.5h3" /></svg>,
  "Still active": <svg {...S}><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.7 2.7L16 9.7" /></svg>,
  "Retained 90+ days": <svg {...S}><path d="M12 3l7.5 3v5.6c0 4.6-3.1 8.2-7.5 9.4-4.4-1.2-7.5-4.8-7.5-9.4V6L12 3z" /><path d="M9 12.2l2.2 2.2 4-4.2" /></svg>,
};

export function FunnelMark({ label, tint }: { label: string; tint: string }) {
  const glyph = FUNNEL_GLYPHS[label];
  if (!glyph) return null;
  return (
    <span
      className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-sm"
      style={{ background: `${tint}18`, color: tint }}
    >
      {glyph}
    </span>
  );
}
