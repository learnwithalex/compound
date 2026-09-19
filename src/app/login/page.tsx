"use client";
import { useState } from "react";
import { CompoundWordmark } from "../compound-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [googleLoading, setGoogleLoading] = useState(false);

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

  function handleGoogle() {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-8">
      <div className="w-full max-w-[380px]">

        {/* Logo row */}
        <div className="mb-10 flex items-center justify-between">
          <CompoundWordmark theme="light" height={20} />
          <button
            onClick={() => { window.location.href = "/api/auth/demo"; }}
            className="rounded-full px-4 py-1.5 text-[13px] font-medium text-[#3d3d3d] hover:bg-[#f5f5f4]"
            style={{ border: "1px solid #dddad5" }}
          >
            Try demo
          </button>
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

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-lg bg-white py-2.5 text-[14px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f5f4] disabled:opacity-60"
              style={{ border: "1px solid #dddad5" }}
            >
              {googleLoading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin">
                  <circle cx="12" cy="12" r="10" stroke="#dddad5" strokeWidth="2.5" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <div className="relative my-2 flex items-center gap-3">
              <div className="flex-1" style={{ borderTop: "1px solid #f0ede8" }} />
              <span className="text-[11px] font-medium text-[#c0bdb8]">OR</span>
              <div className="flex-1" style={{ borderTop: "1px solid #f0ede8" }} />
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
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
                <a href="/terms" className="underline underline-offset-2 hover:text-[#6b6b6b]">Terms</a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-[#6b6b6b]">Privacy Policy</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
