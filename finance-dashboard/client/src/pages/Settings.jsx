import { motion } from 'framer-motion'

function Section({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: '#161922', borderRadius: 16, padding: 28, border: '1px solid #252d3d', marginBottom: 20 }}
    >
      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#f0f2f7' }}>{title}</div>
      {children}
    </motion.div>
  )
}

function Row({ label, value, badge }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a1f2e' }}>
      <span style={{ fontSize: 14, color: '#8892a4' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {badge && (
          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: badge === 'Active' ? 'rgba(52,211,153,0.15)' : 'rgba(74,85,104,0.3)', color: badge === 'Active' ? '#34d399' : '#4a5568' }}>
            {badge}
          </span>
        )}
        <span style={{ fontSize: 13, fontFamily: 'DM Mono', color: '#f0f2f7' }}>{value}</span>
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, marginBottom: 32 }}
      >
        Settings
      </motion.h1>

      <Section title="Data Sources">
        <Row label="Teller.io (Banking)" value="Sandbox mode" badge="Active" />
        <Row label="Gemini (Crypto)" value="Mock data — add GEMINI_API_KEY" badge="Mock" />
        <Row label="Robinhood (Brokerage)" value="Mock data — configure Python bridge" badge="Mock" />
        <Row label="Guideline (401k)" value="Drop CSV in uploads/guideline/" badge="CSV" />
      </Section>

      <Section title="Environment">
        <Row label="Server" value="localhost:3001" />
        <Row label="Database" value="SQLite (local)" />
        <Row label="Encryption" value="AES-256-GCM" />
        <Row label="AI Categorization" value={process.env.ANTHROPIC_API_KEY ? 'Claude (active)' : 'Add ANTHROPIC_API_KEY'} />
      </Section>

      <Section title="Setup Instructions">
        <div style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#f0f2f7' }}>1. Generate an encryption key:</strong><br />
            <code style={{ background: '#0d0f14', padding: '2px 8px', borderRadius: 4, color: '#00d4aa' }}>npm run generate-key</code>
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#f0f2f7' }}>2. Copy .env.example to .env and fill in:</strong><br />
            TELLER_APP_ID, GEMINI_API_KEY, ANTHROPIC_API_KEY, ENCRYPTION_KEY
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#f0f2f7' }}>3. For Teller mTLS certs:</strong><br />
            Place certificate.pem and private_key.pem in <code style={{ background: '#0d0f14', padding: '2px 8px', borderRadius: 4, color: '#00d4aa' }}>certs/</code>
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#f0f2f7' }}>4. For Robinhood:</strong><br />
            Set ROBINHOOD_EMAIL and ROBINHOOD_PASSWORD, then run:
            <code style={{ display: 'block', background: '#0d0f14', padding: '4px 8px', borderRadius: 4, color: '#00d4aa', marginTop: 4 }}>cd scripts/python-bridge && uvicorn main:app --port 8001</code>
          </p>
          <p>
            <strong style={{ color: '#f0f2f7' }}>5. For Guideline 401k:</strong><br />
            Export CSV from guideline.com → drop in <code style={{ background: '#0d0f14', padding: '2px 8px', borderRadius: 4, color: '#00d4aa' }}>uploads/guideline/</code> → POST /api/sync/guideline
          </p>
        </div>
      </Section>
    </div>
  )
}
