import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TaskSelectModal, NotificationContainer, Header, Footer } from './components'
import { colors } from './styles/colors'

function App() {
  const { t } = useTranslation()
  const [sentences, setSentences] = useState<string[]>([''])

  const handleAddSentence = () => {
    setSentences([...sentences, ''])
  }

  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...sentences]
    newSentences[index] = value
    setSentences(newSentences)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(to bottom, ${colors.softPrimaryBg} 0%, ${colors.softNeutralBg} 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <Header />

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
      }}>
        {/* Title Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: colors.primary,
              margin: '0 0 0.5rem 0',
            }}>
              {t('hero.title')}
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: colors.textSecondary,
              margin: 0,
            }}>
              Sisesta <span style={{ color: colors.primary }}>tekst</span> või <span style={{ color: colors.primary }}>sõna</span>, et <span style={{ color: '#4CAF50' }}>kuulata</span> selle hääldust ja uurida variante
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: `1px solid ${colors.outlinedNeutral}`,
              borderRadius: '20px',
              color: colors.gray,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}>
              Lisa ülesandesse (0)
            </button>
            <button style={{
              padding: '0.5rem 1rem',
              background: colors.primary,
              border: 'none',
              borderRadius: '20px',
              color: colors.white,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>▶</span> Mängi kõik
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div style={{
          background: colors.white,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(23, 49, 72, 0.08)',
          border: `1px solid ${colors.outlinedNeutral}`,
          padding: '1rem',
        }}>
          {sentences.map((sentence, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0',
              borderBottom: index < sentences.length - 1 ? `1px solid ${colors.outlinedNeutral}` : 'none',
            }}>
              {/* Drag handle */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 4px)',
                gridTemplateRows: 'repeat(3, 4px)',
                gap: '2px',
                cursor: 'grab',
              }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: colors.gray,
                  }} />
                ))}
              </div>

              {/* Input */}
              <input
                type="text"
                value={sentence}
                onChange={(e) => handleSentenceChange(index, e.target.value)}
                placeholder="Kirjuta oma lause siia"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: `1px solid ${colors.outlinedNeutral}`,
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  color: colors.primary,
                  outline: 'none',
                }}
              />

              {/* Play button */}
              <button style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#4CAF50',
                border: 'none',
                color: colors.white,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
              }}>
                ▶
              </button>

              {/* More menu */}
              <button style={{
                width: '36px',
                height: '36px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.gray,
                fontSize: '1.25rem',
              }}>
                ⋯
              </button>
            </div>
          ))}
        </div>

        {/* Add sentence button */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleAddSentence}
            style={{
              padding: '0.625rem 1.5rem',
              background: colors.white,
              border: `1px solid ${colors.outlinedNeutral}`,
              borderRadius: '20px',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Lisa lause
          </button>
        </div>
      </main>

      <Footer />
      
      <TaskSelectModal />
      <NotificationContainer />
    </div>
  )
}

export default App
