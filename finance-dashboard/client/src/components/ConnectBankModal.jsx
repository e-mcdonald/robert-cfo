import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'

export default function ConnectBankModal({ onClose, onSuccess }) {
  const [appId, setAppId] = useState(null)
  const [env, setEnv] = useState('sandbox')
  const [status, setStatus] = useState('idle') // idle | connecting | success | error

  useEffect(() => {
    api.get('/teller/app-id').then(res => {
      setAppId(res.data.appId)
      setEnv(res.data.env)
    }).catch(console.error)
  }, [])

  const launch = () => {
    if (!appId) {
      setStatus('error')
      return
    }
    setStatus('connecting')

    const script = document.createElement('script')
    script.src = 'https://cdn.teller.io/connect/connect.js'
    script.onload = () => {
      const teller = window.TellerConnect.setup({
        applicationId: appId,
        environment: env,
        onSuccess: async (enrollment) => {
          try {
            await api.post('/teller/enroll', {
              accessToken: enrollment.accessToken,
              enrollment: enrollment,
            })
            setStatus('success')
            onSuccess?.()
          } catch (err) {
            console.error('Enroll error:', err)
            setStatus('error')
          }
        },
        onExit: () => {
          if (status !== 'success') setStatus('idle')
        },
      })
      teller.open()
    }
    document.head.appendChild(script)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#161922', borderRadius: 20, padding: 40, width: 420, border: '1px solid #252d3d' }}
        >
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Connect a Bank</div>
          <div style={{ color: '#8892a4', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
            Connect your bank securely via Teller.io — a Plaid alternative with direct bank API connections.
            No credentials stored; only encrypted access tokens.
          </div>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <div style={{ color: '#34d399', fontSize: 16, fontWeight: 600 }}>Bank connected successfully!</div>
              <button
                onClick={onClose}
                style={{ marginTop: 24, background: '#00d4aa', color: '#0d0f14', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 600, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {!appId && (
                <div style={{ background: '#1e2330', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                  TELLER_APP_ID not configured in .env — connection won't work until set.
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={launch}
                  disabled={status === 'connecting'}
                  style={{
                    flex: 1, background: '#00d4aa', color: '#0d0f14', border: 'none',
                    borderRadius: 10, padding: '13px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  {status === 'connecting' ? 'Opening Teller…' : 'Connect with Teller'}
                </button>
                <button
                  onClick={onClose}
                  style={{ background: 'transparent', color: '#8892a4', border: '1px solid #252d3d', borderRadius: 10, padding: '13px 20px', cursor: 'pointer', fontSize: 14 }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
