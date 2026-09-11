// Double-entry posting. Every economic event becomes an Entry with ≥2
// balanced EntryLines. Balance is enforced HERE, at the single insert site,
// so no caller can write an unbalanced entry.

import { eq } from "drizzle-orm";
import { db, accounts, entries, entryLines, sourceTransactions } from "@/db";

export interface PostingLine {
  accountCode: string;
  debitCents?: number;
  creditCents?: number;
}

export async function postEntry(opts: {
  orgId: string;
  occurredAt: Date;
  memo?: string;
  createdBy: string;
  lines: PostingLine[];
  sourceTxnId?: string;
  periodId?: string | null;
}): Promise<string> {
  if (opts.lines.length < 2) throw new Error("entry needs ≥2 lines");

  let debits = 0;
  let credits = 0;
  for (const l of opts.lines) {
    if ((l.debitCents ?? 0) < 0 || (l.creditCents ?? 0) < 0) {
      throw new Error("negative line amounts are not allowed");
    }
    if ((l.debitCents ?? 0) > 0 && (l.creditCents ?? 0) > 0) {
      throw new Error("a line cannot be both debit and credit");
    }
    debits += l.debitCents ?? 0;
    credits += l.creditCents ?? 0;
  }
  if (debits !== credits) throw new Error(`unbalanced entry: debit ${debits} != credit ${credits}`);
  if (debits === 0) throw new Error("zero-amount entry");

  const orgAccounts = await db.query.accounts.findMany({
    where: (a, { eq }) => eq(a.orgId, opts.orgId),
    columns: { id: true, code: true },
  });
  const byCode = new Map(orgAccounts.map((a) => [a.code, a.id]));
  for (const l of opts.lines) {
    if (!byCode.has(l.accountCode)) throw new Error(`unknown account code: ${l.accountCode}`);
  }

  return db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(entries)
      .values({
        orgId: opts.orgId,
        occurredAt: opts.occurredAt,
        memo: opts.memo,
        createdBy: opts.createdBy,
        periodId: opts.periodId ?? null,
      })
      .returning();

    await tx.insert(entryLines).values(
      opts.lines.map((l) => ({
        entryId: entry.id,
        accountId: byCode.get(l.accountCode)!,
        debitCents: l.debitCents ?? 0,
        creditCents: l.creditCents ?? 0,
      })),
    );

    if (opts.sourceTxnId) {
      await tx
        .update(sourceTransactions)
        .set({ status: "POSTED", entryId: entry.id, updatedAt: new Date() })
        .where(eq(sourceTransactions.id, opts.sourceTxnId));
    }

    return entry.id;
  });
}

// Post a categorised source txn to the ledger.
//
// Conventions (v1):
//   - Stripe balance txn (charge, money IN): debit 1100 Stripe Clearing,
//     credit 4000 Revenue — Subscriptions. (Payout to bank is a transfer
//     1100 → 1000; revenue is recognised at charge time, once.)
//   - Stripe fee rows inside `raw.fee`: debit 5710, credit 1100.
//   - Bank money OUT (amount < 0): debit <category>, credit 1000.
//   - Bank money IN that is NOT a Stripe payout: debit 1000, credit
//     <category> (usually 4200 Other or 1200 AR settlement).
//   - Stripe payout arrival (po_*): debit 1000, credit 1100 (transfer).
export async function postCategorisedTxn(
  orgId: string,
  sourceTxnId: string,
  accountCode: string,
  createdBy: string,
): Promise<string> {
  const txn = await db.query.sourceTransactions.findFirst({
    where: (t, { eq }) => eq(t.id, sourceTxnId),
  });
  if (!txn) throw new Error("source txn not found");
  if (txn.status === "POSTED") throw new Error("already posted");
  if (txn.orgId !== orgId) throw new Error("org mismatch");

  const cents = Number(txn.amountCents);
  const abs = Math.abs(cents);
  const raw = txn.raw as Record<string, unknown>;
  const stripeType = raw.stripeType as string | undefined;

  // Stripe payout arrival: pure transfer, no P&L touch.
  if (txn.externalId.startsWith("po_")) {
    return postEntry({
      orgId,
      occurredAt: txn.occurredAt,
      memo: txn.description ?? "Stripe payout",
      createdBy,
      lines: [
        { accountCode: "1000", debitCents: abs },
        { accountCode: "1100", creditCents: abs },
      ],
      sourceTxnId: txn.id,
    });
  }

  // Stripe charge (net, money in): recognise revenue at charge time.
  if (txn.externalId.startsWith("bt_") && cents >= 0) {
    const fee = Number(raw.fee ?? 0);
    const gross = Number(raw.gross ?? cents);
    const lines: PostingLine[] = [
      { accountCode: "1100", debitCents: gross },
      { accountCode: accountCode, creditCents: gross },
    ];
    if (fee > 0) {
      lines.push({ accountCode: "5710", debitCents: fee });
      lines.push({ accountCode: "1100", creditCents: fee });
    }
    return postEntry({
      orgId,
      occurredAt: txn.occurredAt,
      memo: txn.description ?? "Stripe charge",
      createdBy,
      lines,
      sourceTxnId: txn.id,
    });
  }

  // Bank money out: expense/asset debit, cash credit.
  if (cents < 0) {
    return postEntry({
      orgId,
      occurredAt: txn.occurredAt,
      memo: txn.description ?? txn.merchant ?? "Bank expense",
      createdBy,
      lines: [
        { accountCode, debitCents: abs },
        { accountCode: "1000", creditCents: abs },
      ],
      sourceTxnId: txn.id,
    });
  }

  // Bank money in (non-Stripe): cash debit, category credit.
  return postEntry({
    orgId,
    occurredAt: txn.occurredAt,
    memo: txn.description ?? txn.merchant ?? "Bank deposit",
    createdBy,
    lines: [
      { accountCode: "1000", debitCents: abs },
      { accountCode, creditCents: abs },
    ],
    sourceTxnId: txn.id,
  });
}
