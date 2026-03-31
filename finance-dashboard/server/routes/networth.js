import { Router } from 'express'
import { getDb } from '../db/client.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDb()
  const latest = db.prepare(
    'SELECT * FROM net_worth_snaps ORDER BY timestamp DESC LIMIT 1'
  ).get()

  if (!latest) {
    // Return mock net worth if no snapshots yet
    return res.json({
      total_assets: 48211.84,
      total_liabilities: 1053.76,
      net_worth: 47158.08,
      breakdown_json: JSON.stringify({
        checking: 4823.47,
        savings: 12547.82,
        crypto: 30028.55,
        investments: 18423.55,
        retirement: 9200.00,
        credit: -1053.76,
      }),
      timestamp: new Date().toISOString(),
      mock: true,
    })
  }

  res.json(latest)
})

router.get('/history', (req, res) => {
  const db = getDb()
  const history = db.prepare(
    'SELECT * FROM net_worth_snaps ORDER BY timestamp ASC'
  ).all()
  res.json(history)
})

export default router
