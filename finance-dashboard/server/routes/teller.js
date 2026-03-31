import { Router } from 'express'
import { getDb } from '../db/client.js'
import { encrypt } from '../services/encrypt.js'

const router = Router()

router.post('/enroll', (req, res) => {
  const { accessToken, enrollment } = req.body
  if (!accessToken) return res.status(400).json({ error: 'accessToken required' })

  const db = getDb()
  const encToken = encrypt(accessToken)
  const id = `teller_${enrollment?.id || Date.now()}`

  db.prepare(`
    INSERT OR REPLACE INTO accounts (id, institution, institution_id, name, type, access_token_enc, enrollment_id, is_active)
    VALUES (?, 'teller', ?, ?, 'checking', ?, ?, 1)
  `).run(
    id,
    enrollment?.institution?.id || 'unknown',
    enrollment?.institution?.name || 'Bank Account',
    encToken,
    enrollment?.id || null
  )

  res.json({ success: true, accountId: id })
})

router.get('/app-id', (req, res) => {
  res.json({ appId: process.env.TELLER_APP_ID || '', env: process.env.TELLER_ENV || 'sandbox' })
})

export default router
