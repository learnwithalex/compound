"use client";
import { useEffect, useState } from "react";

interface Goal {
  id: string;
  label: string;
  targetMrrCents: number;
  targetDate: string;
}

export function GoalsWidget({ currentMrrCents }: { currentMrrCents: number }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "", targetMrr: "", targetDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/goals").then((r) => r.json()).then((rows: Goal[]) => {
      if (Array.isArray(rows)) setGoals(rows);
    });
  }, []);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.targetMrr || !form.targetDate) return;
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: form.label || "MRR Goal",
        targetMrrCents: Math.round(parseFloat(form.targetMrr) * 100),
        targetDate: form.targetDate,
      }),
    });
    if (res.ok) {
      const goal: Goal = await res.json();
      setGoals((g) => [...g, goal].sort((a, b) => a.targetDate.localeCompare(b.targetDate)));
      setForm({ label: "", targetMrr: "", targetDate: "" });
      setAdding(false);
    }
    setSaving(false);
  }

  async function deleteGoal(id: string) {
    await fetch("/api/goals", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    setGoals((g) => g.filter((x) => x.id !== id));
  }

  const fmt = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="rounded-sm bg-white p-6" style={{ border: "1px solid #ebebeb" }}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lx-faint">MRR Goals</p>
        <button
          onClick={() => setAdding((a) => !a)}
          className="text-[11px] font-semibold text-[#5e6ad2] hover:opacity-70"
        >
          {adding ? "Cancel" : "+ Add goal"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addGoal} className="mb-4 space-y-2.5 rounded-sm p-3" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
          <input
            type="text"
            placeholder="Goal label (e.g. Ramen profitability)"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="w-full rounded-sm px-2.5 py-2 text-[12px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30"
            style={{ background: "#fff", border: "1px solid #e8e5e0" }}
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-lx-faint">$</span>
              <input
                type="number"
                placeholder="Target MRR"
                value={form.targetMrr}
                onChange={(e) => setForm((f) => ({ ...f, targetMrr: e.target.value }))}
                required
                min="1"
                className="w-full rounded-sm py-2 pl-6 pr-2.5 text-[12px] text-lx-text placeholder:text-[#c8c4bc] focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30"
                style={{ background: "#fff", border: "1px solid #e8e5e0" }}
              />
            </div>
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
              required
              className="flex-1 rounded-sm px-2.5 py-2 text-[12px] text-lx-text focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/30"
              style={{ background: "#fff", border: "1px solid #e8e5e0" }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-sm py-2 text-[12px] font-semibold text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: "#5e6ad2" }}
          >
            {saving ? "Saving…" : "Save goal"}
          </button>
        </form>
      )}

      {goals.length === 0 && !adding ? (
        <p className="text-[12px] text-lx-faint">No goals yet. Add one to track your progress.</p>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((currentMrrCents / g.targetMrrCents) * 100));
            const daysLeft = Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 864e5);
            const done = pct >= 100;
            const color = done ? "#0f9b6c" : pct > 60 ? "#5e6ad2" : "#f59e0b";
            return (
              <div key={g.id} className="group">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-lx-text">{g.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-lx-faint">
                      {done ? "✓ Reached!" : daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
                    </span>
                    <button onClick={() => deleteGoal(g.id)} className="text-[10px] text-lx-faint opacity-0 group-hover:opacity-100 hover:text-[#e3493c]">×</button>
                  </div>
                </div>
                <div className="mb-1 h-2 overflow-hidden rounded-full" style={{ background: "#f0ede8" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-lx-faint">{fmt(currentMrrCents)} of {fmt(g.targetMrrCents)}</span>
                  <span className="text-[11px] font-semibold" style={{ color }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
