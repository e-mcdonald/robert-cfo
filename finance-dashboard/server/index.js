import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { getDb } from './db/client.js'

import accountsRouter from './routes/accounts.js'
import transactionsRouter from './routes/transactions.js'
import syncRouter from './routes/sync.js'
import tellerRouter from './routes/teller.js'
import networthRouter from './routes/networth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize DB on startup
getDb()

// Routes
app.use('/api/accounts', accountsRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/sync', syncRouter)
app.use('/api/teller', tellerRouter)
app.use('/api/networth', networthRouter)

app.get('/api/health', (req, res) => {
  const db = getDb()
  const counts = {
    accounts: db.prepare('SELECT COUNT(*) as n FROM accounts WHERE is_active=1').get().n,
    transactions: db.prepare('SELECT COUNT(*) as n FROM transactions').get().n,
    snapshots: db.prepare('SELECT COUNT(*) as n FROM net_worth_snaps').get().n,
  }
  res.json({ status: 'ok', ...counts })
})

app.listen(PORT, () => {
  console.log(`Finance Dashboard server running on http://localhost:${PORT}`)
})
