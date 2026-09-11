"use client";
import { useState } from "react";
import { CompoundMark } from "../compound-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
    if (data.devUrl) { window.location.href = data.devUrl; return; }
    setState("sent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1ec] px-4">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <CompoundMark size={44} theme="light" />
          <div>
            <div className="text-[18px] font-bold tracking-tight text-[#1a1a1a]" style={{ letterSpacing: "-0.025em" }}>compound</div>
            <div className="text-[13px] text-[#9c9894]">Revenue OS for indie hackers</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-white px-6 py-6" style={{ border: "1px solid #ddd9d0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {state === "sent" ? (
            <div className="text-center">
              <div className="mb-2 text-[15px] font-semibold text-[#1a1a1a]">Check your email</div>
              <p className="text-[13px] text-[#5c5856]">Magic link sent to <strong className="text-[#1a1a1a]">{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9c9894]">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg px-3 py-2.5 text-[14px] text-[#1a1a1a] placeholder:text-[#c8c4bc] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/30"
                  style={{ background: "#f7f5f1", border: "1px solid #ddd9d0" }}
                />
              </div>
              <button
                type="submit"
                disabled={state === "sending"}
                className="rounded-lg py-2.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "#5e6ad2" }}
              >
                {state === "sending" ? "Sending…" : "Continue with email"}
              </button>
              {state === "error" && <p className="text-center text-[12px] text-[#e3493c]">Something went wrong. Try again.</p>}
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <a href="/api/auth/demo" className="text-[12px] text-[#5e6ad2] hover:opacity-80">
            Open demo →
          </a>
        </div>
      </div>
    </div>
  );
}
