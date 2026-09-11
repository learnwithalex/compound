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
    if (!res.ok) {
      setState("error");
      return;
    }
    const data = await res.json();
    setDevUrl(data.devUrl ?? null);
    setState("sent");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Sign in to Booked</h1>
      <p className="mb-8 text-sm text-neutral-600">
        No password. We email you a link that expires in 15 minutes.
      </p>

      <div className="mb-8 rounded border border-neutral-200 bg-neutral-50 p-4 text-sm">
        <p className="mb-2 font-medium text-neutral-800">Just here to explore?</p>
        <p className="mb-3 text-neutral-600">
          The demo account has 14 pre-loaded transactions already categorised.
        </p>
        <a
          href="/api/auth/demo"
          className="inline-block rounded bg-neutral-900 px-4 py-2 text-xs font-medium text-white"
        >
          Open demo →
        </a>
      </div>

      {state === "sent" ? (
        <div className="rounded border border-neutral-200 bg-white p-6 text-sm">
          <p className="mb-2 font-medium">Check your inbox.</p>
          <p className="text-neutral-600">
            A sign-in link is on its way to <span className="font-mono">{email}</span>.
          </p>
          {devUrl && (
            <p className="mt-4 rounded bg-neutral-100 p-3">
              Dev mode — no email configured.{" "}
              <a href={devUrl} className="underline underline-offset-2">
                Click here to sign in
              </a>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="rounded border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Email me a sign-in link"}
          </button>
          {state === "error" && (
            <p className="text-sm text-red-700">That email didn&apos;t look right. Try again.</p>
          )}
        </form>
      )}
    </main>
  );
}
