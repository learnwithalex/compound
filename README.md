# Compound — Revenue OS for indie hackers

One dashboard for every product you've built. Connect Stripe, Lemon Squeezy, Polar, DodoPayments, and Paystack accounts, see total MRR across your whole portfolio, and get an AI briefing that explains exactly why the numbers moved.

**Built for [The Build Games](https://canivibecodeit.com/thebuildgames) — Best Replacement track.**  
Positioned as a lightweight portfolio alternative. Competitor pricing varies by tracked revenue and plan; verify current pricing before comparing.

## Live demo

→ **[compound.apps.orizon.ng](https://compound.apps.orizon.ng)**  
→ Open **[/demo](https://compound.apps.orizon.ng/demo)** — no account needed.

This product preview uses clearly labeled fictional sample data; it does not connect to live provider accounts.

## What it does

- **Portfolio view** — total MRR + ARR across every connected product in one number
- **Shareable MRR card** — 4 themes, MRR/ARR/subs toggle, per-product filters, copy-link to share
- **Churn radar** — automatic red/amber signals: down-streaks, churn outpacing growth, 30d slides
- **Milestones** — progress bars toward the next MRR target per product ($100 → $1M ladder)
- **Per-product cards** — MRR, active subs, 30-day trend, smooth sparklines with gridlines
- **AI analysis** — one button → Claude writes a CFO-style briefing: what's working, what needs attention, one specific action
- **Agent API** — bearer tokens so Claude/Cursor/scripts can fetch the portfolio over HTTP
- **7 provider adapters** — Stripe, Lemon Squeezy, Polar, DodoPayments, Paystack, Paddle, Gumroad
- **Daily snapshots** — MRR captured every day so you can see exactly when things moved
- **Hosted trial + Pro** — the hosted trial is limited; Pro is $9/month. Self-hosting is available under the MIT license.

## How Compound differs

Compound is aimed at founders who want one portfolio view across payment providers plus a read-only API for AI clients. It is deliberately narrower than mature subscription analytics platforms: there is no currency conversion, dunning or application-layer encryption for provider keys yet.

| Tool | Focus |
|---|---|
| Baremetrics | Established subscription analytics and revenue-recovery features; pricing varies by scale and plan |
| ChartMogul | Mature subscription metrics and cohort reporting; pricing scales with tracked revenue |
| **Compound** | Portfolio view across providers, AI briefings and a read-only Agent API; see the limitations above |

## Stack

- **Next.js 16** (App Router, React 19)
- **Drizzle ORM + PostgreSQL** — daily snapshot model
- **Anthropic Claude Haiku** — AI portfolio analysis
- **Stripe + Lemon Squeezy + Polar + DodoPayments + Paystack APIs** — live subscription data
- **Orizon** — hosting + managed DB

## Self-host in 5 minutes

```bash
git clone https://github.com/learnwithalex/compound
cd compound
npm install

# copy and fill in your keys
cp .env.example .env

# push schema
npx drizzle-kit push

# seed demo data (optional)
npx tsx scripts/seed-demo.ts

npm run dev
```

**Required env vars:**

```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
APP_URL=http://localhost:3000
CRON_SECRET=<secret used by your scheduler>
SESSION_SECRET=<32+ random chars>
```

## Security notes

- Use provider-specific read-only API keys with the narrowest permissions available. The current hosted implementation stores provider keys in the database without application-layer encryption.
- Agent API tokens are stored as SHA-256 hashes, only authorize the read-only portfolio endpoint, and can be revoked.
- Public revenue pages are disabled by default.
- MRR intervals are normalized to monthly values, but no currency conversion is performed; connect accounts in the same currency before interpreting a portfolio total.

## How it works

```
User connects payment account (API key, read-only)
        ↓
POST /api/connections — validates key, stores it (authenticated browser session required)
        ↓
POST /api/sync — authenticated browser session fetches active subscriptions,
                 normalises billing intervals → monthly cents (no FX conversion; totals assume the same currency across connected accounts),
                 upserts daily snapshot per connection
        ↓
GET  /app — reads snapshots, computes portfolio metrics,
            renders product cards + sparklines
        ↓
POST /api/analyze — authenticated browser session feeds metrics into Claude Haiku,
                    returns CFO-style briefing
```

## License

MIT — use it, fork it, ship it.

---

*Built in public, Sep 2026 · [@learnwithalex](https://github.com/learnwithalex)*
