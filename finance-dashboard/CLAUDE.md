# Finance Dashboard — Claude Code Guide

## Architecture

- **Frontend**: React 18 + Vite on port 5173 (`client/`)
- **Backend**: Node.js + Express on port 3001 (`server/`)
- **Database**: SQLite at `data/finance.db` (auto-created)
- **Python Bridge**: FastAPI on port 8001 (`scripts/python-bridge/`)

## Dev Commands

```bash
npm run dev              # All services concurrently
npm run dev:server       # Server only (port 3001)
npm run dev:client       # Frontend only (port 5173)
npm run dev:python       # Python bridge only (port 8001)
npm run generate-key     # Generate ENCRYPTION_KEY
npm run db:migrate       # Run DB migrations
npm run sync             # Trigger full sync via curl
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Run `npm run generate-key` and paste value into `.env`
3. Fill in data source credentials (all optional — mock data works without)

## Data Sources Priority for Real Credentials

1. `ANTHROPIC_API_KEY` — enables AI categorization (huge UX improvement)
2. `TELLER_APP_ID` + `TELLER_CERT_PATH` + `TELLER_KEY_PATH` — real bank data
3. `GEMINI_API_KEY` + `GEMINI_API_SECRET` — real crypto balances
4. `ROBINHOOD_EMAIL` + `ROBINHOOD_PASSWORD` — real brokerage data

## Adding Mock Data Resets

POST /api/sync/all re-seeds all mock data and creates a net worth snapshot.

## File Structure Notes

- `server/services/` — all business logic and data connectors
- `server/routes/` — thin Express route handlers
- `client/src/hooks/` — data fetching hooks
- `client/src/components/` — reusable UI components
- `client/src/pages/` — page-level layouts
