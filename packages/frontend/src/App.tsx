import { useCallback } from 'react'
import { TextInput, AudioPlayer, StressedText, AddToTaskButton, TaskSelectModal, NotificationContainer } from './components'
import { useSynthesisStore } from './features'

function App() {
  const { result, setResult, setLoading, setError } = useSynthesisStore()

  const handleSynthesize = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    // Mock synthesis for demo - in production this calls Vabamorf + Merlin
    setTimeout(() => {
      setResult({
        audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        phoneticText: 'Tere päevast → [ˈtere ˈpæːvast]',
        fromCache: false,
      })
      setLoading(false)
    }, 1000)
  }, [setResult, setLoading, setError])

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
        padding: '40px 60px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0 0 10px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800',
          textAlign: 'center'
        }}>
          EKI Kõnesüntees
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 30px 0',
          textAlign: 'center'
        }}>
          Eesti keele häälduse õppimise platvorm
        </p>

        <TextInput onSynthesize={handleSynthesize} />

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '12px'
          }}>
            <StressedText />
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginTop: '15px',
              alignItems: 'center'
            }}>
              <AudioPlayer />
              <AddToTaskButton />
            </div>
          </div>
        )}

        <div style={{
          marginTop: '30px',
          fontSize: '12px',
          color: '#a0aec0',
          textAlign: 'center'
        }}>
          US-020 Golden Use Case • HAK Platform
        </div>
      </div>
      
      <TaskSelectModal />
      <NotificationContainer />
    </div>
  )
}

export default App
