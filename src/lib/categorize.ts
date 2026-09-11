// Categorisation: rules first, Claude for the rest.
//
// Pipeline per PENDING source transaction:
//   1. Apply org rules (ordered by priority desc). First match wins with
//      confidence 100 — deterministic, free, explainable.
//   2. Otherwise call Claude with the chart of accounts + the transaction +
//      a few prior human-confirmed examples for calibration. Structured
//      output (tool use) pins the account code to the chart.
//   3. Learn: when the user corrects a categorisation in the review UI,
//      persist a rule so the same merchant never hits the LLM again.

import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db, rules, sourceTransactions, type Rule, type SourceTransaction } from "@/db";
import { CHART_OF_ACCOUNTS, CHART_CODES } from "@/db/chart";

export interface Categorisation {
  accountCode: string;
  confidence: number; // 0..100
  reasoning: string;
  viaRule: string | null; // rule id when deterministic
}

function matchRule(txn: SourceTransaction, rule: Rule): boolean {
  const haystack = (rule.field === "MERCHANT" ? txn.merchant : txn.description) ?? "";
  const p = rule.pattern;
  switch (rule.op) {
    case "EQUALS":
      return haystack.trim().toLowerCase() === p.trim().toLowerCase();
    case "CONTAINS":
      return haystack.toLowerCase().includes(p.toLowerCase());
    case "STARTS_WITH":
      return haystack.toLowerCase().startsWith(p.toLowerCase());
    case "REGEX":
      try {
        return new RegExp(p, "i").test(haystack);
      } catch {
        return false;
      }
  }
}

export async function applyRules(orgId: string, txn: SourceTransaction): Promise<Categorisation | null> {
  const orgRules = await db.query.rules.findMany({
    where: (r, { eq }) => eq(r.orgId, orgId),
    orderBy: (r, { desc }) => [desc(r.priority)],
  });
  for (const rule of orgRules) {
    if (matchRule(txn, rule)) {
      return {
        accountCode: rule.accountCode,
        confidence: 100,
        reasoning: `Matched rule: ${rule.field} ${rule.op} "${rule.pattern}"`,
        viaRule: rule.id,
      };
    }
  }
  return null;
}

const CHART_PROMPT = CHART_OF_ACCOUNTS.map((a) => `${a.code} ${a.name}`).join("\n");

function anthropicClient(): Anthropic {
  // Concentrate gateway support: when ANTHROPIC_BASE_URL points at the
  // gateway, auth rides ANTHROPIC_AUTH_TOKEN (API key stays empty so the
  // SDK doesn't route around the meter). Plain Anthropic otherwise.
  if (process.env.ANTHROPIC_BASE_URL) {
    return new Anthropic({
      baseURL: process.env.ANTHROPIC_BASE_URL,
      apiKey: "gateway",
      defaultHeaders: { Authorization: `Bearer ${process.env.ANTHROPIC_AUTH_TOKEN ?? ""}` },
    });
  }
  return new Anthropic();
}

