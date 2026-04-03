import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'

export default function SyncButton({ onSync }) {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.post('/sync/all')
      setLastSync(new Date())
      onSync?.()
    } catch (err) {
      console.error('Sync error:', err)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {lastSync && (
        <span style={{ fontSize: 12, color: '#4a5568' }}>
          Synced {lastSync.toLocaleTimeString()}
        </span>
      )}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleSync}
        disabled={syncing}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: syncing ? 'rgba(0,212,170,0.1)' : 'rgba(0,212,170,0.15)',
          color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)',
          borderRadius: 10, padding: '8px 16px', cursor: syncing ? 'default' : 'pointer',
          fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
        }}
      >
        <motion.svg
          width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          animate={syncing ? { rotate: 360 } : { rotate: 0 }}
          transition={syncing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </motion.svg>
        {syncing ? 'Syncing…' : 'Sync Now'}
      </motion.button>
    </div>
  )
}
