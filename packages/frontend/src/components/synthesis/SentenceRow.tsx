import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { SentenceListItem } from '../ui'
import { WordChip } from './WordChip'
import { VariantsPanel } from './VariantsPanel'
import type { Variant } from './VariantsPanel'

interface SentenceRowProps {
  value: string
  onChange: (value: string) => void
  onPlay: () => void
  onRemove: () => void
  onExplorePhonetic?: () => void
  onAddToTask?: (text: string) => void
  isLoading: boolean
  isLast: boolean
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
  onDrop: (index: number) => void
  isDragging?: boolean
  isDragOver?: boolean
}

export function SentenceRow({ value, onChange, onPlay, onRemove, onExplorePhonetic, onAddToTask, isLoading, isLast, index, onDragStart, onDragOver, onDragEnd, onDrop, isDragging, isDragOver }: SentenceRowProps) {
  const { t } = useTranslation()
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentInput, setCurrentInput] = useState('')
  // Tags are separate state - only completed words (after Space)
  const [tags, setTags] = useState<string[]>(() => 
    value.trim() ? value.trim().split(/\s+/) : []
  )
  const inputRef = useRef<HTMLInputElement>(null)
  
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
    <>
      <SentenceListItem
        index={index}
        onPlay={onPlay}
        isLoading={isLoading}
        isActive={value.trim().length > 0 || currentInput.trim().length > 0}
        isLast={isLast}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        isDragging={isDragging}
        isDragOver={isDragOver}
        actions={<MoreButton onRemove={onRemove} onExplorePhonetic={onExplorePhonetic} onAddToTask={() => { onAddToTask?.(value || currentInput); }} isDisabled={!value.trim() && !currentInput.trim()} />}
      >
        <div className="sentence-list-item__content" onClick={handleContainerClick}>
          {tags.map((word: string, idx: number) => (
            <WordChip
              key={`${word}-${idx}`}
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
          {(tags.length > 0 || currentInput) && (
            <button 
              className="sentence-row__clear-btn" 
              onClick={() => { setTags([]); setCurrentInput(''); onChange(''); }}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </SentenceListItem>
      
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
    </>
  )
}

function MoreButton({ onRemove, onExplorePhonetic, onAddToTask, isDisabled }: { onRemove: () => void; onExplorePhonetic?: (() => void) | undefined; onAddToTask?: (() => void) | undefined; isDisabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleToggle = (): void => { if (!isDisabled) setIsOpen(!isOpen); }
  const handleAddToTask = (): void => { setIsOpen(false); onAddToTask?.(); }
  const handleDownload = (): void => { setIsOpen(false); /* TODO: implement */ }
  const handleExplorePhonetic = (): void => { 
    setIsOpen(false)
    onExplorePhonetic?.()
  }
  
  // Close menu on outside click
  const handleBlur = (e: React.FocusEvent): void => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }
  
  const triggerClasses = ['more-menu__trigger', isDisabled && 'more-menu__trigger--disabled'].filter(Boolean).join(' ')
  
  return (
    <div className="more-menu" onBlur={handleBlur}>
      <button onClick={handleToggle} className={triggerClasses}>⋯</button>
      {isOpen && (
        <div role="menu" className="more-menu__dropdown">
          <button role="menuitem" onClick={handleExplorePhonetic} className="more-menu__item">
            Uuri foneetilist kuju
          </button>
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
