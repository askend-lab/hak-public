import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { colors, gap, borderRadius, cursors } from '../../styles/colors'

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
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: gap.md,
      padding: '0.75rem 0',
      borderBottom: !isLast ? `1px solid ${colors.outlinedNeutral}` : 'none',
    }}>
      {/* Drag handle */}
      <DragHandle />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={t('input.placeholder')}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          border: `1px solid ${colors.outlinedNeutral}`,
          borderRadius: borderRadius.small,
          fontSize: '0.9375rem',
          color: colors.primary,
          outline: 'none',
        }}
      />

      {/* Play button */}
      <PlayButton onClick={onPlay} isLoading={isLoading} />

      {/* More menu */}
      <MoreButton onRemove={onRemove} />
    </div>
  )
}

function DragHandle() {
  const DRAG_DOTS_COUNT = 6;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 4px)',
      gridTemplateRows: 'repeat(3, 4px)',
      gap: '2px',
      cursor: cursors.pointer,
    }}>
      {Array.from({ length: DRAG_DOTS_COUNT }).map((_, i) => (
        <div key={i} style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: colors.gray,
        }} />
      ))}
    </div>
  )
}

function PlayButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: borderRadius.round,
        background: isLoading ? colors.successLight : colors.success,
        border: 'none',
        color: colors.white,
        cursor: isLoading ? 'wait' : cursors.pointer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
      }}
    >
      {isLoading ? '⏳' : '▶'}
    </button>
  )
}

function MoreButton({ onRemove }: { onRemove: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '36px',
          height: '36px',
          background: 'transparent',
          border: 'none',
          cursor: cursors.pointer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.gray,
          fontSize: '1.25rem',
        }}>
        ⋯
      </button>
      {isOpen && (
        <div role="menu" style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          background: colors.white,
          border: `1px solid ${colors.outlinedNeutral}`,
          borderRadius: borderRadius.small,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 10,
          minWidth: '120px',
        }}>
          <button
            role="menuitem"
            onClick={() => { onRemove(); setIsOpen(false); }}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: cursors.pointer,
              color: colors.error,
            }}
          >
            Eemalda
          </button>
        </div>
      )}
    </div>
  )
}
