import { useState, useEffect, CSSProperties } from 'react'

const GRADIENTS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
} as const;

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: GRADIENTS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    padding: '60px 80px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '800px',
    textAlign: 'center',
  },
  title: {
    fontSize: '72px',
    margin: '0 0 20px 0',
    background: GRADIENTS.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '24px',
    color: '#666',
    margin: '0 0 40px 0',
    fontWeight: '300',
  },
  clockContainer: {
    background: '#f7fafc',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
  },
  clockTime: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#2d3748',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  clockDate: {
    fontSize: '18px',
    color: '#718096',
    marginTop: '10px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '40px',
  },
  featureCard: {
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
  },
  featureIcon: { fontSize: '32px', fontWeight: 'bold' },
  featureLabel: { fontSize: '14px', marginTop: '8px' },
  footer: {
    marginTop: '40px',
    fontSize: '14px',
    color: '#a0aec0',
  },
};

function App() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>HAK</h1>
        
        <p style={styles.subtitle}>
          Welcome to the future of development
        </p>

        <div style={styles.clockContainer}>
          <div style={styles.clockTime}>
            {time.toLocaleTimeString()}
          </div>
          <div style={styles.clockDate}>
            {time.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div style={styles.featureGrid}>
          <div style={{ ...styles.featureCard, background: GRADIENTS.primary }}>
            <div style={styles.featureIcon}>🚀</div>
            <div style={styles.featureLabel}>Fast Deploy</div>
          </div>
          <div style={{ ...styles.featureCard, background: GRADIENTS.pink }}>
            <div style={styles.featureIcon}>⚡</div>
            <div style={styles.featureLabel}>Lightning Fast</div>
          </div>
          <div style={{ ...styles.featureCard, background: GRADIENTS.blue }}>
            <div style={styles.featureIcon}>✨</div>
            <div style={styles.featureLabel}>Modern Stack</div>
          </div>
        </div>

        <div style={styles.footer}>
          Powered by React • Deployed on AWS S3 • Built with ❤️
        </div>
      </div>
    </div>
  )
}

export default App
