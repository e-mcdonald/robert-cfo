import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { to: '/transactions', label: 'Transactions', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )},
  { to: '/accounts', label: 'Accounts', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )},
  { to: '/settings', label: 'Settings', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )},
]

const SOURCES = [
  { key: 'teller', label: 'Teller', color: '#00d4aa' },
  { key: 'gemini', label: 'Gemini', color: '#00d4aa' },
  { key: 'robinhood', label: 'Robinhood', color: '#f59e0b' },
  { key: 'guideline', label: 'Guideline', color: '#8892a4' },
]

export default function Sidebar() {
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#0d0f14', borderRight: '1px solid #252d3d', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#00d4aa', letterSpacing: '-0.5px' }}>
          Ledger
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 4,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? '#00d4aa' : '#8892a4',
              background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Connection Status */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #252d3d' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Data Sources
        </div>
        {SOURCES.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#8892a4' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
