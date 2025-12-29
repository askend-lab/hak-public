import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { WordChip } from './WordChip'
import { VariantsPanel } from './VariantsPanel'
import type { Variant } from './VariantsPanel'

interface SentenceRowProps {
  value: string
  onChange: (value: string) => void
  onPlay: () => void
  onRemove: () => void
  isLoading: boolean
  isLast: boolean
}

export function SentenceRow({ value, onChange, onPlay, onRemove, isLoading, isLast }: SentenceRowProps) {
  const { t } = useTranslation()
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentInput, setCurrentInput] = useState('')
  // Tags are separate state - only completed words (after Space)
  const [tags, setTags] = useState<string[]>(() => 
    value.trim() ? value.trim().split(/\s+/) : []
  )
  const inputRef = useRef<HTMLInputElement>(null)
  
  const rowClasses = ['sentence-row', !isLast && 'sentence-row--bordered'].filter(Boolean).join(' ')
  
  const handleWordClick = (word: string): void => {
    setSelectedWord(word)
    setIsPanelOpen(true)
  }
  
  const handleClosePanel = (): void => {
    setIsPanelOpen(false)
    setSelectedWord(null)
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newInput = e.target.value
    setCurrentInput(newInput)
    // Call onChange on every keystroke so parent can enable buttons
    // But DON'T create tags from this - tags only from completed words (after Space)
    onChange(newInput)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === ' ' && currentInput.trim()) {
      // Space: add word to tags
      e.preventDefault()
      const newTags = [...tags, currentInput.trim()]
      setTags(newTags)
      setCurrentInput('')
      // Notify parent with full text (tags + empty currentInput)
      onChange(newTags.join(' '))
    } else if (e.key === 'Enter') {
      // Enter: add current input to tags if exists, then play
      if (currentInput.trim()) {
        const newTags = [...tags, currentInput.trim()]
        setTags(newTags)
        setCurrentInput('')
        onChange(newTags.join(' '))
      }
      if (tags.length > 0 || currentInput.trim()) {
        onPlay()
      }
    } else if (e.key === 'Backspace' && !currentInput && tags.length > 0) {
      // Backspace on empty input: remove last tag, put it back in input
      e.preventDefault()
      const lastTag = tags[tags.length - 1] ?? ''
      const newTags = tags.slice(0, -1)
      setTags(newTags)
      setCurrentInput(lastTag)
      // Notify parent - only remaining tags (lastTag is now in currentInput, not committed)
      onChange(newTags.join(' '))
    }
  }
  
  const handleContainerClick = (): void => {
    inputRef.current?.focus()
  }
  
  // Mock variants for demonstration (would come from API in real implementation)
  const getMockVariants = (word: string): Variant[] => [
    { id: '1', phonetic: word, type: 'nimisõna' },
    { id: '2', phonetic: word, type: 'tegusõna' },
  ]
  
  const handleSelectVariant = (_variant: Variant): void => {
    handleClosePanel()
  }
  
  const handlePlayVariant = async (variant: Variant): Promise<void> => {
    const { synthesizeText, playAudio } = await import('../../services/audio')
    const result = await synthesizeText(variant.phonetic)
    await playAudio(result.audioUrl)
  }
  
  return (
    <div className={rowClasses}>
      <DragHandle />
      <div className="sentence-row__words" onClick={handleContainerClick}>
        {tags.map((word: string, index: number) => (
          <WordChip
            key={`${word}-${index}`}
            word={word}
            onClick={handleWordClick}
            isSelected={selectedWord === word}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 && !currentInput ? t('input.placeholder') : ''}
          className="sentence-row__input sentence-row__input--inline"
        />
      </div>
      <PlayButton onClick={onPlay} isLoading={isLoading} hasText={value.trim().length > 0 || currentInput.trim().length > 0} />
      <MoreButton onRemove={onRemove} />
      
      {selectedWord && (
        <VariantsPanel
          word={selectedWord}
          variants={getMockVariants(selectedWord)}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onSelectVariant={handleSelectVariant}
          onPlayVariant={handlePlayVariant}
        />
      )}
    </div>
  )
}

const DRAG_DOTS_COUNT = 6;

function DragHandle() {
  return (
    <div className="drag-handle">
      {Array.from({ length: DRAG_DOTS_COUNT }).map((_, i) => (
        <div key={i} className="drag-handle__dot" />
      ))}
    </div>
  )
}

function PlayButton({ onClick, isLoading, hasText }: { onClick: () => void; isLoading: boolean; hasText: boolean }) {
  const classes = ['play-button', hasText && 'play-button--active', isLoading && 'play-button--loading'].filter(Boolean).join(' ')
  return (
    <button onClick={onClick} disabled={isLoading || !hasText} className={classes}>
      {isLoading ? '⏳' : '▶'}
    </button>
  )
}

function MoreButton({ onRemove }: { onRemove: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleAddToTask = (): void => { setIsOpen(false); /* TODO: implement */ }
  const handleDownload = (): void => { setIsOpen(false); /* TODO: implement */ }
  
  // Close menu on outside click
  const handleBlur = (e: React.FocusEvent): void => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }
  
  return (
    <div className="more-menu" onBlur={handleBlur}>
      <button onClick={() => setIsOpen(!isOpen)} className="more-menu__trigger">⋯</button>
      {isOpen && (
        <div role="menu" className="more-menu__dropdown">
          <button role="menuitem" onClick={handleAddToTask} className="more-menu__item">
            Lisa ülesandesse
          </button>
          <button role="menuitem" onClick={handleDownload} className="more-menu__item">
            Lae alla
          </button>
          <button role="menuitem" onClick={() => { onRemove(); setIsOpen(false); }} className="more-menu__item more-menu__item--danger">
            Eemalda
          </button>
        </div>
      )}
    </div>
  )
}
