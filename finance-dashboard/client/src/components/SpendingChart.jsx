import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTransactionSummary } from '../hooks/useTransactions'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function formatLabel(str, view) {
  if (view === 'weekly') {
    // "2024-W12" → "W12"
    return str?.split('-W')[1] ? `W${str.split('-W')[1]}` : str
  }
  // "2024-03" → "Mar"
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const parts = str?.split('-')
  return parts?.[1] ? months[parseInt(parts[1]) - 1] : str
}

export default function SpendingChart() {
  const [view, setView] = useState('monthly')
  const { summary, loading } = useTransactionSummary()

  if (loading) {
    return (
      <div style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d', height: 340 }}>
        <div className="skeleton" style={{ height: 16, width: 140, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 260, width: '100%' }} />
      </div>
    )
  }

  const rawData = view === 'weekly' ? (summary?.weekly || []) : (summary?.monthly || [])
  const chartData = rawData.map(d => ({
    label: formatLabel(d.week || d.month, view),
    Spending: Math.round(d.spending),
    Income: Math.round(d.income),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Syne, sans-serif', color: '#f0f2f7' }}>
          Cash Flow
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['weekly', 'monthly'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: view === v ? 'rgba(0,212,170,0.15)' : 'transparent',
                color: view === v ? '#00d4aa' : '#4a5568',
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={4} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="#252d3d" strokeDasharray="0" />
          <XAxis dataKey="label" tick={{ fill: '#4a5568', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#1e2330', border: '1px solid #252d3d', borderRadius: 8, fontSize: 12 }}
            formatter={(v, name) => [fmt(v), name]}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Bar dataKey="Spending" fill="#fb923c" radius={[4, 4, 0, 0]} opacity={0.85} />
          <Bar dataKey="Income" fill="#00d4aa" radius={[4, 4, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
