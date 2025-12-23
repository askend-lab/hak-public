import { colors } from '../../styles/colors'

const DRAG_HANDLE_DOT_COUNT = 6;

interface SentenceRowProps {
  value: string
  onChange: (value: string) => void
  onPlay: () => void
  isLoading: boolean
  isLast: boolean
}

export function SentenceRow({ value, onChange, onPlay, isLoading, isLast }: SentenceRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
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
        placeholder="Kirjuta oma lause siia"
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          border: `1px solid ${colors.outlinedNeutral}`,
          borderRadius: '8px',
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
      cursor: 'grab',
    }}>
      {[...Array(DRAG_DOTS_COUNT)].map((_, i) => (
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
        borderRadius: '50%',
        background: isLoading ? '#81C784' : '#4CAF50',
        border: 'none',
        color: colors.white,
        cursor: isLoading ? 'wait' : 'pointer',
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
      cursor: 'pointer',
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

export default SentenceRow
