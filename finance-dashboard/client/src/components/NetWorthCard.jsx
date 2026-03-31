import { motion } from 'framer-motion'
import { useNetWorth, useCountUp } from '../hooks/useNetWorth'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function NetWorthCard() {
  const { netWorth, history, loading } = useNetWorth()
  const animated = useCountUp(netWorth?.net_worth ?? 0, 1800)

  if (loading) {
    return (
      <div style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}>
        <div className="skeleton" style={{ height: 16, width: 120, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 48, width: 200, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 60, width: '100%' }} />
      </div>
    )
  }

  const breakdown = netWorth?.breakdown_json ? JSON.parse(netWorth.breakdown_json) : {}
  const totalAssets = netWorth?.total_assets || 0
  const totalLiabilities = netWorth?.total_liabilities || 0

  const sparkData = history.length > 1
    ? history.map((h, i) => ({ i, value: h.net_worth }))
    : Array.from({ length: 10 }, (_, i) => ({ i, value: (netWorth?.net_worth || 47000) + (i - 5) * 800 + Math.random() * 500 }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Net Worth
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 42, fontWeight: 500, color: '#f0f2f7', letterSpacing: '-1px', marginBottom: 4 }}>
        {fmt(animated)}
      </div>
      <div style={{ fontSize: 13, color: '#34d399', marginBottom: 20 }}>
        ↑ Assets {fmt(totalAssets)} · Liabilities {fmt(totalLiabilities)}
      </div>

      {/* Sparkline */}
      <div style={{ height: 64, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#00d4aa" strokeWidth={2} fill="url(#tealGrad)" dot={false} />
            <Tooltip
              contentStyle={{ background: '#1e2330', border: '1px solid #252d3d', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [fmt(v), 'Net Worth']}
              labelFormatter={() => ''}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Banking', value: (breakdown.checking || 0) + (breakdown.savings || 0), color: '#00d4aa' },
          { label: 'Investments', value: breakdown.investments || 0, color: '#60a5fa' },
          { label: 'Crypto', value: breakdown.crypto || 0, color: '#a78bfa' },
          { label: 'Retirement', value: breakdown.retirement || 0, color: '#34d399' },
          { label: 'Credit', value: Math.abs(breakdown.credit || 0), color: '#f87171', negative: true },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#8892a4' }}>{item.label}</span>
              <span style={{ fontFamily: 'DM Mono', color: item.negative ? '#f87171' : '#f0f2f7' }}>
                {item.negative ? '-' : ''}{fmt(item.value)}
              </span>
            </div>
            <div style={{ height: 4, background: '#252d3d', borderRadius: 2 }}>
              <div style={{
                height: '100%',
                width: `${Math.min((item.value / totalAssets) * 100, 100)}%`,
                background: item.color,
                borderRadius: 2,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
