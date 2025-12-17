import { useTranslation } from 'react-i18next'
import { TaskSelectModal, NotificationContainer, Header, Footer, SentenceRow } from './components'
import { Button, Card } from './components/ui'
import { colors } from './styles/colors'
import { useSentences } from './hooks'

function App() {
  const { t } = useTranslation()
  const { sentences, loadingIndex, audioRef, addSentence, updateSentence, playSentence } = useSentences()

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
            <Button variant="outline" size="small">Lisa ülesandesse (0)</Button>
            <Button variant="primary" size="small"><span>▶</span> Mängi kõik</Button>
          </div>
        </div>

        {/* Input Section */}
        <Card>
          {sentences.map((sentence, index) => (
            <SentenceRow
              key={index}
              value={sentence}
              onChange={(value) => updateSentence(index, value)}
              onPlay={() => playSentence(index)}
              isLoading={loadingIndex === index}
              isLast={index === sentences.length - 1}
            />
          ))}
        </Card>

        {/* Add sentence button */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Button variant="outline" onClick={addSentence}>Lisa lause</Button>
        </div>
      </main>

      <Footer />
      
      <TaskSelectModal />
      <NotificationContainer />
      
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}

export default App
