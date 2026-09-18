"use client";

export function AgentPillLink() {
  return (
    <a
      href="/onboard"
      className="group inline-flex items-center gap-2 text-[13px] text-[#5c5856] transition-colors hover:text-[#1a1a1a]"
    >
      <span className="flex items-center gap-1">
        <img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" alt="Claude" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} loading="eager" />
        <img src="https://www.google.com/s2/favicons?domain=cursor.com&sz=32" alt="Cursor" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} loading="eager" />
        <img src="https://www.google.com/s2/favicons?domain=windsurf.com&sz=32" alt="Windsurf" className="h-3.5 w-3.5 rounded-sm" width={14} height={14} loading="eager" />
      </span>
      <span className="underline decoration-[#c8c4bc] decoration-dotted underline-offset-4 group-hover:decoration-[#1a1a1a]">
        Prefer AI? Onboard your agent to Compound
      </span>
      <span className="text-[#ff5c00] transition-transform group-hover:translate-x-0.5">→</span>
    </a>
  );
}
