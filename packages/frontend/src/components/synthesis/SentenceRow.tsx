import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { PlayButton } from '../ui'
import { WordChip } from './WordChip'
import { VariantsPanel } from './VariantsPanel'
import type { Variant } from './VariantsPanel'

interface SentenceRowProps {
  value: string
  onChange: (value: string) => void
  onPlay: () => void
  onRemove: () => void
  onExplorePhonetic?: () => void
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

export function SentenceRow({ value, onChange, onPlay, onRemove, onExplorePhonetic, isLoading, isLast, index, onDragStart, onDragOver, onDragEnd, onDrop, isDragging, isDragOver }: SentenceRowProps) {
  const { t } = useTranslation()
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentInput, setCurrentInput] = useState('')
  // Tags are separate state - only completed words (after Space)
  const [tags, setTags] = useState<string[]>(() => 
    value.trim() ? value.trim().split(/\s+/) : []
  )
  const inputRef = useRef<HTMLInputElement>(null)
  
  const rowClasses = [
    'sentence-row',
    !isLast && 'sentence-row--bordered',
    isDragging && 'sentence-row--dragging',
    isDragOver && 'sentence-row--drag-over'
  ].filter(Boolean).join(' ')
  
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    onDragOver(index)
  }
  
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    onDrop(index)
  }
  
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
  
  const rowRef = useRef<HTMLDivElement>(null)
  
  const handleDragStartFromHandle = (e: React.DragEvent): void => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', String(index))
    // Set drag image to be the whole row
    if (rowRef.current) {
      e.dataTransfer.setDragImage(rowRef.current, 20, rowRef.current.offsetHeight / 2)
      setTimeout(() => {
        if (rowRef.current) rowRef.current.style.opacity = '0.5'
      }, 0)
    }
    onDragStart(index)
  }
  
  const handleDragEndWithOpacity = (): void => {
    if (rowRef.current) rowRef.current.style.opacity = '1'
    onDragEnd()
  }
  
  return (
    <div
      ref={rowRef}
      className={rowClasses}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragHandle 
        draggable
        onDragStart={handleDragStartFromHandle}
        onDragEnd={handleDragEndWithOpacity}
      />
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
      <PlayButton onClick={onPlay} isLoading={isLoading} isActive={value.trim().length > 0 || currentInput.trim().length > 0} />
      <MoreButton onRemove={onRemove} onExplorePhonetic={onExplorePhonetic} />
      
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

interface DragHandleProps {
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}

function DragHandle({ draggable, onDragStart, onDragEnd }: DragHandleProps) {
  return (
    <div 
      className="drag-handle"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {Array.from({ length: DRAG_DOTS_COUNT }).map((_, i) => (
        <div key={i} className="drag-handle__dot" />
      ))}
    </div>
  )
}

function MoreButton({ onRemove, onExplorePhonetic }: { onRemove: () => void; onExplorePhonetic?: (() => void) | undefined }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleAddToTask = (): void => { setIsOpen(false); /* TODO: implement */ }
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
  
  return (
    <div className="more-menu" onBlur={handleBlur}>
      <button onClick={() => setIsOpen(!isOpen)} className="more-menu__trigger">⋯</button>
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
