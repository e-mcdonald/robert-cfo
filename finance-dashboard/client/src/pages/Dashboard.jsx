import { useState } from 'react'
import { motion } from 'framer-motion'
import NetWorthCard from '../components/NetWorthCard'
import SpendingChart from '../components/SpendingChart'
import TransactionFeed from '../components/TransactionFeed'
import AccountCard from '../components/AccountCard'
import ConnectBankModal from '../components/ConnectBankModal'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactionSummary } from '../hooks/useTransactions'

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

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function Dashboard() {
  const [showConnect, setShowConnect] = useState(false)
  const { accounts, loading: accountsLoading, refetch } = useAccounts()
  const { summary } = useTransactionSummary()

  return (
    <div style={{ padding: '32px 32px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: '#f0f2f7', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ color: '#4a5568', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowConnect(true)}
          style={{
            background: 'transparent', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)',
            borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          + Connect Bank
        </button>
      </motion.div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <NetWorthCard />
          <AccountCard accounts={accounts} loading={accountsLoading} />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SpendingChart />

          {/* Top Categories */}
          {summary?.topCategories?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Syne', marginBottom: 20 }}>
                Top Spending (30d)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summary.topCategories.map((cat, i) => {
                  const maxVal = summary.topCategories[0].total
                  const color = CATEGORY_COLORS[cat.category] || '#4a5568'
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                        <span style={{ color: '#8892a4' }}>{cat.category}</span>
                        <span style={{ fontFamily: 'DM Mono', color: '#f0f2f7' }}>{fmt(cat.total)}</span>
                      </div>
                      <div style={{ height: 4, background: '#252d3d', borderRadius: 2 }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.total / maxVal) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                          style={{ height: '100%', background: color, borderRadius: 2 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          <TransactionFeed limit={8} />
        </div>
      </div>

      {showConnect && (
        <ConnectBankModal
          onClose={() => setShowConnect(false)}
          onSuccess={() => { setShowConnect(false); refetch() }}
        />
      )}
    </div>
  )
}
