import * as Sentry from '@sentry/react'

const btnStyle = { padding: '1rem 2rem', fontSize: '1rem', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
const apiBase = window.location.hostname.includes('dev') ? 'https://hak-api-dev.askend-lab.com' : 'https://hak-api-prod.askend-lab.com'

export function DebugPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔧 Debug Page</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Secret page for testing error monitoring</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={() => { throw new Error('Test frontend error') }} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>
          🔴 Trigger Frontend Error (Sentry)
        </button>
        <button onClick={() => fetch(`${apiBase}/api/debug/error`, { method: 'POST' }).then(r => alert(`Backend: ${r.status}`))} style={{ ...btnStyle, backgroundColor: '#fd7e14' }}>
          🟠 Trigger Backend 500 (CloudWatch → Slack)
        </button>
        <button onClick={() => { Sentry.captureMessage('Test message', 'info'); alert('Sent!') }} style={{ ...btnStyle, backgroundColor: '#6f42c1' }}>
          🟣 Send Sentry Test Message
        </button>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#888' }}>Frontend → Sentry | Backend → CloudWatch → Slack</p>
    </div>
  )
}
