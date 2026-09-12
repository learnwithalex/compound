/**
 * Deterministic memoji-style avatars, drawn server-side from a hash of the
 * customer name. Rendering locally rather than calling an avatar service keeps
 * customer names out of a third party and costs no extra requests.
 */

const SKIN = ["#f8dfc8", "#f2cba5", "#e3ab7f", "#c98d5e", "#a26a41", "#7a4a2b"];
const HAIR = ["#2b211c", "#433022", "#4a3728", "#8a5a2b", "#c4682b", "#d9b26a", "#6f6a66", "#1b1b1b"];
const BG: [string, string][] = [
  ["#ffd9a8", "#ffb0a0"],
  ["#c9dcff", "#a8bdf5"],
  ["#cdf0d8", "#9fdcc0"],
  ["#e6d4ff", "#c4b0f5"],
  ["#ffd6ec", "#f7aecd"],
  ["#fde9a9", "#f6c96b"],
  ["#c7efef", "#94d8dc"],
];
const LIP = "#a85b4a";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function Hair({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0:
      return <path d="M24 50a26 26 0 0 1 52 0h-6.5a19.5 19.5 0 0 0-39 0z" fill={color} />;
    case 1:
      return (
        <>
          <circle cx="50" cy="19" r="8.5" fill={color} />
          <path d="M24 50a26 26 0 0 1 52 0h-6.5a19.5 19.5 0 0 0-39 0z" fill={color} />
        </>
      );
    case 2:
      return (
        <>
          <rect x="22.5" y="44" width="8" height="30" rx="4" fill={color} />
          <rect x="69.5" y="44" width="8" height="30" rx="4" fill={color} />
          <path d="M24 50a26 26 0 0 1 52 0h-6.5a19.5 19.5 0 0 0-39 0z" fill={color} />
        </>
      );
    case 3:
      return (
        <>
          <circle cx="33" cy="34" r="11" fill={color} />
          <circle cx="50" cy="27" r="12" fill={color} />
          <circle cx="67" cy="34" r="11" fill={color} />
        </>
      );
    case 4:
      return null;
    default:
      return (
        <>
          <path d="M25 45a25 25 0 0 1 50 0z" fill={color} />
          <rect x="22" y="42" width="56" height="8" rx="4" fill={color} opacity="0.75" />
        </>
      );
  }
}

function Eyes({ style }: { style: number }) {
  if (style === 1) {
    return (
      <path
        d="M35.5 53.5q4.5-5.5 9 0M55.5 53.5q4.5-5.5 9 0"
        stroke="#3a2d26"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (style === 2) {
    return (
      <>
        <ellipse cx="40" cy="52" rx="4.4" ry="5" fill="#3a2d26" />
        <ellipse cx="60" cy="52" rx="4.4" ry="5" fill="#3a2d26" />
        <circle cx="41.6" cy="50.2" r="1.5" fill="#ffffff" />
        <circle cx="61.6" cy="50.2" r="1.5" fill="#ffffff" />
      </>
    );
  }
  return (
    <>
      <circle cx="40" cy="52" r="3.3" fill="#3a2d26" />
      <circle cx="60" cy="52" r="3.3" fill="#3a2d26" />
    </>
  );
}

function Mouth({ style }: { style: number }) {
  switch (style) {
    case 1:
      return <ellipse cx="50" cy="66" rx="5.2" ry="4.2" fill={LIP} />;
    case 2:
      return <path d="M44 65.5h12" stroke={LIP} strokeWidth="2.6" strokeLinecap="round" fill="none" />;
    case 3:
      return <path d="M40.5 62.5q9.5 9.5 19 0z" fill={LIP} />;
    default:
      return <path d="M42 64q8 6.5 16 0" stroke={LIP} strokeWidth="2.8" strokeLinecap="round" fill="none" />;
  }
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const h = hash(name || "?");
  // Unsigned shifts: `>>` is signed, and a hash above 2^31 would yield a
  // negative index and an undefined palette entry.
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >>> 3) % HAIR.length];
  const [c1, c2] = BG[(h >>> 7) % BG.length];
  const hairStyle = (h >>> 11) % 6;
  const eyeStyle = (h >>> 15) % 3;
  const mouthStyle = (h >>> 19) % 4;
  const glasses = (h >>> 23) % 5 === 0;
  const gid = `av${h.toString(36)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${gid})`} />
      <circle cx="24" cy="55" r="5.5" fill={skin} />
      <circle cx="76" cy="55" r="5.5" fill={skin} />
      <path d="M50 24c15 0 26 11 26 27s-11 31-26 31-26-15-26-31 11-27 26-27z" fill={skin} />
      <Hair style={hairStyle} color={hair} />
      <Eyes style={eyeStyle} />
      <Mouth style={mouthStyle} />
      {glasses && (
        <g stroke="#4a4744" strokeWidth="2" fill="none" opacity="0.85">
          <circle cx="40" cy="52" r="8.5" />
          <circle cx="60" cy="52" r="8.5" />
          <path d="M48.5 52h3" />
        </g>
      )}
    </svg>
  );
}
