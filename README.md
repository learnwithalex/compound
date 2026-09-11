# Compound — Revenue OS for indie hackers

One dashboard for every product you've built. Connect all your Stripe and Lemon Squeezy accounts, see total MRR across your whole portfolio, and get an AI briefing that explains exactly why the numbers moved.

**Built for [The Build Games](https://canivibecodeit.com/thebuildgames) — Best Replacement track.**  
Replacing: Baremetrics ($108/mo), ChartMogul ($100+/mo), MultiMMR ($19/mo, Stripe-only).

## Live demo

→ **[compound.apps.orizon.ng](https://compound.apps.orizon.ng)**  
→ Click **"Open demo"** on the login page — no account needed.

The demo loads with three pre-connected products and 31 days of realistic MRR history.

## What it does

- **Portfolio view** — total MRR + ARR across every connected product in one number
- **Per-product cards** — MRR, active subs, 30-day trend, new vs churned, sparkline
- **AI analysis** — one button → Claude writes a CFO-style briefing: what's working, what needs attention, one specific action
- **Multi-source** — Stripe and Lemon Squeezy (more coming)
- **Daily snapshots** — MRR captured every day so you can see exactly when things moved
- **Free** — no paywalls, no 14-day trials

## Why it exists

If you have more than one product, every analytics tool fails you:

| Tool | Price | Multi-product | AI insights |
|---|---|---|---|
| Baremetrics | $108/mo | ❌ one business | ❌ |
| ChartMogul | $100+/mo | ❌ one business | ❌ |
| MultiMMR | $19/mo | ⚠️ Stripe only | ❌ |
| **Compound** | **Free** | **✅ Stripe + LS** | **✅ Claude** |

## Stack

- **Next.js 16** (App Router, React 19)
- **Drizzle ORM + PostgreSQL** — daily snapshot model
- **Anthropic Claude Haiku** — AI portfolio analysis
- **Stripe API + Lemon Squeezy API** — live subscription data
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
SESSION_SECRET=<32+ random chars>
DEMO_LOGIN_ENABLED=true   # optional, enables /api/auth/demo shortcut
```

## How it works

```
User connects Stripe/LS account (API key, read-only)
        ↓
POST /api/connections — validates key, stores it
        ↓
POST /api/sync — fetches all active subscriptions,
                 normalises billing intervals → monthly cents,
                 upserts daily snapshot per connection
        ↓
GET  /app — reads snapshots, computes portfolio metrics,
            renders product cards + sparklines
        ↓
POST /api/analyze — feeds metrics into Claude Haiku,
                    returns CFO-style briefing
```

## License

MIT — use it, fork it, ship it.

---

*Built in public, Sep 2026 · [@learnwithalex](https://github.com/learnwithalex)*
