import { useState, useEffect } from 'react'

function App() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '60px 80px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '800px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '72px',
          margin: '0 0 20px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800'
        }}>
          HAK
        </h1>
        
        <p style={{
          fontSize: '24px',
          color: '#666',
          margin: '0 0 40px 0',
          fontWeight: '300'
        }}>
          Welcome to the future of development
        </p>

        <div style={{
          background: '#f7fafc',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#2d3748',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#718096',
            marginTop: '10px'
          }}>
            {time.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginTop: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>🚀</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Fast Deploy</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>⚡</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Lightning Fast</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>✨</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Modern Stack</div>
          </div>
        </div>

        <div style={{
          marginTop: '40px',
          fontSize: '14px',
          color: '#a0aec0'
        }}>
          Powered by React • Deployed on AWS S3 • Built with ❤️
        </div>
      </div>
    </div>
  )
}

export default App
