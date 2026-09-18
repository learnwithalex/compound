export function GlobalTopBar() {
  return (
    <div
      className="flex h-[40px] w-full shrink-0 items-center gap-3 px-4 md:px-16 lg:px-40"
      style={{ borderBottom: "1px solid #ebebeb", background: "#ffffff" }}
    >
      {/* Search */}
      <div className="flex flex-1 items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#b0b0b0" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <span className="text-[12.5px] text-[#c0c0c0]">Search workspace or use cmd + k</span>
      </div>

      {/* Right icons */}
      <div className="flex shrink-0 items-center gap-3">
        <button className="flex items-center gap-1.5 text-[12px] text-[#8a8a8a] transition-colors hover:text-[#5c5c5c]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"/>
            <path d="M8 6v3"/>
            <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
          </svg>
          Help
        </button>
        <button className="flex items-center gap-1.5 text-[12px] text-[#8a8a8a] transition-colors hover:text-[#5c5c5c]">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7A6 6 0 0 1 2.11 10.26L1 15l4.74-1.11A6 6 0 1 1 13 7z"/>
          </svg>
          Feedback
        </button>
        <a
          href="/app/billing"
          className="flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-semibold transition-colors"
          style={{ background: "rgba(94,106,210,0.10)", color: "#5e6ad2", border: "1px solid rgba(94,106,210,0.2)" }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0l1.2 4.8L12 6l-4.8 1.2L6 12 4.8 7.2 0 6l4.8-1.2z" />
          </svg>
          Upgrade
        </a>
      </div>
    </div>
  );
}
