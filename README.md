# Booked

Autonomous bookkeeping for solo founders. Connect your bank and Stripe; Booked
categorises every transaction, reconciles Stripe payouts, and produces monthly
financial statements you'd otherwise pay a bookkeeper $300–1,000/mo to prepare.

Built during **The Build Games** (Sep 6 – Sep 30, 2026) as a working
replacement for Bench (recently sunset) and the entry tier of Pilot.

Live at **https://booked.apps.orizon.ng**

## What makes it a ledger, not a categoriser

Most "AI bookkeeping" tools label transactions and stop. Booked posts
double-entry journal entries against a real chart of accounts, so the books
balance and every number on a statement drills back to the entry that produced
it.

The categorisation agent is deliberately three-tiered, cheapest first:

1. **Deterministic rules** — ordered by priority, first match wins at
   confidence 100. Free, instant, explainable.
2. **Claude** — only for what rules can't place, with the chart of accounts and
   prior confirmed categorisations passed as calibration. Structured tool use
   pins the answer to a real account code.
3. **Learning** — a correction in the review UI writes a rule, so that merchant
   never reaches the LLM again.

Stripe payout arrivals (`po_`) are pinned to Stripe Clearing before either tier
runs, so a broad `STRIPE → revenue` rule can't misfile them as income.

## Scope, v1

Persona: US solo founder or small SaaS. Inputs: one USD bank account (Plaid) +
Stripe.

Built and working:

- Magic-link auth, bank + Stripe connection, transaction sync
- Rules/LLM categorisation with a review inbox
- Double-entry posting against a fixed chart of accounts
- Stripe payout reconciliation
- Profit & loss and balance sheet, any period

Not built yet: cash-flow statement, close-packet PDF, weekly anomaly digest.

Explicitly out of scope for v1: payroll, multi-entity, multi-currency,
receipts OCR, invoicing, 1099s, tax filing.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind
- Postgres (Orizon managed) · Drizzle ORM
- Anthropic Claude (structured tool use) for the categorisation agent
- Plaid for bank feeds · Stripe SDK for revenue
- Orizon transactional email for magic-link auth

## Local dev

```sh
cp .env.example .env       # fill in values
npm install
npm run db:push
npm run dev
```

Other scripts: `npm run typecheck`, `npm run db:studio`, `npm run db:reset`.

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Signs session cookies |
| `APP_URL` | Origin used to build magic-link URLs |
| `ORIZON_EMAIL_API_KEY` | Sends login emails via Orizon (`orz_…`, scope `send`). Unset in dev → the link is returned to the browser instead |
| `EMAIL_FROM` | Sender for login emails. Its domain must be verified for your team |
| `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV` | Bank feeds |
| `STRIPE_CLIENT_ID` / `STRIPE_SECRET_KEY` | Revenue sync |
| `ANTHROPIC_API_KEY` | Categorisation agent |
| `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN` | Optional. Routes the agent through a gateway; when set, `ANTHROPIC_API_KEY` is ignored |

## Deploy

Deployed on Orizon (dogfood):

```sh
orizon deploy
```

`orizon env push <file>` merges variables into the project — it updates only the
keys present in the file and leaves the rest untouched. Note that
`orizon env pull` prints key names with **masked values**, so it can't be used
to round-trip a config.

## License

MIT
