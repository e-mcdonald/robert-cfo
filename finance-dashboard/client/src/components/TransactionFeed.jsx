import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransactions } from '../hooks/useTransactions'
import api from '../lib/api'

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Transportation': '#60a5fa',
  'Shopping': '#a78bfa',
  'Entertainment': '#f87171',
  'Health & Fitness': '#34d399',
  'Utilities': '#64748b',
  'Income': '#00d4aa',
  'Transfers': '#8892a4',
  'Crypto': '#c084fc',
  'Investments': '#38bdf8',
  'Subscriptions': '#fb7185',
  'Housing': '#fbbf24',
  'Other': '#4a5568',
}

const CATEGORIES = Object.keys(CATEGORY_COLORS)

function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || '#4a5568'
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: `${color}22`, color,
    }}>
      {category || 'Uncategorized'}
    </span>
  )
}

function TransactionDrawer({ tx, onClose, onCategoryUpdate }) {
  const [cat, setCat] = useState(tx.category || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await api.patch(`/transactions/${tx.id}/category`, { category: cat })
    onCategoryUpdate(tx.id, cat)
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 360,
        background: '#161922', borderLeft: '1px solid #252d3d', zIndex: 100,
        padding: 32, display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>Transaction</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8892a4', fontSize: 20 }}>✕</button>
      </div>
      <div>
        <div style={{ fontSize: 24, fontFamily: 'DM Mono', fontWeight: 500, color: tx.amount < 0 ? '#f87171' : '#34d399' }}>
          {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
        </div>
        <div style={{ fontSize: 18, marginTop: 4, color: '#f0f2f7' }}>{tx.merchant || tx.description}</div>
        <div style={{ color: '#8892a4', marginTop: 4, fontSize: 13 }}>{tx.date}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
        <select
          value={cat}
          onChange={e => setCat(e.target.value)}
          style={{
            background: '#0d0f14', border: '1px solid #252d3d', borderRadius: 8,
            color: '#f0f2f7', padding: '10px 12px', fontSize: 14,
          }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Source</div>
        <div style={{ color: '#8892a4', fontSize: 14 }}>{tx.source}</div>
      </div>
      <button
        onClick={save}
        disabled={saving}
        style={{
          marginTop: 'auto', background: '#00d4aa', color: '#0d0f14', border: 'none',
          borderRadius: 10, padding: '12px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14,
        }}
      >
        {saving ? 'Saving…' : 'Save Category'}
      </button>
    </motion.div>
  )
}

export default function TransactionFeed({ limit = 10 }) {
  const { transactions, loading, refetch } = useTransactions({ limit })
  const [selected, setSelected] = useState(null)

  const handleCategoryUpdate = (id, category) => {
    refetch()
  }

  if (loading) {
    return (
      <div style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}>
        <div className="skeleton" style={{ height: 16, width: 120, marginBottom: 20 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div className="skeleton" style={{ height: 52, width: '100%' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Syne, sans-serif', marginBottom: 20 }}>
          Recent Transactions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(tx)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px',
                borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e2330'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: '#252d3d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {(tx.merchant || tx.description)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f0f2f7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.merchant || tx.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <CategoryBadge category={tx.category} />
                  <span style={{ fontSize: 11, color: '#4a5568' }}>{tx.date}</span>
                </div>
              </div>
              <div style={{
                fontFamily: 'DM Mono', fontSize: 14, fontWeight: 500,
                color: tx.amount < 0 ? '#f87171' : '#34d399', flexShrink: 0,
              }}>
                {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
            />
            <TransactionDrawer
              tx={selected}
              onClose={() => setSelected(null)}
              onCategoryUpdate={handleCategoryUpdate}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
