import { type NextRequest } from "next/server";
import { db } from "@/db";
import { userIdFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await userIdFromSession();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const conns = await db.query.connections.findMany({
    where: (c, { eq }) => eq(c.userId, userId),
    columns: { id: true, label: true, provider: true },
  });
  const connIds = conns.map((c) => c.id);
  const connMap = new Map(conns.map((c) => [c.id, c]));

  if (connIds.length === 0) return csv("email,name,country,product,plan,status,mrr,since\n");

  const subs = await db.query.subscriptions.findMany({
    where: (s, { inArray }) => inArray(s.connectionId, connIds),
  });
  const custIds = [...new Set(subs.map((s) => s.customerId).filter((x): x is string => !!x))];
  const custs = custIds.length
    ? await db.query.customers.findMany({ where: (c, { inArray }) => inArray(c.id, custIds) })
    : [];
  const custMap = new Map(custs.map((c) => [c.id, c]));

  const rows = ["email,name,country,product,provider,plan,status,mrr_usd,started_at,canceled_at"];
  for (const s of subs) {
    const cust = s.customerId ? custMap.get(s.customerId) : undefined;
    const conn = connMap.get(s.connectionId)!;
    rows.push([
      q(cust?.email ?? ""),
      q(cust?.name ?? ""),
      q(cust?.country ?? ""),
      q(conn.label),
      q(conn.provider),
      q(s.planName ?? ""),
      q(s.status),
      ((s.mrrCents ?? 0) / 100).toFixed(2),
      s.startedAt ? s.startedAt.toISOString().slice(0, 10) : "",
      s.canceledAt ? s.canceledAt.toISOString().slice(0, 10) : "",
    ].join(","));
  }

  return csv(rows.join("\n") + "\n");
}

function q(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function csv(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="compound-customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
