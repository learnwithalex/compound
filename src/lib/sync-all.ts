import { db } from "@/db";
import { syncConnection } from "@/lib/stripe";
import { syncLemonSqueezyConnection } from "@/lib/lemonsqueezy";
import { syncPolarConnection } from "@/lib/polar";
import { syncDodoConnection } from "@/lib/dodopayments";
import { syncPaystackConnection } from "@/lib/paystack";

function syncAny(connectionId: string, provider: string) {
  if (provider === "lemonsqueezy") return syncLemonSqueezyConnection(connectionId);
  if (provider === "polar") return syncPolarConnection(connectionId);
  if (provider === "dodopayments") return syncDodoConnection(connectionId);
  if (provider === "paystack") return syncPaystackConnection(connectionId);
  return syncConnection(connectionId);
}

export async function syncAll() {
  const conns = await db.query.connections.findMany();
  await Promise.allSettled(conns.map((c) => syncAny(c.id, c.provider)));
}
