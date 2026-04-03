import http from 'http'
import { getDb } from '../db/client.js'

const BRIDGE_URL = 'http://localhost:8001'

async function bridgeGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BRIDGE_URL}${path}`, { timeout: 5000 }, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { reject(new Error(data)) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function getMockRobinhoodAccounts() {
  return [
    {
      id: 'robinhood_portfolio',
      institution: 'robinhood',
      institution_id: 'robinhood_main',
      name: 'Robinhood Brokerage',
      type: 'investment',
      subtype: 'brokerage',
      balance: 18423.55,
      available_balance: 18423.55,
      currency: 'USD',
    },
  ]
}

function getMockRobinhoodTransactions() {
  return [
    {
      id: 'rh_tx_1',
      account_id: 'robinhood_portfolio',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      description: 'Buy AAPL',
      merchant: 'Robinhood',
      amount: -1842.40,
      currency: 'USD',
      category: 'Investments',
      category_confidence: 1,
      source: 'robinhood',
      status: 'posted',
    },
    {
      id: 'rh_tx_2',
      account_id: 'robinhood_portfolio',
      date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      description: 'Buy VOO',
      merchant: 'Robinhood',
      amount: -11362.50,
      currency: 'USD',
      category: 'Investments',
      category_confidence: 1,
      source: 'robinhood',
      status: 'posted',
    },
    {
      id: 'rh_tx_3',
      account_id: 'robinhood_portfolio',
      date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      description: 'AAPL Dividend',
      merchant: 'Apple Inc',
      amount: 14.20,
      currency: 'USD',
      category: 'Income',
      category_confidence: 1,
      source: 'robinhood',
      status: 'posted',
    },
    {
      id: 'rh_tx_4',
      account_id: 'robinhood_portfolio',
      date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      description: 'Buy NVDA',
      merchant: 'Robinhood',
      amount: -4312.50,
      currency: 'USD',
      category: 'Investments',
      category_confidence: 1,
      source: 'robinhood',
      status: 'posted',
    },
  ]
}

export async function syncRobinhood() {
  const db = getDb()
  const upsertAccount = db.prepare(`
    INSERT OR REPLACE INTO accounts (id, institution, institution_id, name, type, subtype, balance, available_balance, currency, last_synced)
    VALUES (@id, @institution, @institution_id, @name, @type, @subtype, @balance, @available_balance, @currency, datetime('now'))
  `)
  const upsertTxn = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, account_id, date, description, merchant, amount, currency, category, category_confidence, source, status)
    VALUES (@id, @account_id, @date, @description, @merchant, @amount, @currency, @category, @category_confidence, @source, @status)
  `)

  try {
    const [portfolio, positions, txns] = await Promise.all([
      bridgeGet('/portfolio'),
      bridgeGet('/positions'),
      bridgeGet('/transactions'),
    ])

    let added = 0
    db.transaction(() => {
      upsertAccount.run({
        id: 'robinhood_portfolio',
        institution: 'robinhood',
        institution_id: 'robinhood_main',
        name: 'Robinhood Brokerage',
        type: 'investment',
        subtype: 'brokerage',
        balance: portfolio.total_value || 0,
        available_balance: portfolio.buying_power || 0,
        currency: 'USD',
      })
      if (Array.isArray(txns)) {
        for (const tx of txns) {
          const info = upsertTxn.run({
            id: `robinhood_${tx.id}`,
            account_id: 'robinhood_portfolio',
            date: tx.date,
            description: tx.description,
            merchant: 'Robinhood',
            amount: tx.amount,
            currency: 'USD',
            category: 'Investments',
            category_confidence: 0.9,
            source: 'robinhood',
            status: 'posted',
          })
          if (info.changes > 0) added++
        }
      }
    })()
    return { source: 'robinhood', mock: false, transactions: added }
  } catch {
    // Bridge unavailable — use mock
    const mockAccounts = getMockRobinhoodAccounts()
    const mockTxns = getMockRobinhoodTransactions()
    let added = 0
    db.transaction(() => {
      for (const acc of mockAccounts) upsertAccount.run(acc)
      for (const tx of mockTxns) {
        const info = upsertTxn.run(tx)
        if (info.changes > 0) added++
      }
    })()
    return { source: 'robinhood', mock: true, accounts: mockAccounts.length, transactions: added }
  }
}
