import { createHmac } from 'crypto'
import https from 'https'
import { getDb } from '../db/client.js'

const GEMINI_BASE = 'https://api.gemini.com'

function sign(endpoint, payload, apiSecret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = createHmac('sha384', apiSecret).update(encodedPayload).digest('hex')
  return { encodedPayload, signature }
}

async function geminiPrivate(endpoint, apiKey, apiSecret) {
  const nonce = Date.now().toString()
  const payload = { request: endpoint, nonce }
  const { encodedPayload, signature } = sign(endpoint, payload, apiSecret)

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.gemini.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-GEMINI-APIKEY': apiKey,
        'X-GEMINI-PAYLOAD': encodedPayload,
        'X-GEMINI-SIGNATURE': signature,
        'Cache-Control': 'no-cache',
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { reject(new Error(data)) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// --- Mock Data ---
function getMockGeminiAccounts() {
  return [
    {
      id: 'gemini_btc',
      institution: 'gemini',
      institution_id: 'gemini_btc',
      name: 'Gemini BTC',
      type: 'crypto',
      subtype: 'bitcoin',
      balance: 0.42 * 67800,
      available_balance: 0.42 * 67800,
      currency: 'USD',
    },
    {
      id: 'gemini_eth',
      institution: 'gemini',
      institution_id: 'gemini_eth',
      name: 'Gemini ETH',
      type: 'crypto',
      subtype: 'ethereum',
      balance: 2.85 * 3420,
      available_balance: 2.85 * 3420,
      currency: 'USD',
    },
    {
      id: 'gemini_usd',
      institution: 'gemini',
      institution_id: 'gemini_usd',
      name: 'Gemini USD',
      type: 'crypto',
      subtype: 'usd',
      balance: 1240.00,
      available_balance: 1240.00,
      currency: 'USD',
    },
  ]
}

function getMockGeminiTransactions() {
  return [
    {
      id: 'gemini_tx_1',
      account_id: 'gemini_btc',
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      description: 'Buy BTC',
      merchant: 'Gemini Exchange',
      amount: -2000,
      currency: 'USD',
      category: 'Crypto',
      category_confidence: 1,
      source: 'gemini',
      status: 'posted',
    },
    {
      id: 'gemini_tx_2',
      account_id: 'gemini_eth',
      date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      description: 'Buy ETH',
      merchant: 'Gemini Exchange',
      amount: -1500,
      currency: 'USD',
      category: 'Crypto',
      category_confidence: 1,
      source: 'gemini',
      status: 'posted',
    },
    {
      id: 'gemini_tx_3',
      account_id: 'gemini_btc',
      date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      description: 'Sell BTC',
      merchant: 'Gemini Exchange',
      amount: 3200,
      currency: 'USD',
      category: 'Crypto',
      category_confidence: 1,
      source: 'gemini',
      status: 'posted',
    },
  ]
}

export async function syncGemini() {
  const db = getDb()
  const apiKey = process.env.GEMINI_API_KEY
  const apiSecret = process.env.GEMINI_API_SECRET

  const upsertAccount = db.prepare(`
    INSERT OR REPLACE INTO accounts (id, institution, institution_id, name, type, subtype, balance, available_balance, currency, last_synced)
    VALUES (@id, @institution, @institution_id, @name, @type, @subtype, @balance, @available_balance, @currency, datetime('now'))
  `)
  const upsertTxn = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, account_id, date, description, merchant, amount, currency, category, category_confidence, source, status)
    VALUES (@id, @account_id, @date, @description, @merchant, @amount, @currency, @category, @category_confidence, @source, @status)
  `)

  if (!apiKey || !apiSecret) {
    const mockAccounts = getMockGeminiAccounts()
    const mockTxns = getMockGeminiTransactions()
    let added = 0
    db.transaction(() => {
      for (const acc of mockAccounts) upsertAccount.run(acc)
      for (const tx of mockTxns) {
        const info = upsertTxn.run(tx)
        if (info.changes > 0) added++
      }
    })()
    return { source: 'gemini', mock: true, accounts: mockAccounts.length, transactions: added }
  }

  try {
    const balances = await geminiPrivate('/v1/balances', apiKey, apiSecret)
    const trades = await geminiPrivate('/v1/mytrades', apiKey, apiSecret)

    let added = 0
    db.transaction(() => {
      if (Array.isArray(balances)) {
        for (const b of balances) {
          if (parseFloat(b.amount) > 0) {
            upsertAccount.run({
              id: `gemini_${b.currency.toLowerCase()}`,
              institution: 'gemini',
              institution_id: `gemini_${b.currency.toLowerCase()}`,
              name: `Gemini ${b.currency}`,
              type: 'crypto',
              subtype: b.currency.toLowerCase(),
              balance: parseFloat(b.amount),
              available_balance: parseFloat(b.available),
              currency: b.currency,
            })
          }
        }
      }
      if (Array.isArray(trades)) {
        for (const t of trades) {
          const info = upsertTxn.run({
            id: `gemini_${t.tid}`,
            account_id: `gemini_${t.symbol.replace('usd', '').toLowerCase()}`,
            date: new Date(t.timestamp * 1000).toISOString().split('T')[0],
            description: `${t.type} ${t.symbol.toUpperCase()}`,
            merchant: 'Gemini Exchange',
            amount: t.type === 'Buy' ? -parseFloat(t.amount) : parseFloat(t.amount),
            currency: 'USD',
            category: 'Crypto',
            category_confidence: 1,
            source: 'gemini',
            status: 'posted',
          })
          if (info.changes > 0) added++
        }
      }
    })()
    return { source: 'gemini', mock: false, transactions: added }
  } catch (err) {
    console.error('Gemini sync error:', err.message)
    return { source: 'gemini', error: err.message }
  }
}