export async function categorizeWithClaude(
  txn: SourceTransaction,
  examples: Array<{ merchant: string | null; description: string | null; amountCents: number; accountCode: string }> = [],
): Promise<Categorisation> {
  const client = anthropicClient();
  const exampleBlock =
    examples.length > 0
      ? `Previously confirmed categorisations from this business (follow the same pattern):\n${examples
          .map((e) => `- "${e.merchant ?? "?"} / ${e.description ?? "?"}" ${e.amountCents}c → ${e.accountCode}`)
          .join("\n")}\n\n`
      : "";

  const message = await client.messages.create({
    // Gateway model ids are unversioned (concentrate remaps the tier);
    // plain Anthropic takes the dated snapshot. Centralise if a third
    // caller appears.
    model: process.env.ANTHROPIC_BASE_URL ? "claude-haiku-4-5" : "claude-haiku-4-5-20251001",
    max_tokens: 300,
    tools: [
      {
        name: "categorize",
        description: "Categorise a bookkeeping transaction into the chart of accounts.",
        input_schema: {
          type: "object",
          properties: {
            accountCode: { type: "string", description: "Chart code, e.g. 5100" },
            confidence: { type: "integer", description: "0-100", minimum: 0, maximum: 100 },
            reasoning: { type: "string", description: "One sentence, cites the merchant/amount signal used." },
          },
          required: ["accountCode", "confidence", "reasoning"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "categorize" },
    messages: [
      {
        role: "user",
        content: `You are the bookkeeper for a US solo-founder SaaS business. Categorise this transaction into the chart of accounts. Money IN (positive amount) is usually revenue or a transfer; money OUT is usually an expense. Return a REVENUE code (4000/4100/4200) for customer payments and charges, an EXPENSE code (5000-6100) for money spent. Only use transfer code 1100 (Stripe Clearing) or 6200 (Transfers) when the merchant/description explicitly names a transfer or payout between the business's own accounts; Stripe charges from customers are revenue, never clearing.

Chart of accounts:
${CHART_PROMPT}

${exampleBlock}Transaction:
- merchant: ${txn.merchant ?? "(unknown)"}
- description: ${txn.description ?? "(none)"}
- amount: ${txn.amountCents} cents (${Number(txn.amountCents) >= 0 ? "money in" : "money out"})
- currency: ${txn.currency}`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use" || !toolUse.input) {
    throw new Error("claude returned no categorisation");
  }
  const input = toolUse.input as { accountCode: string; confidence: number; reasoning: string };
  const accountCode = String(input.accountCode).trim();
  if (!CHART_CODES.has(accountCode)) {
    throw new Error(`claude returned unknown account code: ${accountCode}`);
  }
  return {
    accountCode,
    confidence: Math.max(0, Math.min(100, Number(input.confidence) || 0)),
    reasoning: String(input.reasoning ?? ""),
    viaRule: null,
  };
}

// Categorise one PENDING txn and persist the hint. Returns the result.
export async function categorizeOne(txnId: string): Promise<Categorisation | null> {
  const txn = await db.query.sourceTransactions.findFirst({
    where: (t, { eq }) => eq(t.id, txnId),
  });
  if (!txn || txn.status !== "PENDING") return null;

  // Stripe payout arrivals are NEVER revenue — they're transfers from
  // Stripe Clearing that reconcile must pair with a bank deposit. Pin them
  // before rules/LLM can mislabel them (e.g. a broad STRIPE→4000 rule).
  if (txn.externalId.startsWith("po_")) {
    const result: Categorisation = {
      accountCode: "1100",
      confidence: 100,
      reasoning: "Stripe payout arrival: transfer from Stripe Clearing (1100), paired with bank deposit at reconcile time.",
      viaRule: null,
    };
    await db
      .update(sourceTransactions)
      .set({ status: "CATEGORISED", confidence: 100, categoryHint: "1100", updatedAt: new Date() })
      .where(eq(sourceTransactions.id, txn.id));
    return result;
  }

  const viaRules = await applyRules(txn.orgId, txn);
  const result = viaRules ?? (await categorizeWithClaude(txn, await confirmedExamples(txn.orgId)));

  await db
    .update(sourceTransactions)
    .set({
      status: "CATEGORISED",
      confidence: result.confidence,
      categoryHint: result.accountCode,
      updatedAt: new Date(),
    })
    .where(eq(sourceTransactions.id, txn.id));

  return result;
}

// Prior human-confirmed categorisations for few-shot calibration.
async function confirmedExamples(orgId: string) {
  const rows = await db.query.sourceTransactions.findMany({
    where: (t, { and, eq }) =>
      and(eq(t.orgId, orgId), eq(t.status, "POSTED")),
    orderBy: (t, { desc }) => [desc(t.updatedAt)],
    limit: 8,
    columns: { merchant: true, description: true, amountCents: true, categoryHint: true },
  });
  return rows
    .filter((r) => r.categoryHint)
    .map((r) => ({
      merchant: r.merchant,
      description: r.description,
      amountCents: Number(r.amountCents),
      accountCode: r.categoryHint!,
    }));
}

// Persist what the user taught us: exact-merchant rule at priority 50.
export async function learnFromCorrection(
  orgId: string,
  merchant: string,
  accountCode: string,
  createdBy: string,
) {
  if (!merchant.trim() || !CHART_CODES.has(accountCode)) return;
  await db
    .insert(rules)
    .values({
      orgId,
      field: "MERCHANT",
      op: "EQUALS",
      pattern: merchant.trim(),
      accountCode,
      priority: 50,
      createdBy,
    })
    .onConflictDoNothing();
}
