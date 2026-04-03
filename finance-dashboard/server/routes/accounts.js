import { Router } from 'express'
import { getDb } from '../db/client.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDb()
  const accounts = db.prepare('SELECT * FROM accounts WHERE is_active = 1 ORDER BY institution, name').all()
  res.json(accounts)
})

router.get('/:id', (req, res) => {
  const db = getDb()
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id)
  if (!account) return res.status(404).json({ error: 'Account not found' })
  res.json(account)
})

router.delete('/:id', (req, res) => {
  const db = getDb()
  db.prepare('UPDATE accounts SET is_active = 0 WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
