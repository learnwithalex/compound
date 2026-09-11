import { redirect } from "next/navigation";
import { userIdFromSession } from "@/lib/session";
import { primaryOrgForUser } from "@/db/seed-org";
import { db } from "@/db";
import { profitAndLoss, balanceSheet, fmtCents } from "@/lib/statements";
import { RunAgentButton } from "./run-agent-button";

export default async function AppPage() {
  const userId = await userIdFromSession();
  if (!userId) redirect("/login");
  const org = await primaryOrgForUser(userId);
  if (!org) redirect("/login?error=noorg");

  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth() + 1;

  const [actionableRows, currentPl] = await Promise.all([
    db.query.sourceTransactions.findMany({
      where: (t, { and, eq, inArray }) =>
        and(eq(t.orgId, org.id), inArray(t.status, ["PENDING", "CATEGORISED"])),
      orderBy: (t, { desc }) => [desc(t.occurredAt)],
      columns: { id: true, status: true, merchant: true, description: true, amountCents: true, occurredAt: true },
      limit: 10,
    }),
    profitAndLoss(org.id, year, month),
  ]);

  let pl = currentPl;
  let isCurrentMonth = true;
  if (pl.revenue.length === 0 && pl.expenses.length === 0) {
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    const prevPl = await profitAndLoss(org.id, py, pm);
    if (prevPl.revenue.length > 0 || prevPl.expenses.length > 0) {
      pl = prevPl; year = py; month = pm; isCurrentMonth = false;
    }
  }

  const asOf = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const bs = await balanceSheet(org.id, asOf);
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const cashCents = bs.assets.find((a) => a.code === "1000")?.balanceCents ?? 0;

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-lx-faint">Overview</div>
          <h1 className="mt-1 text-[20px] font-semibold tracking-tight text-lx-text">
            {monthName} {year}
          </h1>
          {!isCurrentMonth && (
            <p className="mt-0.5 text-[12px] text-lx-faint">
              Last closed month · {actionableRows.length} pending this month
            </p>
          )}
        </div>
        <div className="mt-1">
          <RunAgentButton />
        </div>
      </div>

      {/* Metrics strip */}
      <div
        className="mb-6 grid grid-cols-4 divide-x divide-lx-border overflow-hidden rounded-md border border-lx-border"
        style={{ background: "#1c1c22" }}
      >
        <Metric label="Revenue" value={fmtCents(pl.totalRevenueCents)} color="text-lx-green" />
        <Metric label="Expenses" value={fmtCents(pl.totalExpenseCents)} color="text-lx-red" />
        <Metric
          label="Net income"
          value={fmtCents(pl.netIncomeCents)}
          color={pl.netIncomeCents >= 0 ? "text-lx-green" : "text-lx-red"}
        />
        <Metric label="Cash" value={fmtCents(cashCents)} color="text-lx-text" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* P&L */}
        <div className="rounded-md border border-lx-border" style={{ background: "#1c1c22" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #2a2a32" }}>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lx-faint">
              Profit &amp; Loss — {monthName} {year}
            </span>
          </div>

          {pl.revenue.length === 0 && pl.expenses.length === 0 ? (
            <div className="px-4 py-8 text-[13px] text-lx-muted">
              No transactions posted.{" "}
              {actionableRows.length > 0
                ? `${actionableRows.length} ready — click Run bookkeeper.`
                : "Connect a source to import transactions."}
            </div>
          ) : (
            <div className="px-4 py-3">
              <GroupLabel>Revenue</GroupLabel>
              {pl.revenue.map((l) => (
                <PLRow key={l.code} code={l.code} name={l.name} value={l.totalCents} type="revenue" />
              ))}
              {pl.expenses.length > 0 && (
                <>
                  <div className="my-3" style={{ borderTop: "1px solid #2a2a32" }} />
                  <GroupLabel>Expenses</GroupLabel>
                  {pl.expenses.map((l) => (
                    <PLRow key={l.code} code={l.code} name={l.name} value={l.totalCents} type="expense" />
                  ))}
                </>
              )}
              <div className="mt-4 flex items-baseline justify-between pt-3" style={{ borderTop: "1px solid #2a2a32" }}>
                <span className="text-[13px] font-semibold text-lx-text">Net income</span>
                <span
                  className={`font-mono text-[13px] font-semibold tabular-nums ${
                    pl.netIncomeCents >= 0 ? "text-lx-green" : "text-lx-red"
                  }`}
                >
                  {fmtCents(pl.netIncomeCents)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pending panel */}
        <div className="rounded-md border border-lx-border" style={{ background: "#1c1c22" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #2a2a32" }}>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lx-faint">Pending</span>
            {actionableRows.length > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(94,106,210,0.15)", color: "#5e6ad2" }}
              >
                {actionableRows.length}
              </span>
            )}
          </div>

          {actionableRows.length === 0 ? (
            <div className="px-4 py-6 text-[12px] text-lx-faint">All clear.</div>
          ) : (
            <div>
              {actionableRows.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-4 py-2 text-[12px]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <StatusCircle status={t.status} size={12} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-lx-text">
                      {t.merchant ?? t.description ?? "Unknown"}
                    </div>
                    <div className="text-[10px] text-lx-faint">
                      {t.occurredAt instanceof Date
                        ? t.occurredAt.toISOString().slice(5, 10)
                        : String(t.occurredAt).slice(5, 10)}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 font-mono tabular-nums ${
                      Number(t.amountCents) >= 0 ? "text-lx-green" : "text-lx-muted"
                    }`}
                  >
                    {Number(t.amountCents) >= 0 ? "+" : ""}
                    {(Math.abs(Number(t.amountCents)) / 100).toFixed(0)}
                  </span>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <a href="/app/transactions" className="text-[11px] text-lx-purple hover:opacity-80">
                  View all →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-widest text-lx-faint">{label}</div>
      <div className={`text-[17px] font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 mt-1 text-[10px] font-semibold uppercase tracking-widest text-lx-faint">
      {children}
    </div>
  );
}

function PLRow({ code, name, value, type }: { code: string; name: string; value: number; type: "revenue" | "expense" }) {
  const isExpense = type === "expense";
  return (
    <div className="flex items-baseline justify-between py-[4px]">
      <span className="text-[12px] text-lx-muted">
        <span className="font-mono text-lx-faint">{code}</span>
        <span className="ml-2">{name}</span>
      </span>
      <span className={`font-mono text-[12px] tabular-nums ${isExpense ? "text-lx-red" : "text-lx-green"}`}>
        {isExpense ? `(${fmtCents(value)})` : fmtCents(value)}
      </span>
    </div>
  );
}

function StatusCircle({ status, size = 14 }: { status: string; size?: number }) {
  if (status === "PENDING") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke="#4a4a5a" strokeWidth="1.5" strokeDasharray="3.5 2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "CATEGORISED") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke="#f2b030" strokeWidth="1.5" />
        <path d="M7 1.5 A5.5 5.5 0 0 1 7 12.5 Z" fill="#f2b030" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#5e6ad2" />
      <path d="M4 7.5L6 9.5 10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
