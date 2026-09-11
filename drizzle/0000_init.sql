CREATE TYPE "public"."account_type" AS ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "public"."anomaly_kind" AS ENUM('UNUSUAL_AMOUNT', 'DUPLICATE', 'CATEGORY_DRIFT', 'MISSING_RECONCILIATION', 'BURN_SPIKE');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."period_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."rule_field" AS ENUM('MERCHANT', 'DESCRIPTION');--> statement-breakpoint
CREATE TYPE "public"."rule_op" AS ENUM('EQUALS', 'CONTAINS', 'STARTS_WITH', 'REGEX');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('PLAID', 'STRIPE');--> statement-breakpoint
CREATE TYPE "public"."source_status" AS ENUM('ACTIVE', 'DISCONNECTED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."source_txn_status" AS ENUM('PENDING', 'CATEGORISED', 'POSTED', 'IGNORED');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anomalies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"kind" "anomaly_kind" NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"details_json" jsonb NOT NULL,
	"txn_id" uuid,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "close_packets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"period_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pdf_url" text,
	"summary" text,
	"metrics_json" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"period_id" uuid
);
--> statement-breakpoint
CREATE TABLE "entry_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit_cents" bigint DEFAULT 0 NOT NULL,
	"credit_cents" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "login_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "org_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "org_role" DEFAULT 'owner' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orgs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"status" "period_status" DEFAULT 'OPEN' NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_by" text
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"field" "rule_field" NOT NULL,
	"op" "rule_op" NOT NULL,
	"pattern" text NOT NULL,
	"account_code" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"kind" "source_kind" NOT NULL,
	"external_id" text NOT NULL,
	"access_token" text NOT NULL,
	"status" "source_status" DEFAULT 'ACTIVE' NOT NULL,
	"cursor" text,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "source_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"connection_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"amount_cents" bigint NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"merchant" text,
	"description" text,
	"raw" jsonb NOT NULL,
	"status" "source_txn_status" DEFAULT 'PENDING' NOT NULL,
	"confidence" integer,
	"category_hint" text,
	"entry_id" uuid,
	"ignored_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_transactions_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parent_id_accounts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "close_packets" ADD CONSTRAINT "close_packets_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "close_packets" ADD CONSTRAINT "close_packets_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_lines" ADD CONSTRAINT "entry_lines_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_lines" ADD CONSTRAINT "entry_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_tokens" ADD CONSTRAINT "login_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_users" ADD CONSTRAINT "org_users_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_users" ADD CONSTRAINT "org_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periods" ADD CONSTRAINT "periods_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_connections" ADD CONSTRAINT "source_connections_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_transactions" ADD CONSTRAINT "source_transactions_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_transactions" ADD CONSTRAINT "source_transactions_connection_id_source_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."source_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_org_code_uidx" ON "accounts" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX "accounts_org_type_idx" ON "accounts" USING btree ("org_id","type");--> statement-breakpoint
CREATE INDEX "anomalies_org_resolved_idx" ON "anomalies" USING btree ("org_id","resolved");--> statement-breakpoint
CREATE INDEX "entries_org_occurred_idx" ON "entries" USING btree ("org_id","occurred_at");--> statement-breakpoint
CREATE INDEX "entries_org_period_idx" ON "entries" USING btree ("org_id","period_id");--> statement-breakpoint
CREATE INDEX "entry_lines_entry_idx" ON "entry_lines" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "entry_lines_account_idx" ON "entry_lines" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_users_org_user_uidx" ON "org_users" USING btree ("org_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "periods_org_ym_uidx" ON "periods" USING btree ("org_id","year","month");--> statement-breakpoint
CREATE INDEX "rules_org_priority_idx" ON "rules" USING btree ("org_id","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "source_connections_org_kind_ext_uidx" ON "source_connections" USING btree ("org_id","kind","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_txns_conn_ext_uidx" ON "source_transactions" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE INDEX "source_txns_org_status_idx" ON "source_transactions" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "source_txns_org_occurred_idx" ON "source_transactions" USING btree ("org_id","occurred_at");