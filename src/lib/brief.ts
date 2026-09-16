import Anthropic from "@anthropic-ai/sdk";
import type { PortfolioMetrics } from "./metrics";
import { fmtMrr } from "./format";
import { radarSignals } from "./insights";

export type BriefMood = "growing" | "steady" | "shrinking";
export type CalloutKind = "win" | "risk";

export interface BriefCallout {
  kind: CalloutKind;
  /** Which product this is about, so the UI can show its logo and link to it. */
  connectionId: string | null;
  title: string;
  detail: string;
}

export interface BriefAction {
  title: string;
  detail: string;
}

export interface Brief {
  headline: string;
  mood: BriefMood;
  summary: string;
  callouts: BriefCallout[];
  actions: BriefAction[];
  generatedAt: string;
}

const MOODS: BriefMood[] = ["growing", "steady", "shrinking"];

const TOOL: Anthropic.Tool = {
  name: "emit_brief",
  description: "Return the founder briefing as structured data.",
  input_schema: {
    type: "object",
    properties: {
      headline: {
        type: "string",
        description: "One punchy sentence, under 70 characters, stating the single most important thing.",
      },
      mood: { type: "string", enum: MOODS },
      summary: {
        type: "string",
        description: "Two or three sentences of plain-English context. No bullet points, no markdown.",
      },
      callouts: {
        type: "array",
        description: "Two to four specific observations, each tied to a product where possible. Mix wins and risks.",
        items: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["win", "risk"] },
            connectionId: {
              type: "string",
              description: "The id of the product this is about, copied exactly. Omit for portfolio-wide points.",
            },
            title: { type: "string", description: "Under 45 characters." },
            detail: { type: "string", description: "One sentence citing the actual number." },
          },
          required: ["kind", "title", "detail"],
        },
      },
      actions: {
        type: "array",
        description: "One to three things to do this week, most important first.",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "An imperative, under 50 characters." },
            detail: { type: "string", description: "One sentence on why, citing a number." },
          },
          required: ["title", "detail"],
        },
      },
    },
    required: ["headline", "mood", "summary", "callouts", "actions"],
  },
};

function snapshot(metrics: PortfolioMetrics): string {
  const signals = radarSignals(metrics.products);
  const lines = metrics.products.map((p) => {
    const trend = `${p.mrrChange30d > 0 ? "+" : ""}${p.mrrChange30d.toFixed(1)}%`;
    const flags = signals.find((s) => s.connectionId === p.connectionId);
    const warn = flags ? ` FLAGGED (${flags.severity}): ${flags.reasons.map((r) => r.message).join("; ")}.` : "";
    return `- id=${p.connectionId} | ${p.label} (${p.provider}) | MRR ${fmtMrr(p.mrrCents)} | ${p.activeSubscriptions} active subs | ${trend} over 30d | new ${fmtMrr(p.newMrrCents)}, expansion ${fmtMrr(p.expansionMrrCents)}, churned ${fmtMrr(p.churnedMrrCents)}.${warn}`;
  });

  return `Portfolio:
- Total MRR: ${fmtMrr(metrics.totalMrrCents)}
- Total ARR: ${fmtMrr(metrics.totalArrCents)}
- Net new MRR over 30 days: ${fmtMrr(metrics.netNewMrrCents)}
- Active subscriptions: ${metrics.totalActiveSubscriptions}

Products (${metrics.products.length}):
${lines.join("\n")}`;
}

const client = new Anthropic();

export async function generateBrief(metrics: PortfolioMetrics): Promise<Brief> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    tools: [TOOL],
    tool_choice: { type: "tool", name: TOOL.name },
    messages: [
      {
        role: "user",
        content: `You are the CFO for an indie hacker running ${metrics.products.length} product${metrics.products.length === 1 ? "" : "s"}. Here is today's data.

${snapshot(metrics)}

Brief them. Be direct and specific — cite the actual products and numbers, never generic SaaS advice. Write like you are texting a busy founder, not writing a board report. If something is quietly going wrong, lead with it.

Every figure above is monthly recurring revenue and every change is over the trailing 30 days. Never describe anything as year-over-year, quarterly, or annual, and never invent a number that is not above.`,
      },
    ],
  });

  const block = message.content.find((c) => c.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("model returned no brief");

  const raw = block.input as {
    headline?: unknown;
    mood?: unknown;
    summary?: unknown;
    callouts?: unknown;
    actions?: unknown;
  };

  const known = new Set(metrics.products.map((p) => p.connectionId));
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const callouts: BriefCallout[] = (Array.isArray(raw.callouts) ? raw.callouts : [])
    .map((c: Record<string, unknown>) => ({
      kind: c.kind === "risk" ? ("risk" as const) : ("win" as const),
      // The model sometimes invents or truncates an id; only trust ones we know.
      connectionId: known.has(str(c.connectionId)) ? str(c.connectionId) : null,
      title: str(c.title),
      detail: str(c.detail),
    }))
    .filter((c) => c.title && c.detail);

  const actions: BriefAction[] = (Array.isArray(raw.actions) ? raw.actions : [])
    .map((a: Record<string, unknown>) => ({ title: str(a.title), detail: str(a.detail) }))
    .filter((a) => a.title);

  return {
    headline: str(raw.headline) || "Here's where the portfolio stands.",
    mood: MOODS.includes(raw.mood as BriefMood) ? (raw.mood as BriefMood) : "steady",
    summary: str(raw.summary),
    callouts,
    actions,
    generatedAt: new Date().toISOString(),
  };
}
