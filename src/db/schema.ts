import { pgTable, text, timestamp, bigint, integer, date, uniqueIndex, boolean } from "drizzle-orm/pg-core";

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
  webhookToken: text("webhook_token").unique().$defaultFn(() => "whk_" + crypto.randomUUID().replace(/-/g, "")),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

// A customer at the provider. One row per (connection, provider customer id).
export const customers = pgTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  connectionId: text("connection_id").notNull().references(() => connections.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  email: text("email"),
  name: text("name"),
  country: text("country"),
  // When they became a customer at the provider — this is the cohort anchor.
  signedUpAt: timestamp("signed_up_at"),
  // Only ever populated if the merchant stamped these onto the provider record
  // themselves; most accounts have none, so treat null as "unattributed".
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  metadata: text("metadata"),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("customers_conn_external_idx").on(t.connectionId, t.externalId),
]);

// Current state of one subscription. Lifecycle dates here are what cohort
// retention and LTV are derived from, so they matter more than the MRR total.
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  connectionId: text("connection_id").notNull().references(() => connections.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  planName: text("plan_name"),
  status: text("status").notNull(), // active | trialing | past_due | canceled
  mrrCents: bigint("mrr_cents", { mode: "number" }).notNull().default(0),
  currency: text("currency").notNull().default("usd"),
  interval: text("interval"), // month | year | week | day
  quantity: integer("quantity").notNull().default(1),
  startedAt: timestamp("started_at"),
  trialStartAt: timestamp("trial_start_at"),
  trialEndAt: timestamp("trial_end_at"),
  canceledAt: timestamp("canceled_at"),
  metadata: text("metadata"),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("subscriptions_conn_external_idx").on(t.connectionId, t.externalId),
]);

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

// Long-lived API tokens so agents (Claude, Cursor, custom scripts) can
// query the portfolio programmatically. Only a sha256 hash is stored.
export const apiTokens = pgTable("api_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("agent"),
  tokenHash: text("token_hash").notNull().unique(),
  tokenPrefix: text("token_prefix").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"),
});

export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  digestEnabled: boolean("digest_enabled").notNull().default(false),
  digestDay: integer("digest_day").notNull().default(1), // 1=Mon … 7=Sun
  milestoneAlerts: boolean("milestone_alerts").notNull().default(true),
  lastMilestoneCents: bigint("last_milestone_cents", { mode: "number" }).notNull().default(0),
  publicPageEnabled: boolean("public_page_enabled").notNull().default(false),
  publicSlug: text("public_slug").unique(),
  publicShowMrr: boolean("public_show_mrr").notNull().default(true),
  publicShowProducts: boolean("public_show_products").notNull().default(true),
  // Real-time email alerts
  alertNewSub: boolean("alert_new_sub").notNull().default(false),
  alertChurn: boolean("alert_churn").notNull().default(false),
  alertUpgrade: boolean("alert_upgrade").notNull().default(false),
  alertPastDue: boolean("alert_past_due").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// MRR goals — target MRR by a given date
export const revenueGoals = pgTable("revenue_goals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("MRR Goal"),
  targetMrrCents: bigint("target_mrr_cents", { mode: "number" }).notNull(),
  targetDate: date("target_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notes on a customer — lightweight CRM
export const customerNotes = pgTable("customer_notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Per-connection public ingest token for the JS tracker
export const trackerTokens = pgTable("tracker_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  connectionId: text("connection_id").notNull().unique().references(() => connections.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique().$defaultFn(() => "cmpd_" + crypto.randomUUID().replace(/-/g, "")),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Behavioral events sent by the embedded JS tracker
export const analyticsEvents = pgTable("analytics_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  connectionId: text("connection_id").notNull().references(() => connections.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'page' | 'track' | 'identify'
  userId: text("user_id"), // email or custom ID from identify()
  name: text("name"), // event name or page title
  properties: text("properties"), // JSON blob
  url: text("url"),
  sessionId: text("session_id"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
});

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
