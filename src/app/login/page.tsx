"use client";
import { useState } from "react";
import { CompoundWordmark } from "../compound-logo";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-8">
      <div className="w-full max-w-[380px]">

        {/* Logo row */}
        <div className="mb-10 flex items-center justify-between">
          <CompoundWordmark theme="light" height={20} />
          <a
            href="/api/auth/demo"
            className="rounded-full px-4 py-1.5 text-[13px] font-medium text-[#3d3d3d] hover:bg-[#f5f5f4]"
            style={{ border: "1px solid #dddad5" }}
          >
            Try demo
          </a>
        </div>

        {state === "sent" ? (
          <div>
            <h1 className="text-[26px] font-bold leading-[1.2] text-[#1a1a1a]" style={{ letterSpacing: "-0.025em" }}>
              Check your inbox.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6b6b6b]">
              Magic link sent to <span className="font-semibold text-[#1a1a1a]">{email}</span>. Click it to sign in.
            </p>
            <button onClick={() => setState("idle")} className="mt-5 text-[13px] font-medium text-[#5e6ad2] hover:opacity-80">
              ← Use a different email
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-[26px] font-bold leading-[1.2] text-[#1a1a1a]" style={{ letterSpacing: "-0.025em" }}>
              Welcome back.<br />Sign in to compound.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6b6b6b]">
              Track your MRR, view AI briefings, and keep your whole portfolio in one place.
            </p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#1a1a1a]">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-[14px] text-[#1a1a1a] placeholder:text-[#c0bdb8] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/25"
                  style={{ border: "1px solid #dddad5" }}
                />
              </div>

              <button
                type="submit"
                disabled={state === "sending"}
                className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "#5e6ad2" }}
              >
                {state === "sending" ? "Sending…" : "Continue with email"}
              </button>

              {state === "error" && (
                <p className="text-[12px] text-[#e3493c]">Something went wrong. Try again.</p>
              )}
            </form>

            <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f0ede8" }}>
              <p className="text-[12px] leading-relaxed text-[#b0aba3]">
                By signing in, you agree to compound&apos;s{" "}
                <a href="#" className="underline underline-offset-2 hover:text-[#6b6b6b]">Terms</a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2 hover:text-[#6b6b6b]">Privacy Policy</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
