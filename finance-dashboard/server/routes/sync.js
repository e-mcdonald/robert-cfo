import { Router } from 'express'
import { getDb } from '../db/client.js'
import { syncAll } from '../services/sync.js'
import { syncTeller } from '../services/teller.js'
import { syncGemini } from '../services/gemini.js'
import { syncRobinhood } from '../services/robinhood.js'
import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

router.post('/all', async (req, res) => {
  try {
    const results = await syncAll()
    res.json({ success: true, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/teller', async (req, res) => {
  try {
    const result = await syncTeller()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/gemini', async (req, res) => {
  try {
    const result = await syncGemini()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/robinhood', async (req, res) => {
  try {
    const result = await syncRobinhood()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/guideline', async (req, res) => {
  const uploadsDir = join(__dirname, '../../uploads/guideline')
  try {
    const files = readdirSync(uploadsDir).filter((f) => f.endsWith('.csv'))
    if (files.length === 0) return res.json({ message: 'No CSV files found', processed: 0 })

    const db = getDb()
    const upsertAccount = db.prepare(`
      INSERT OR IGNORE INTO accounts (id, institution, institution_id, name, type, subtype, currency)
      VALUES ('guideline_401k', 'guideline', 'guideline_401k', 'Guideline 401k', 'retirement', '401k', 'USD')
    `)
    const upsertTxn = db.prepare(`
      INSERT OR IGNORE INTO transactions (id, account_id, date, description, merchant, amount, currency, category, source, status)
      VALUES (@id, 'guideline_401k', @date, @description, 'Guideline', @amount, 'USD', 'Investments', 'guideline', 'posted')
    `)

    let added = 0
    db.transaction(() => {
      upsertAccount.run()
      for (const file of files) {
        const content = readFileSync(join(uploadsDir, file), 'utf-8')
        const lines = content.split('\n').slice(1) // skip header
        for (const line of lines) {
          if (!line.trim()) continue
          const cols = line.split(',')
          if (cols.length < 3) continue
          const [date, description, amountStr] = cols
          const amount = parseFloat(amountStr)
          if (isNaN(amount)) continue
          const info = upsertTxn.run({
            id: `guideline_${date}_${description.trim().replace(/\s+/g, '_')}`,
            date: date.trim(),
            description: description.trim(),
            amount,
          })
          if (info.changes > 0) added++
        }
      }
    })()

    res.json({ success: true, files: files.length, transactions: added })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/log', (req, res) => {
  const db = getDb()
  const logs = db.prepare('SELECT * FROM sync_log ORDER BY timestamp DESC LIMIT 50').all()
  res.json(logs)
})

export default router
