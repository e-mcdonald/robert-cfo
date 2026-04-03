# Ledger — Open Source Personal Finance Dashboard

A free, local-first alternative to Copilot Money and Monarch Money. Your financial data stays on your machine — no cloud, no subscriptions, no selling your data.

![Dashboard](https://github.com/e-mcdonald/robert-cfo/raw/main/finance-dashboard/client/src/assets/dashboard-preview.png)

---

## What it is

Ledger is a full-stack personal finance dashboard that aggregates your accounts, tracks spending, and shows your net worth over time. It connects directly to your financial institutions via their official APIs — not screen scraping — and stores everything locally in SQLite with encrypted credentials.

It works out of the box with realistic mock data, so you can explore the full UI before connecting anything real.

**Current data sources:**
- **Teller.io** — real bank connections (checking, savings, credit cards) via mTLS-secured API. Supports RBFCU, Capital One, Discover, and [hundreds of other institutions](https://teller.io/docs/api/institutions)
- **Gemini** — crypto balances and trade history via read-only API key
- **Robinhood** — brokerage positions and transactions via a local Python bridge
- **Guideline** — 401k balance via CSV export drop folder

**Features:**
- Net worth tracking with sparkline history and asset/liability breakdown
- Spending charts — weekly and monthly cash flow (income vs. spending)
- AI-powered transaction categorization via Claude (`claude-sonnet-4-20250514`)
- Full transaction feed with search, filtering, and manual re-categorization
- AES-256-GCM encryption for all stored access tokens
- Runs entirely on `localhost` — nothing leaves your machine

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Recharts, Framer Motion |
| Backend | Node.js, Express (ESM) |
| Database | SQLite via `better-sqlite3` |
| Python bridge | FastAPI, `robin_stocks` |
| AI | Anthropic SDK (`claude-sonnet-4-20250514`) |
| Encryption | AES-256-GCM |

---

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.10+ (only needed for Robinhood)
- `pip`

### 1. Clone the repo

```bash
git clone https://github.com/e-mcdonald/robert-cfo.git
cd robert-cfo/finance-dashboard
```

### 2. Install dependencies

```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 3. Configure environment

```bash
cp .env.example .env
node scripts/generate-key.js   # paste the output into ENCRYPTION_KEY in .env
```

The app works fully with just the `ENCRYPTION_KEY` set — all other values are optional and fall back to mock data.

### 4. Run it

```bash
npm run dev
```

This starts:
- **Frontend** at `http://localhost:5173`
- **API server** at `http://localhost:3001`
- **Python bridge** at `http://localhost:8001` (Robinhood only)

### 5. Seed data

On first run, click **Sync Now** in the top bar, or:

```bash
curl -X POST http://localhost:3001/api/sync/all
```

---

## Connecting real accounts

All credentials are optional. Add what you want, leave the rest as mock data.

### Teller.io (banking)

Teller is a Plaid alternative with direct bank API connections — no screen scraping.

1. Sign up at [teller.io](https://teller.io) and get approved for development access
2. Download your `certificate.pem` and `private_key.pem` from the Teller dashboard
3. Place both files in `finance-dashboard/certs/`
4. Set in `.env`:
   ```
   TELLER_APP_ID=app_XXXXXXXXXXXXXXXX
   TELLER_CERT_PATH=./certs/certificate.pem
   TELLER_KEY_PATH=./certs/private_key.pem
   TELLER_ENV=development
   ```
5. Click **Connect Bank** in the app to complete the OAuth-style flow

### Gemini (crypto)

1. Go to Gemini → Account → API → Create API Key
2. Set permissions to **Auditor only** (read-only — cannot move funds)
3. Set in `.env`:
   ```
   GEMINI_API_KEY=account-XXXXXXXX
   GEMINI_API_SECRET=XXXXXXXXXXXXXXXX
   ```

### Robinhood (brokerage)

Robinhood has no official public API. This uses the `robin_stocks` library via a local Python microservice.

```bash
pip install -r scripts/python-bridge/requirements.txt
```

Set in `.env`:
```
ROBINHOOD_EMAIL=your@email.com
ROBINHOOD_PASSWORD=yourpassword
```

On first run, `robin_stocks` will prompt for your MFA code in the terminal, then cache the session.

### Guideline (401k)

Guideline doesn't have an individual API. Export your transaction history as CSV from [app.guideline.com](https://app.guideline.com), drop the file in `uploads/guideline/`, then hit:

```bash
curl -X POST http://localhost:3001/api/sync/guideline
```

### Claude AI categorization

Add your Anthropic API key to enable automatic transaction categorization:

```
ANTHROPIC_API_KEY=sk-ant-XXXXXXXX
```

Without it, transactions are categorized as "Other". Get a key at [console.anthropic.com](https://console.anthropic.com).

---

## Security

- All access tokens are encrypted with AES-256-GCM before being written to SQLite
- The `ENCRYPTION_KEY` is generated locally and never leaves your machine
- The server binds to `localhost` only — not exposed to the internet
- Teller tokens can be revoked at any time from your Teller dashboard
- Gemini keys should be created with **Auditor (read-only)** permissions
- The `.env` file and `certs/` directory are in `.gitignore` and will never be committed

---

## Roadmap

This project is early but the goal is to build the best free, open-source alternative to paid finance dashboards. Planned additions:

- [ ] Budget tracking with monthly limits per category
- [ ] Recurring transaction detection
- [ ] Bill due date reminders
- [ ] Net worth goal tracking
- [ ] More bank connectors (Plaid fallback, manual CSV import for any institution)
- [ ] Mobile-friendly responsive layout
- [ ] Export to CSV / PDF reports
- [ ] Docker container for easy self-hosting
- [ ] Multi-user support (for households)

---

## Contributing

Contributions are welcome. Open an issue to discuss what you'd like to add, or submit a PR directly. This is intentionally kept simple — no build complexity, no monorepo tooling beyond npm workspaces.

---

## License

MIT — free to use, modify, and self-host.
