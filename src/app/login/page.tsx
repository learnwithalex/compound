"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setState("error"); return; }
    if (data.devUrl) { setDevUrl(data.devUrl); window.location.href = data.devUrl; return; }
    setState("sent");
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#5e6ad2" }}>
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                <path d="M2 10V7a5 5 0 0 1 10 0v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="7" r="2" fill="white"/>
              </svg>
            </div>
          </div>
          <h1 className="text-[20px] font-semibold text-lx-text">Compound</h1>
          <p className="mt-1 text-[13px] text-lx-muted">Revenue OS for indie hackers</p>
        </div>

        {state === "sent" ? (
          <div className="rounded-md p-4 text-center text-[13px] text-lx-muted" style={{ border: "1px solid #2a2a32", background: "#1c1c22" }}>
            Check your email — magic link sent to <strong className="text-lx-text">{email}</strong>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded px-3 py-2.5 text-[13px] text-lx-text placeholder:text-lx-faint focus:outline-none focus:ring-1 focus:ring-lx-purple"
              style={{ background: "#1c1c22", border: "1px solid #2a2a32" }}
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded py-2.5 text-[13px] font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: "#5e6ad2" }}
            >
              {state === "sending" ? "Sending…" : "Continue with email"}
            </button>
            {state === "error" && <p className="text-center text-[12px] text-lx-red">Something went wrong. Try again.</p>}
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/api/auth/demo" className="text-[12px] text-lx-purple hover:opacity-80">
            Open demo →
          </a>
        </div>
      </div>
    </div>
  );
}
