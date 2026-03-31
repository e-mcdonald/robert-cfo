import https from 'https'
import { readFileSync, existsSync } from 'fs'
import { getDb } from '../db/client.js'
import { decrypt } from './encrypt.js'

const TELLER_BASE = 'https://api.teller.io'
const TELLER_ENV = process.env.TELLER_ENV || 'sandbox'

function getMTLSAgent() {
  const certPath = process.env.TELLER_CERT_PATH
  const keyPath = process.env.TELLER_KEY_PATH
  if (certPath && keyPath && existsSync(certPath) && existsSync(keyPath)) {
    return new https.Agent({
      cert: readFileSync(certPath),
      key: readFileSync(keyPath),
    })
  }
  return null
}

async function tellerRequest(path, accessToken) {
  const agent = getMTLSAgent()
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.teller.io',
      path,
      method: 'GET',
      auth: `${accessToken}:`,
      agent: agent || undefined,
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          reject(new Error(`Invalid JSON: ${data}`))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// --- Mock Data ---
function getMockAccounts() {
  return [
    {
      id: 'teller_mock_checking',
      institution: 'teller',
      institution_id: 'rbfcu',
      name: 'RBFCU Checking',
      type: 'checking',
      subtype: 'checking',
      balance: 4823.47,
      available_balance: 4823.47,
      currency: 'USD',
    },
    {
      id: 'teller_mock_savings',
      institution: 'teller',
      institution_id: 'rbfcu',
      name: 'RBFCU Savings',
      type: 'savings',
      subtype: 'savings',
      balance: 12547.82,
      available_balance: 12547.82,
      currency: 'USD',
    },
    {
      id: 'teller_mock_cap1',
      institution: 'teller',
      institution_id: 'capital_one',
      name: 'Capital One Quicksilver',
      type: 'credit',
      subtype: 'credit_card',
      balance: -643.21,
      available_balance: 5356.79,
      currency: 'USD',
    },
    {
      id: 'teller_mock_discover',
      institution: 'teller',
      institution_id: 'discover',
      name: 'Discover it',
      type: 'credit',
      subtype: 'credit_card',
      balance: -410.55,
      available_balance: 9589.45,
      currency: 'USD',
    },
  ]
}

function getMockTransactions() {
  const merchants = [
    { name: 'HEB', category: 'Food & Dining', amount: -87.43 },
    { name: 'Netflix', category: 'Subscriptions', amount: -15.49 },
    { name: 'Shell', category: 'Transportation', amount: -52.10 },
    { name: 'Chipotle', category: 'Food & Dining', amount: -12.75 },
    { name: 'Amazon', category: 'Shopping', amount: -43.99 },
    { name: 'Starbucks', category: 'Food & Dining', amount: -6.85 },
    { name: 'Planet Fitness', category: 'Health & Fitness', amount: -24.99 },
    { name: 'Spotify', category: 'Subscriptions', amount: -9.99 },
    { name: 'Whole Foods', category: 'Food & Dining', amount: -134.22 },
    { name: 'Uber', category: 'Transportation', amount: -18.50 },
    { name: 'Austin Energy', category: 'Utilities', amount: -89.40 },
    { name: 'Costco', category: 'Shopping', amount: -187.63 },
    { name: 'Target', category: 'Shopping', amount: -67.44 },
    { name: 'Chick-fil-A', category: 'Food & Dining', amount: -14.88 },
    { name: 'Apple', category: 'Subscriptions', amount: -2.99 },
    { name: 'CVS Pharmacy', category: 'Health & Fitness', amount: -23.17 },
    { name: 'Employer Payroll', category: 'Income', amount: 3200.00 },
    { name: 'ATX Parking', category: 'Transportation', amount: -15.00 },
    { name: 'Hulu', category: 'Subscriptions', amount: -7.99 },
    { name: 'Home Depot', category: 'Shopping', amount: -94.37 },
  ]

  const accountIds = ['teller_mock_checking', 'teller_mock_cap1', 'teller_mock_discover']
  const transactions = []

  for (let i = 0; i < 60; i++) {
    const daysAgo = i % 60
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]
    const merchant = merchants[i % merchants.length]
    const accountId = merchant.category === 'Income'
      ? 'teller_mock_checking'
      : accountIds[i % accountIds.length]

    transactions.push({
      id: `teller_mock_tx_${i}`,
      account_id: accountId,
      date: dateStr,
      description: merchant.name,
      merchant: merchant.name,
      amount: merchant.amount,
      currency: 'USD',
      category: merchant.category,
      category_confidence: 0.95,
      source: 'teller',
      status: 'posted',
    })
  }

  return transactions
}

export async function syncTeller() {
  const db = getDb()
  const agent = getMTLSAgent()

  // Check for enrolled accounts in DB
  const enrolledAccounts = db.prepare(
    "SELECT * FROM accounts WHERE institution = 'teller' AND is_active = 1 AND access_token_enc IS NOT NULL"
  ).all()

  if (enrolledAccounts.length === 0 || !agent) {
    // Use mock data
    const mockAccounts = getMockAccounts()
    const mockTxns = getMockTransactions()

    const upsertAccount = db.prepare(`
      INSERT OR REPLACE INTO accounts (id, institution, institution_id, name, type, subtype, balance, available_balance, currency, last_synced)
      VALUES (@id, @institution, @institution_id, @name, @type, @subtype, @balance, @available_balance, @currency, datetime('now'))
    `)
    const upsertTxn = db.prepare(`
      INSERT OR IGNORE INTO transactions (id, account_id, date, description, merchant, amount, currency, category, category_confidence, source, status)
      VALUES (@id, @account_id, @date, @description, @merchant, @amount, @currency, @category, @category_confidence, @source, @status)
    `)

    let added = 0
    db.transaction(() => {
      for (const acc of mockAccounts) upsertAccount.run(acc)
      for (const tx of mockTxns) {
        const info = upsertTxn.run(tx)
        if (info.changes > 0) added++
      }
    })()

    return { source: 'teller', mock: true, accounts: mockAccounts.length, transactions: added }
  }

  // Real sync
  let totalAdded = 0
  const upsertTxn = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, account_id, date, description, merchant, amount, currency, category, source, status, raw_json)
    VALUES (@id, @account_id, @date, @description, @merchant, @amount, @currency, @category, @source, @status, @raw_json)
  `)

  for (const acc of enrolledAccounts) {
    try {
      const token = decrypt(acc.access_token_enc)
      const txns = await tellerRequest(`/accounts/${acc.institution_id}/transactions`, token)
      if (Array.isArray(txns)) {
        db.transaction(() => {
          for (const tx of txns) {
            const info = upsertTxn.run({
              id: `teller_${tx.id}`,
              account_id: acc.id,
              date: tx.date,
              description: tx.description,
              merchant: tx.details?.counterparty?.name || tx.description,
              amount: tx.type === 'debit' ? -Math.abs(parseFloat(tx.amount)) : Math.abs(parseFloat(tx.amount)),
              currency: 'USD',
              category: null,
              source: 'teller',
              status: tx.status,
              raw_json: JSON.stringify(tx),
            })
            if (info.changes > 0) totalAdded++
          }
        })()
      }
    } catch (err) {
      console.error(`Teller sync error for account ${acc.id}:`, err.message)
    }
  }

  return { source: 'teller', mock: false, transactions: totalAdded }
}

export { getMockAccounts, getMockTransactions }
