import { useTranslation } from 'react-i18next'

import { TaskSelectModal, NotificationContainer, Header, Footer, SentenceRow, StressedText } from './components'
import { Button, Card } from './components/ui'
import { useSentences } from './hooks'
import { colors, fontFamily, backgrounds, layout, spacing, fontWeight } from './styles/colors'

const appStyle = {
  minHeight: '100vh',
  background: backgrounds.pageGradient,
  fontFamily: fontFamily.system,
} as const;

const mainStyle = { maxWidth: layout.maxWidthNarrow, margin: '0 auto', padding: spacing.mainPadding } as const;
const titleSectionStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' } as const;
const h1Style = { fontSize: '1.5rem', fontWeight: fontWeight.bold, color: colors.primary, margin: '0 0 0.5rem 0' } as const;
const subtitleStyle = { fontSize: '0.9375rem', color: colors.textSecondary, margin: 0 } as const;
const buttonGroupStyle = { display: 'flex', gap: '0.75rem' } as const;
const addButtonContainerStyle = { textAlign: 'center', marginTop: '1rem' } as const;
const hiddenAudioStyle = { display: 'none' } as const;

function App() {
  const { t } = useTranslation()
  const { sentences, loadingIndex, isPlayingAll, audioRef, addSentence, updateSentence, removeSentence, playSentence, playAll, stopAll } = useSentences()

  return (
    <div style={appStyle}>
      <Header />
      <main style={mainStyle}>
        <div style={titleSectionStyle}>
          <div>
            <h1 style={h1Style}>{t('hero.title')}</h1>
            <p style={subtitleStyle}>{t('hero.subtitle')}</p>
          </div>
          <div style={buttonGroupStyle}>
            <Button variant="outline" size="small">{t('buttons.addToTask')} (0)</Button>
            {isPlayingAll ? (
              <Button variant="primary" size="small" onClick={stopAll}>Peata</Button>
            ) : (
              <Button variant="primary" size="small" onClick={playAll}>▶ {t('buttons.playAll')}</Button>
            )}
          </div>
        </div>

        {/* Input Section */}
        <Card>
          {sentences.map((sentence, index) => (
            <SentenceRow
              key={index}
              value={sentence}
              onChange={(value) => { updateSentence(index, value); }}
              onPlay={() => { void playSentence(index); }}
              onRemove={() => { removeSentence(index); }}
              isLoading={loadingIndex === index}
              isLast={index === sentences.length - 1}
            />
          ))}
        </Card>

        <div style={addButtonContainerStyle}>
          <Button variant="outline" onClick={addSentence}>{t('buttons.addSentence')}</Button>
        </div>

        {/* Phonetic text display with help icon */}
        <StressedText />
      </main>

      <Footer />
      
      <TaskSelectModal />
      <NotificationContainer />
      
      <audio ref={audioRef} style={hiddenAudioStyle} />
    </div>
  )
}

export default App
