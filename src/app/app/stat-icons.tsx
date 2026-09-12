const P = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconMrr() {
  return (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2v9.6" />
      <path d="M14.6 9.9a2.4 2.4 0 0 0-2.6-1.4c-1.3 0-2.4.7-2.4 1.9s1 1.7 2.4 1.9 2.6.7 2.6 1.9-1.1 1.9-2.6 1.9a2.5 2.5 0 0 1-2.6-1.6" />
    </svg>
  );
}

export function IconArr() {
  return (
    <svg {...P}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconSubs() {
  return (
    <svg {...P}>
      <path d="M16 20v-1.4a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M16.5 4.3a3.5 3.5 0 0 1 0 6.4M21 20v-1.4a4 4 0 0 0-3-3.8" />
    </svg>
  );
}

export function IconTrend() {
  return (
    <svg {...P}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

export function IconArpa() {
  return (
    <svg {...P}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function IconLtv() {
  return (
    <svg {...P}>
      <path d="M12 20.3S4.4 15.6 4.4 10.4A3.9 3.9 0 0 1 12 8.3a3.9 3.9 0 0 1 7.6 2.1c0 5.2-7.6 9.9-7.6 9.9z" />
    </svg>
  );
}

export function IconChurn() {
  return (
    <svg {...P}>
      <circle cx="9.5" cy="8" r="4" />
      <path d="M2.5 20a7 7 0 0 1 14 0" />
      <path d="M17.5 11.5H22" />
    </svg>
  );
}

export function IconQuick() {
  return (
    <svg {...P}>
      <path d="M13 2.5 4.5 13.8H11l-1 7.7 8.5-11.3H12l1-7.7z" />
    </svg>
  );
}
