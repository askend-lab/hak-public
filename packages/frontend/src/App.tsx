import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput, AudioPlayer, StressedText, AddToTaskButton, TaskSelectModal, NotificationContainer, Header, Footer } from './components'
import { useSynthesisStore } from './features'
import { synthesizeText } from './services/audio'
import { colors } from './styles/colors'

function App() {
  const { t } = useTranslation()
  const { text, result, setResult, setLoading, setError } = useSynthesisStore()

  const handleSynthesize = useCallback(async () => {
    if (!text.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const synthesisResult = await synthesizeText(text)
      setResult(synthesisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Synthesis failed')
    } finally {
      setLoading(false)
    }
  }, [text, setResult, setLoading, setError])

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(to bottom, ${colors.softPrimaryBg} 0%, ${colors.softNeutralBg} 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <Header />

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem 3rem',
      }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: colors.primary,
            margin: '0 0 0.5rem 0',
          }}>
            {t('hero.title')}
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            margin: 0,
            lineHeight: 1.5,
          }}>
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Workspace Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Primary Column - Input */}
          <div>
            <div style={{
              background: colors.white,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(23, 49, 72, 0.08)',
              border: `1px solid rgba(23, 49, 72, 0.1)`,
              overflow: 'hidden',
            }}>
              {/* Card Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: `1px solid ${colors.outlinedNeutral}`,
                background: `linear-gradient(to right, ${colors.softPrimaryBg} 0%, #f8fbff 100%)`,
              }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: colors.primary,
                  margin: 0,
                }}>
                  {t('inputCard.title')}
                </h2>
              </div>

              {/* Card Body */}
              <div style={{ padding: '2.25rem 1.5rem' }}>
                <TextInput onSynthesize={handleSynthesize} />

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  marginTop: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}>
                    <span style={{ color: colors.textSecondary, fontWeight: 500 }}>
                      {t('inputCard.example')}
                    </span>
                    <span style={{
                      color: colors.primary,
                      fontStyle: 'italic',
                      background: colors.softPrimaryBg,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      Tere päevast!
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: colors.textSecondary,
                  }}>
                    <span style={{ color: '#2E7D32' }}>✓</span>
                    {t('inputCard.helpText')}
                  </div>
                </div>
              </div>

              {/* Card Footer - Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1.5rem 2.25rem',
              }}>
                <button
                  onClick={handleSynthesize}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: colors.primary,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  🔊 {t('inputCard.playButton')}
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: colors.white,
                  color: colors.primary,
                  border: `2px solid ${colors.primary}`,
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  + {t('inputCard.addTaskButton')}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div style={{
                marginTop: '1.5rem',
                background: colors.white,
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(23, 49, 72, 0.08)',
                border: `1px solid rgba(23, 49, 72, 0.1)`,
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: colors.primary,
                  margin: '0 0 1rem 0',
                }}>
                  {t('resultsCard.title')}
                </h3>
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
          </div>

          {/* Secondary Column - Playlist */}
          <div style={{
            position: 'sticky',
            top: '2rem',
          }}>
            <div style={{
              background: colors.white,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(23, 49, 72, 0.08)',
              border: `1px solid rgba(23, 49, 72, 0.1)`,
              minHeight: '300px',
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.primary,
                margin: '0 0 1rem 0',
              }}>
                {t('playlistCard.title')}
              </h3>
              <div style={{
                color: colors.gray,
                fontSize: '0.875rem',
                textAlign: 'center',
                padding: '2rem 0',
              }}>
                {t('playlistCard.empty')}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <TaskSelectModal />
      <NotificationContainer />
    </div>
  )
}

export default App
