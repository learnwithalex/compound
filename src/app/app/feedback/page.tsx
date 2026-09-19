"use client";
import { useState } from "react";

type Category = "bug" | "feature" | "other";

const CATEGORIES: { value: Category; label: string; desc: string }[] = [
  { value: "bug",     label: "Bug report",      desc: "Something isn't working" },
  { value: "feature", label: "Feature request",  desc: "An idea or improvement" },
  { value: "other",   label: "General feedback", desc: "Anything else" },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState<Category>("feature");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, message }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-10">
        <div className="rounded-xl border border-[#ebebeb] bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#eff0fb]">
            <svg className="h-5 w-5 text-[#5e6ad2]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-[16px] font-semibold text-[#111111]">Thanks for your feedback!</h2>
          <p className="mt-1.5 text-[13px] text-[#6b6b6b]">We read every submission and use it to improve Compound.</p>
          <button
            onClick={() => { setMessage(""); setState("idle"); }}
            className="mt-5 text-[13px] font-medium text-[#5e6ad2] hover:opacity-80"
          >
            Send another →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10">
      <h1 className="text-[22px] font-bold tracking-tight text-[#111111]" style={{ letterSpacing: "-0.025em" }}>
        Feedback
      </h1>
      <p className="mt-1 text-[14px] text-[#6b6b6b]">Tell us what&apos;s working, what&apos;s broken, or what you wish existed.</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {/* Category */}
        <div>
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-[#a0a0a0]">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  category === value
                    ? "border-[#5e6ad2] bg-[#eff0fb]"
                    : "border-[#ebebeb] bg-white hover:border-[#d0d0d0]"
                }`}
              >
                <p className={`text-[12px] font-semibold ${category === value ? "text-[#5e6ad2]" : "text-[#111111]"}`}>
                  {label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#a0a0a0]">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-[#a0a0a0]">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            placeholder={
              category === "bug"
                ? "Describe what happened and what you expected…"
                : category === "feature"
                ? "Describe the feature and the problem it would solve…"
                : "Share whatever is on your mind…"
            }
            className="w-full resize-none rounded-lg border border-[#dddad5] bg-white px-4 py-3 text-[13px] text-[#1a1a1a] placeholder:text-[#c0bdb8] focus:border-[#5e6ad2] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/20"
          />
        </div>

        {state === "error" && (
          <p className="text-[12px] text-[#e3493c]">Something went wrong — please try again or email support@usecompound.xyz.</p>
        )}

        <button
          type="submit"
          disabled={state === "sending" || !message.trim()}
          className="rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
          style={{ background: "#5e6ad2" }}
        >
          {state === "sending" ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </div>
  );
}
