import { motion } from 'framer-motion'

const INSTITUTION_COLORS = {
  teller: '#00d4aa',
  gemini: '#00d2ff',
  robinhood: '#00c805',
  guideline: '#7c3aed',
}

const INSTITUTION_LABELS = {
  rbfcu: 'RBFCU',
  capital_one: 'Capital One',
  discover: 'Discover',
  gemini: 'Gemini',
  robinhood_main: 'Robinhood',
  guideline_401k: 'Guideline',
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function AccountRow({ account, delay }) {
  const isCredit = account.type === 'credit'
  const color = INSTITUTION_COLORS[account.institution] || '#8892a4'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        borderRadius: 10, marginBottom: 4, border: '1px solid #252d3d',
        background: '#0d0f14',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color, flexShrink: 0,
      }}>
        {account.name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#f0f2f7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {account.name}
        </div>
        <div style={{ fontSize: 11, color: '#4a5568', textTransform: 'capitalize', marginTop: 1 }}>
          {account.type} · {account.institution}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'DM Mono', fontSize: 14, fontWeight: 500,
          color: isCredit ? '#f59e0b' : '#f0f2f7',
        }}>
          {fmt(account.balance)}
        </div>
        {account.last_synced && (
          <div style={{ fontSize: 10, color: '#4a5568', marginTop: 1 }}>
            {new Date(account.last_synced).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function AccountCard({ accounts, loading }) {
  if (loading) {
    return (
      <div style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}>
        <div className="skeleton" style={{ height: 16, width: 100, marginBottom: 20 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 62, width: '100%', marginBottom: 8 }} />
        ))}
      </div>
    )
  }

  const grouped = accounts.reduce((acc, a) => {
    const key = a.institution
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Syne, sans-serif', marginBottom: 20 }}>
        Accounts
      </div>
      {Object.entries(grouped).map(([inst, accs], gi) => (
        <div key={inst} style={{ marginBottom: gi < Object.keys(grouped).length - 1 ? 16 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>
            {inst.charAt(0).toUpperCase() + inst.slice(1)}
          </div>
          {accs.map((acc, i) => (
            <AccountRow key={acc.id} account={acc} delay={gi * 0.1 + i * 0.05} />
          ))}
        </div>
      ))}
    </motion.div>
  )
}
