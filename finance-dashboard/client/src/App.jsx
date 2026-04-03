import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import SyncButton from './components/SyncButton'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import { useState } from 'react'

function TopBar({ onSync }) {
  return (
    <div style={{
      height: 60, borderBottom: '1px solid #252d3d', display: 'flex', alignItems: 'center',
      justifyContent: 'flex-end', padding: '0 32px', flexShrink: 0, background: '#0d0f14',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <SyncButton onSync={onSync} />
    </div>
  )
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const handleSync = () => setRefreshKey(k => k + 1)

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0f14' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
          <TopBar onSync={handleSync} />
          <main style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard key={`dash-${refreshKey}`} />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
