import { Router } from 'express'
import { getDb } from '../db/client.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDb()
  const {
    account_id, category, source, start_date, end_date, search,
    page = 1, limit = 50,
  } = req.query

  let where = []
  let params = []

  if (account_id) { where.push('account_id = ?'); params.push(account_id) }
  if (category) { where.push('category = ?'); params.push(category) }
  if (source) { where.push('source = ?'); params.push(source) }
  if (start_date) { where.push('date >= ?'); params.push(start_date) }
  if (end_date) { where.push('date <= ?'); params.push(end_date) }
  if (search) { where.push('(description LIKE ? OR merchant LIKE ?)'); params.push(`%${search}%`, `%${search}%`) }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const total = db.prepare(`SELECT COUNT(*) as count FROM transactions ${whereClause}`).get(...params).count
  const transactions = db.prepare(
    `SELECT * FROM transactions ${whereClause} ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, parseInt(limit), offset)

  res.json({ transactions, total, page: parseInt(page), limit: parseInt(limit) })
})

router.get('/summary', (req, res) => {
  const db = getDb()

  // Weekly spending (last 8 weeks)
  const weekly = db.prepare(`
    SELECT
      strftime('%Y-W%W', date) as week,
      SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spending,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income
    FROM transactions
    WHERE date >= date('now', '-56 days')
    GROUP BY week
    ORDER BY week ASC
  `).all()

  // Monthly spending (last 6 months)
  const monthly = db.prepare(`
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spending,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income
    FROM transactions
    WHERE date >= date('now', '-180 days')
    GROUP BY month
    ORDER BY month ASC
  `).all()

  // Top categories
  const topCategories = db.prepare(`
    SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count
    FROM transactions
    WHERE amount < 0 AND date >= date('now', '-30 days') AND category IS NOT NULL
    GROUP BY category
    ORDER BY total DESC
    LIMIT 8
  `).all()

  res.json({ weekly, monthly, topCategories })
})

router.patch('/:id/category', (req, res) => {
  const db = getDb()
  const { category } = req.body
  if (!category) return res.status(400).json({ error: 'category required' })
  db.prepare('UPDATE transactions SET category = ?, category_confidence = 1 WHERE id = ?').run(category, req.params.id)
  res.json({ success: true })
})

export default router
