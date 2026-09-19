"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
};

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const go = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  const items: Item[] = [
    {
      id: "overview", label: "Overview", sublabel: "Dashboard home", keywords: "home dashboard",
      icon: <NavIcon d="M2 7l6-5 6 5v7.5H10.5v-4H5.5v4H2V7z" />,
      action: () => go("/app"),
    },
    {
      id: "analytics", label: "Analytics", sublabel: "Revenue trends & charts", keywords: "charts mrr arr revenue",
      icon: <NavIcon d="M1 12 5 7l4 2 6-6" />,
      action: () => go("/app/analytics"),
    },
    {
      id: "products", label: "Products", sublabel: "All connected products", keywords: "products apps saas",
      icon: <NavIcon d="M1.5 1.5h5.5v5.5H1.5zM9 1.5h5.5v5.5H9zM1.5 9h5.5v5.5H1.5zM9 9h5.5v5.5H9z" />,
      action: () => go("/app/products"),
    },
    {
      id: "connect", label: "Connect", sublabel: "Add a payment provider", keywords: "stripe lemonsqueezy polar connect api key",
      icon: <NavIcon d="M6.5 9.5a3.5 3.5 0 0 0 4.95 0l2-2a3.5 3.5 0 0 0-4.95-4.95l-1 1M9.5 6.5a3.5 3.5 0 0 0-4.95 0l-2 2a3.5 3.5 0 0 0 4.95 4.95l1-1" />,
      action: () => go("/app/connect"),
    },
    {
      id: "agents", label: "Agents", sublabel: "AI agent tokens", keywords: "claude cursor agents api token",
      icon: <NavIcon d="M3 3h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM5.5 13.5h5" />,
      action: () => go("/app/agents"),
    },
    {
      id: "settings", label: "Settings", sublabel: "Account & notifications", keywords: "settings profile notifications digest",
      icon: <NavIcon d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.05 1.05M11.85 11.85l1.05 1.05M12.9 3.1l-1.05 1.05M4.15 11.85l-1.05 1.05" />,
      action: () => go("/app/settings"),
    },
    {
      id: "billing", label: "Billing", sublabel: "Subscription & plan", keywords: "billing subscription plan upgrade",
      icon: <NavIcon d="M1.5 4h13v9H1.5zM1.5 7h13M5 11h2" />,
      action: () => go("/app/billing"),
    },
    {
      id: "help", label: "Help", sublabel: "FAQ & documentation", keywords: "help faq docs support",
      icon: <NavIcon d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM8 6v3" />,
      action: () => go("/app/help"),
    },
    {
      id: "feedback", label: "Feedback", sublabel: "Send a bug report or idea", keywords: "feedback bug feature request",
      icon: <NavIcon d="M13 7A6 6 0 0 1 2.11 10.26L1 15l4.74-1.11A6 6 0 1 1 13 7z" />,
      action: () => go("/app/feedback"),
    },
  ];

  const filtered = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.sublabel?.toLowerCase().includes(q) ||
          item.keywords?.includes(q)
        );
      })
    : items;

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === "Enter") { filtered[cursor]?.action(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cursor, filtered, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-xl shadow-2xl"
        style={{ background: "#fff", border: "1px solid #e5e5e5" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#a0a0a0" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent text-[14px] text-[#111111] placeholder:text-[#b0b0b0] focus:outline-none"
          />
          <kbd className="hidden rounded px-1.5 py-0.5 text-[10px] font-medium text-[#a0a0a0] sm:block"
            style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-[#b0b0b0]">No results for &quot;{query}&quot;</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.id}
                onMouseEnter={() => setCursor(i)}
                onClick={item.action}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === cursor ? "bg-[#f3f4f6]" : "hover:bg-[#f9f9f9]"
                }`}
              >
                <span className={`shrink-0 ${i === cursor ? "text-[#5e6ad2]" : "text-[#a0a0a0]"}`}>
                  {item.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium text-[#111111]">{item.label}</span>
                  {item.sublabel && (
                    <span className="block text-[11px] text-[#a0a0a0]">{item.sublabel}</span>
                  )}
                </span>
                {i === cursor && (
                  <kbd className="rounded px-1.5 py-0.5 text-[10px] text-[#a0a0a0]"
                    style={{ background: "#f0f0f0", border: "1px solid #e0e0e0" }}>
                    ↵
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2" style={{ borderTop: "1px solid #f0f0f0" }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1 text-[11px] text-[#b0b0b0]">
              <kbd className="rounded px-1 py-0.5 text-[10px]"
                style={{ background: "#f5f5f5", border: "1px solid #e5e5e5" }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}
