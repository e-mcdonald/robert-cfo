import { getDb } from '../db/client.js'
import { syncTeller } from './teller.js'
import { syncGemini } from './gemini.js'
import { syncRobinhood } from './robinhood.js'
import { categorizeUncategorized } from './categorize.js'

async function logSync(source, status, recordsAdded, errorMessage, durationMs) {
  const db = getDb()
  db.prepare(`
    INSERT INTO sync_log (source, status, records_added, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?)
  `).run(source, status, recordsAdded, errorMessage, durationMs)
}

async function snapshotNetWorth() {
  const db = getDb()
  const accounts = db.prepare('SELECT * FROM accounts WHERE is_active = 1').all()

  let checking = 0, savings = 0, crypto = 0, investments = 0, retirement = 0, credit = 0

  for (const acc of accounts) {
    switch (acc.type) {
      case 'checking': checking += acc.balance; break
      case 'savings': savings += acc.balance; break
      case 'crypto': crypto += acc.balance; break
      case 'investment': investments += acc.balance; break
      case 'retirement': retirement += acc.balance; break
      case 'credit': credit += acc.balance; break
    }
  }

  const totalAssets = checking + savings + crypto + investments + retirement + Math.max(0, credit)
  const totalLiabilities = Math.abs(Math.min(0, credit))
  const netWorth = totalAssets - totalLiabilities

  db.prepare(`
    INSERT INTO net_worth_snaps (total_assets, total_liabilities, net_worth, breakdown_json)
    VALUES (?, ?, ?, ?)
  `).run(
    totalAssets,
    totalLiabilities,
    netWorth,
    JSON.stringify({ checking, savings, crypto, investments, retirement, credit })
  )

  return { totalAssets, totalLiabilities, netWorth }
}

export async function syncAll() {
  const results = []

  for (const [source, fn] of [['teller', syncTeller], ['gemini', syncGemini], ['robinhood', syncRobinhood]]) {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      await logSync(source, 'success', result.transactions || 0, null, duration)
      results.push({ ...result, duration })
    } catch (err) {
      const duration = Date.now() - start
      await logSync(source, 'error', 0, err.message, duration)
      results.push({ source, error: err.message })
    }
  }

  // Categorize after all syncs
  try {
    const catResult = await categorizeUncategorized()
    results.push({ source: 'categorize', ...catResult })
  } catch (err) {
    results.push({ source: 'categorize', error: err.message })
  }

  // Snapshot net worth
  const nwSnap = await snapshotNetWorth()
  results.push({ source: 'networth', ...nwSnap })

  return results
}

export { snapshotNetWorth }
