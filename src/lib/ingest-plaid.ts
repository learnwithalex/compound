// Plaid ingestion: /transactions/sync with cursor pagination.
// Idempotent on (connectionId, externalId). Stores raw Plaid payloads for
// reprocessing; categorisation + posting happen downstream.

import { eq } from "drizzle-orm";
import { db, sourceConnections, sourceTransactions } from "@/db";
import { decryptToken, plaidClient, plaidToCents } from "./plaid";

interface SyncResult {
  added: number;
  modified: number;
  removed: number;
}

export async function syncPlaidConnection(
  orgId: string,
  connectionId: string | null,
  itemId: string,
): Promise<SyncResult> {
  let connection = connectionId
    ? await db.query.sourceConnections.findFirst({
        where: (c, { eq }) => eq(c.id, connectionId),
      })
    : await db.query.sourceConnections.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.orgId, orgId), eq(c.kind, "PLAID"), eq(c.externalId, itemId)),
      });

  if (!connection) throw new Error("plaid connection not found");
  const plaid = plaidClient();
  const accessToken = decryptToken(connection.accessToken);

  let cursor: string | undefined = connection.cursor ?? undefined;
  let hasMore = true;
  let added = 0;
  let modified = 0;
  let removed = 0;

  while (hasMore) {
    const { data } = await plaid.transactionsSync({
      access_token: accessToken,
      cursor,
      count: 100,
    });

    for (const t of data.added) {
      await db
        .insert(sourceTransactions)
        .values({
          orgId,
          connectionId: connection.id,
          externalId: t.transaction_id,
          occurredAt: new Date(t.date + "T12:00:00Z"),
          amountCents: plaidToCents(t.amount),
          currency: t.iso_currency_code ?? t.unofficial_currency_code ?? "USD",
          merchant: t.merchant_name ?? t.name,
          description: t.name,
          raw: t as unknown as Record<string, unknown>,
        })
        .onConflictDoNothing();
      added++;
    }

    for (const t of data.modified) {
      await db
        .update(sourceTransactions)
        .set({
          occurredAt: new Date(t.date + "T12:00:00Z"),
          amountCents: plaidToCents(t.amount),
          merchant: t.merchant_name ?? t.name,
          description: t.name,
          raw: t as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(sourceTransactions.externalId, t.transaction_id));
      modified++;
    }

    for (const id of data.removed.map((r) => r.transaction_id)) {
      await db
        .update(sourceTransactions)
        .set({ status: "IGNORED", ignoredReason: "removed at source", updatedAt: new Date() })
        .where(eq(sourceTransactions.externalId, id));
      removed++;
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  await db
    .update(sourceConnections)
    .set({ cursor, lastSyncedAt: new Date() })
    .where(eq(sourceConnections.id, connection.id));

  return { added, modified, removed };
}
