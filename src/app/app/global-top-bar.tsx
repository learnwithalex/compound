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
        <button className="text-[#8a8a8a] transition-colors hover:text-[#5c5c5c]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.05 1.05M11.85 11.85l1.05 1.05M12.9 3.1l-1.05 1.05M4.15 11.85l-1.05 1.05"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
