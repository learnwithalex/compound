import { db } from "@/db";
import { persistPull, monthlyCents, type ProviderPull, type NormalizedCustomer, type NormalizedSubscription } from "./sync-core";

const BASE = "https://api.gumroad.com/v2";

async function gumroadGet<T>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gumroad ${path}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

interface GumroadProduct {
  id: string;
  name: string;
}

interface GumroadSubscriber {
  id: string;
  product_id: string;
  product_name: string;
  user_email: string;
  created_at: string;
  recurrence: string | null;
  cancelled_at: string | null;
  ended_at: string | null;
  failed_at: string | null;
  free_trial_ends_at: string | null;
  status: string;
  // price in cents — comes from purchase, not always present here
  price?: number;
  purchase_ids?: string[];
}

// Alive and pending-cancel still bill this period; pending_failure still alive
const ACTIVE_STATUSES = new Set(["alive", "pending_cancellation", "pending_failure"]);

function gumroadMrr(priceCents: number, recurrence: string | null): number {
  switch ((recurrence ?? "monthly").toLowerCase()) {
    case "yearly":      return Math.round(priceCents / 12);
    case "biannually":  return Math.round(priceCents / 6);
    case "quarterly":   return Math.round(priceCents / 3);
    default:            return priceCents; // monthly
  }
}

function normalizeStatus(s: string): string {
  if (ACTIVE_STATUSES.has(s)) return "active";
  return "canceled";
}

export async function syncGumroadConnection(connectionId: string) {
  const conn = await db.query.connections.findFirst({
    where: (c, { eq }) => eq(c.id, connectionId),
  });
  if (!conn || conn.provider !== "gumroad") return;

  const token = conn.apiKey;

  // 1. Fetch all products
  const productsResp = await gumroadGet<{ products: GumroadProduct[] }>("/products", token);
  const products = productsResp.products ?? [];

  const custMap = new Map<string, NormalizedCustomer>();
  const allSubs: NormalizedSubscription[] = [];

  // 2. For each product, paginate through subscribers
  for (const product of products) {
    let pageKey: string | undefined;

    do {
      const params: Record<string, string> = { paginated: "true" };
      if (pageKey) params.page_key = pageKey;

      const resp = await gumroadGet<{
        subscribers: GumroadSubscriber[];
        next_page_key: string | null;
      }>(`/products/${product.id}/subscribers`, token, params);

      const subs = resp.subscribers ?? [];

      for (const sub of subs) {
        // Build customer
        if (sub.user_email && !custMap.has(sub.user_email)) {
          custMap.set(sub.user_email, {
            externalId: sub.user_email,
            email: sub.user_email,
            signedUpAt: sub.created_at ? new Date(sub.created_at) : null,
          });
        }

        const isActive = ACTIVE_STATUSES.has(sub.status);
        const priceCents = sub.price ?? 0;
        const mrrCents = isActive ? gumroadMrr(priceCents, sub.recurrence) : 0;

        const canceledAt = sub.cancelled_at ?? sub.ended_at ?? sub.failed_at ?? null;

        allSubs.push({
          externalId: sub.id,
          customerExternalId: sub.user_email ?? null,
          planName: sub.product_name ?? product.name ?? null,
          status: normalizeStatus(sub.status),
          mrrCents,
          currency: "usd",
          interval: sub.recurrence ?? "monthly",
          quantity: 1,
          startedAt: sub.created_at ? new Date(sub.created_at) : null,
          trialEndAt: sub.free_trial_ends_at ? new Date(sub.free_trial_ends_at) : null,
          canceledAt: canceledAt ? new Date(canceledAt) : null,
        });
      }

      pageKey = resp.next_page_key ?? undefined;
    } while (pageKey);
  }

  const pull: ProviderPull = {
    customers: Array.from(custMap.values()),
    subscriptions: allSubs,
  };

  return persistPull(connectionId, pull);
}
