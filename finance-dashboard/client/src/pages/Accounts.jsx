import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccounts } from '../hooks/useAccounts'
import ConnectBankModal from '../components/ConnectBankModal'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const TYPE_ICONS = {
  checking: '🏦', savings: '💰', credit: '💳', investment: '📈', crypto: '₿', retirement: '🏛️',
}
const INSTITUTION_COLORS = {
  teller: '#00d4aa', gemini: '#00d2ff', robinhood: '#00c805', guideline: '#7c3aed',
}

export default function Accounts() {
  const { accounts, loading, refetch } = useAccounts()
  const [showConnect, setShowConnect] = useState(false)

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0)
  const assets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0)
  const liabilities = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0)

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}
        >
          Accounts
        </motion.h1>
        <button
          onClick={() => setShowConnect(true)}
          style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          + Connect Bank
        </button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Balance', value: totalBalance, color: '#f0f2f7' },
          { label: 'Total Assets', value: assets, color: '#34d399' },
          { label: 'Total Liabilities', value: liabilities, color: '#f59e0b' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ background: '#161922', borderRadius: 14, padding: 20, border: '1px solid #252d3d' }}
          >
            <div style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontFamily: 'DM Mono', fontSize: 24, fontWeight: 500, color: item.color }}>{fmt(item.value)}</div>
          </motion.div>
        ))}
      </div>

      {/* Account list */}
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14, marginBottom: 12 }} />
        ))
      ) : (
        accounts.map((acc, i) => {
          const color = INSTITUTION_COLORS[acc.institution] || '#8892a4'
          return (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: '#161922', borderRadius: 14, padding: '18px 24px',
                border: '1px solid #252d3d', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 16,
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12, background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                {TYPE_ICONS[acc.type] || '💼'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#f0f2f7' }}>{acc.name}</div>
                <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2, textTransform: 'capitalize' }}>
                  {acc.institution} · {acc.type} {acc.subtype ? `· ${acc.subtype}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 18, fontWeight: 500, color: acc.type === 'credit' ? '#f59e0b' : '#f0f2f7' }}>
                  {fmt(acc.balance)}
                </div>
                {acc.last_synced && (
                  <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                    Synced {new Date(acc.last_synced).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })
      )}

      {showConnect && (
        <ConnectBankModal
          onClose={() => setShowConnect(false)}
          onSuccess={() => { setShowConnect(false); refetch() }}
        />
      )}
    </div>
  )
}
