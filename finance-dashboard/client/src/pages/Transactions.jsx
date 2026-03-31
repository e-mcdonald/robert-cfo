import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTransactions } from '../hooks/useTransactions'
import api from '../lib/api'

const CATEGORIES = [
  'All', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Health & Fitness', 'Utilities', 'Income', 'Transfers', 'Crypto',
  'Investments', 'Subscriptions', 'Housing', 'Other',
]

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b', 'Transportation': '#60a5fa', 'Shopping': '#a78bfa',
  'Entertainment': '#f87171', 'Health & Fitness': '#34d399', 'Utilities': '#64748b',
  'Income': '#00d4aa', 'Transfers': '#8892a4', 'Crypto': '#c084fc',
  'Investments': '#38bdf8', 'Subscriptions': '#fb7185', 'Housing': '#fbbf24', 'Other': '#4a5568',
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
}

export default function Transactions() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { transactions, total, loading } = useTransactions({
    search: search || undefined,
    category: category || undefined,
    page,
    limit: 25,
  })

  const totalPages = Math.ceil(total / 25)

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, marginBottom: 24 }}
      >
        Transactions
      </motion.h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            background: '#161922', border: '1px solid #252d3d', borderRadius: 10, color: '#f0f2f7',
            padding: '10px 16px', fontSize: 14, width: 240, outline: 'none',
          }}
        />
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1) }}
          style={{
            background: '#161922', border: '1px solid #252d3d', borderRadius: 10, color: category ? '#f0f2f7' : '#4a5568',
            padding: '10px 16px', fontSize: 14, outline: 'none', cursor: 'pointer',
          }}
        >
          {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#4a5568', alignSelf: 'center' }}>
          {total} transactions
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: '#161922', borderRadius: 16, border: '1px solid #252d3d', overflow: 'hidden' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
          {/* Header */}
          {['Transaction', 'Category', 'Date', 'Amount'].map((h) => (
            <div key={h} style={{ padding: '14px 20px', fontSize: 11, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #252d3d' }}>
              {h}
            </div>
          ))}

          {/* Rows */}
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ gridColumn: '1 / -1', padding: '12px 20px', borderBottom: '1px solid #252d3d' }}>
                <div className="skeleton" style={{ height: 40 }} />
              </div>
            ))
          ) : (
            transactions.map((tx, i) => (
              <>
                <div key={`${tx.id}-name`} style={{ padding: '14px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#252d3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                    {(tx.merchant || tx.description)[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#f0f2f7' }}>{tx.merchant || tx.description}</div>
                    <div style={{ fontSize: 11, color: '#4a5568' }}>{tx.source}</div>
                  </div>
                </div>
                <div key={`${tx.id}-cat`} style={{ padding: '14px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', alignItems: 'center' }}>
                  {tx.category && (
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      background: `${CATEGORY_COLORS[tx.category] || '#4a5568'}22`,
                      color: CATEGORY_COLORS[tx.category] || '#4a5568',
                    }}>
                      {tx.category}
                    </span>
                  )}
                </div>
                <div key={`${tx.id}-date`} style={{ padding: '14px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', alignItems: 'center', fontSize: 13, color: '#8892a4', fontFamily: 'DM Mono' }}>
                  {tx.date}
                </div>
                <div key={`${tx.id}-amt`} style={{ padding: '14px 20px', borderBottom: '1px solid #1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: 'DM Mono', fontSize: 14, fontWeight: 500, color: tx.amount < 0 ? '#f87171' : '#34d399' }}>
                  {tx.amount < 0 ? '-' : '+'}{fmt(tx.amount)}
                </div>
              </>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ background: '#252d3d', border: 'none', color: '#8892a4', borderRadius: 8, padding: '6px 14px', cursor: page > 1 ? 'pointer' : 'default', fontSize: 13 }}
            >
              ← Prev
            </button>
            <span style={{ color: '#4a5568', fontSize: 13, display: 'flex', alignItems: 'center' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ background: '#252d3d', border: 'none', color: '#8892a4', borderRadius: 8, padding: '6px 14px', cursor: page < totalPages ? 'pointer' : 'default', fontSize: 13 }}
            >
              Next →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
