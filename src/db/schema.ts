import { pgTable, text, timestamp, bigint, integer, date, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const magicLinks = pgTable("magic_links", {
  token: text("token").primaryKey(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

// One connection = one Stripe account or one Lemon Squeezy store
export const connections = pgTable("connections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'stripe' | 'lemonsqueezy'
  label: text("label").notNull(),       // user-given name, e.g. "TypingMind"
  apiKey: text("api_key").notNull(),    // stored as-is for now, encrypt in v2
  color: text("color").notNull().default("#5e6ad2"),
  currency: text("currency").notNull().default("usd"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

// Daily MRR snapshot per connection
export const snapshots = pgTable("snapshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  connectionId: text("connection_id").notNull().references(() => connections.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mrrCents: bigint("mrr_cents", { mode: "number" }).notNull().default(0),
  newMrrCents: bigint("new_mrr_cents", { mode: "number" }).notNull().default(0),
  churnedMrrCents: bigint("churned_mrr_cents", { mode: "number" }).notNull().default(0),
  expansionMrrCents: bigint("expansion_mrr_cents", { mode: "number" }).notNull().default(0),
  contractionMrrCents: bigint("contraction_mrr_cents", { mode: "number" }).notNull().default(0),
  activeSubscriptions: integer("active_subscriptions").notNull().default(0),
}, (t) => [
  uniqueIndex("snapshots_conn_date_idx").on(t.connectionId, t.date),
]);

// Individual subscription events for AI analysis context
export const revenueEvents = pgTable("revenue_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  connectionId: text("connection_id").notNull().references(() => connections.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(), // Stripe subscription ID
  eventType: text("event_type").notNull(), // 'new' | 'churn' | 'expansion' | 'contraction' | 'reactivation'
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  currency: text("currency").notNull().default("usd"),
  occurredAt: timestamp("occurred_at").notNull(),
  metadata: text("metadata"), // JSON blob: plan name, customer email, etc.
});
