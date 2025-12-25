import { useTranslation } from 'react-i18next'

import { colors, gap, borderRadius, cursors } from '../../styles/colors'

interface SentenceRowProps {
  value: string
  onChange: (value: string) => void
  onPlay: () => void
  isLoading: boolean
  isLast: boolean
}

export function SentenceRow({ value, onChange, onPlay, isLoading, isLast }: SentenceRowProps) {
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
      <MoreButton />
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

function MoreButton() {
  return (
    <button style={{
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
  )
}
