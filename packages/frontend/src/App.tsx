import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TaskSelectModal, NotificationContainer, Header, Footer, SentenceRow, StressedText } from './components'
import { LoginModal } from './components/auth'
import { Button, Card } from './components/ui'
import { useUIStore } from './features'
import { useSentences } from './hooks'
import { useAuth } from './services/auth'

function App() {
  const { t } = useTranslation()
  const { sentences, loadingIndex, isPlayingAll, audioRef, addSentence, updateSentence, removeSentence, reorderSentences, playSentence, playAll, stopAll } = useSentences()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const { openModal } = useUIStore()
  const { isAuthenticated } = useAuth()
  
  const hasContent = sentences.some(s => s.text.trim().length > 0)
  
  const handleAddToTask = (): void => {
    if (isAuthenticated) {
      openModal('taskSelect')
    } else {
      openModal('login')
    }
  }
  
  const handleDragStart = (index: number): void => {
    setDraggedIndex(index)
  }
  
  const handleDragOver = (index: number): void => {
    setDragOverIndex(index)
  }
  
  const handleDragEnd = (): void => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }
  
  const handleDrop = (toIndex: number): void => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderSentences(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
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
              key={sentence.id}
              value={sentence.text}
              onChange={(value) => { updateSentence(index, value); }}
              onPlay={() => { void playSentence(index); }}
              onRemove={() => { removeSentence(index); }}
              isLoading={loadingIndex === index}
              isLast={index === sentences.length - 1}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
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
