import Anthropic from '@anthropic-ai/sdk'
import { getDb } from '../db/client.js'

const CATEGORIES = [
  'Housing', 'Food & Dining', 'Transportation', 'Shopping',
  'Entertainment', 'Health & Fitness', 'Utilities', 'Income',
  'Transfers', 'Crypto', 'Investments', 'Subscriptions', 'Other',
]

const BATCH_SIZE = 50

export async function categorizeUncategorized() {
  const db = getDb()
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Mark all uncategorized as 'Other'
    db.prepare(
      "UPDATE transactions SET category = 'Other', category_confidence = 0 WHERE category IS NULL"
    ).run()
    return { categorized: 0, fallback: true }
  }

  const client = new Anthropic({ apiKey })
  const uncategorized = db.prepare(
    "SELECT id, description, merchant, amount FROM transactions WHERE category IS NULL LIMIT ?"
  ).all(BATCH_SIZE)

  if (uncategorized.length === 0) return { categorized: 0 }

  const prompt = `Categorize these financial transactions. Return ONLY a JSON array with no markdown, no explanation.
Categories: ${CATEGORIES.join(', ')}

Transactions:
${uncategorized.map((t) => `{"id":"${t.id}","description":"${t.description}","merchant":"${t.merchant || ''}","amount":${t.amount}}`).join('\n')}

Return format: [{"id":"...","category":"...","confidence":0.0-1.0}]`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    let text = response.content[0].text.trim()
    // Strip markdown fences
    text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()

    const results = JSON.parse(text)
    const updateStmt = db.prepare(
      "UPDATE transactions SET category = @category, category_confidence = @confidence WHERE id = @id"
    )

    db.transaction(() => {
      for (const r of results) {
        updateStmt.run({ id: r.id, category: r.category, confidence: r.confidence })
      }
    })()

    return { categorized: results.length }
  } catch (err) {
    console.error('Categorization error:', err.message)
    // Fallback
    db.prepare(
      "UPDATE transactions SET category = 'Other', category_confidence = 0 WHERE category IS NULL"
    ).run()
    return { categorized: 0, error: err.message }
  }
}
