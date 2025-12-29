import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface Variant {
  id: string
  phonetic: string
  type: string // e.g., "nimisõna" (noun), "tegusõna" (verb)
}

interface VariantsPanelProps {
  word: string
  variants: Variant[]
  isOpen: boolean
  onClose: () => void
  onSelectVariant: (variant: Variant) => void
  onPlayVariant: (variant: Variant) => void
}

export function VariantsPanel({ 
  word, 
  variants, 
  isOpen, 
  onClose, 
  onSelectVariant, 
  onPlayVariant 
}: VariantsPanelProps) {
  const { t } = useTranslation()
  const [customInput, setCustomInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const insertMarker = (marker: string): void => {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart ?? customInput.length
    const end = input.selectionEnd ?? customInput.length
    const newValue = customInput.slice(0, start) + marker + customInput.slice(end)
    setCustomInput(newValue)
    setTimeout(() => {
      input.setSelectionRange(start + marker.length, start + marker.length)
      input.focus()
    }, 0)
  }
  
  const handlePlayCustom = async (): Promise<void> => {
    if (!customInput.trim()) return
    const { synthesizeText, playAudio } = await import('../../services/audio')
    const result = await synthesizeText(customInput.trim())
    await playAudio(result.audioUrl)
  }
  
  if (!isOpen) return null
  
  return (
    <div 
      className="variants-panel" 
      data-testid="variants-panel"
      role="dialog"
      aria-label={`Pronunciation variants for ${word}`}
    >
      <div className="variants-panel__header">
        <h3 className="variants-panel__title">{word}</h3>
        <button 
          className="variants-panel__close" 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      <div className="variants-panel__content">
        {variants.map((variant) => (
          <div 
            key={variant.id} 
            className="variant-option"
            data-testid="variant-option"
          >
            <div className="variant-option__info">
              <span className="variant-option__phonetic">{variant.phonetic}</span>
              <span className="variant-option__type">{variant.type}</span>
            </div>
            <div className="variant-option__actions">
              <button 
                className="variant-option__play"
                onClick={() => onPlayVariant(variant)}
                aria-label={`Play ${variant.phonetic}`}
              >
                ▶
              </button>
              <button 
                className="variant-option__use"
                onClick={() => onSelectVariant(variant)}
              >
                {t('variants.use', 'Kasuta')}
              </button>
            </div>
          </div>
        ))}
        
        <div className="variants-panel__custom" data-testid="custom-variant-section">
        <h4>{t('variants.createCustom', 'Loo oma variant')}</h4>
        <p>{t('variants.customDescription', 'Sisesta oma foneetiline tekst või sõna variant, et kasutada ja kuulata selle hääldust.')}</p>
        <div className="variants-panel__custom-input">
          <input 
            ref={inputRef}
            type="text" 
            placeholder={t('variants.customPlaceholder', 'Kirjuta oma foneetiline variant')}
            className="variants-panel__input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
          <button className="variant-option__play" onClick={handlePlayCustom}>▶</button>
          <button className="variant-option__use" onClick={() => {
            if (customInput.trim()) {
              onSelectVariant({ id: 'custom', phonetic: customInput.trim(), type: 'custom' })
            }
          }}>{t('variants.use', 'Kasuta')}</button>
        </div>
        <div className="variants-panel__markers">
          <button className="marker-button" title="Third quantity" onClick={() => insertMarker('ˇ')}>ˇ</button>
          <button className="marker-button" title="Stress" onClick={() => insertMarker('´')}>´</button>
          <button className="marker-button" title="Palatalization" onClick={() => insertMarker("'")}>&#39;</button>
          <button className="marker-button" title="Compound boundary" onClick={() => insertMarker('+')}>+</button>
        </div>
        </div>
      </div>
    </div>
  )
}

export type { Variant, VariantsPanelProps }
