import { useTranslation } from 'react-i18next'

import { TaskSelectModal, NotificationContainer, Header, Footer, SentenceRow, StressedText } from './components'
import { LoginModal } from './components/auth'
import { Button, Card } from './components/ui'
import { useUIStore } from './features'
import { useSentences } from './hooks'
import { useAuth } from './services/auth'

function App() {
  const { t } = useTranslation()
  const { sentences, loadingIndex, isPlayingAll, audioRef, addSentence, updateSentence, removeSentence, playSentence, playAll, stopAll } = useSentences()
  const { openModal } = useUIStore()
  const { isAuthenticated } = useAuth()
  
  const hasContent = sentences.some(s => s.trim().length > 0)
  
  const handleAddToTask = (): void => {
    if (isAuthenticated) {
      openModal('taskSelect')
    } else {
      openModal('login')
    }
  }

  return (
    <div className="app-page">
      <Header />
      <main className="app-main">
        <div className="app-main__header">
          <div>
            <h1 className="app-main__title">{t('hero.title')}</h1>
            <p className="app-main__subtitle">{t('hero.subtitle')}</p>
          </div>
          <div className="app-main__actions">
            <Button variant="outline" size="small" disabled={!hasContent} onClick={handleAddToTask}>{t('buttons.addToTask')} (0)</Button>
            {isPlayingAll ? (
              <Button variant="primary" size="small" onClick={stopAll}>Peata</Button>
            ) : (
              <Button variant="primary" size="small" onClick={playAll} disabled={!hasContent}>▶ {t('buttons.playAll')}</Button>
            )}
          </div>
        </div>

        <Card>
          {sentences.map((sentence, index) => (
            <SentenceRow
              key={`sentence-${index}`}
              value={sentence}
              onChange={(value) => { updateSentence(index, value); }}
              onPlay={() => { void playSentence(index); }}
              onRemove={() => { removeSentence(index); }}
              isLoading={loadingIndex === index}
              isLast={index === sentences.length - 1}
            />
          ))}
        </Card>

        <div className="app-main__add-button">
          <Button variant="outline" onClick={addSentence}>{t('buttons.addSentence')}</Button>
        </div>

<StressedText className="visually-hidden" />
      </main>

      <Footer />
      
      <TaskSelectModal />
      <LoginModal />
      <NotificationContainer />
      
      <audio ref={audioRef} className="hidden-audio" />
    </div>
  )
}

export default App
