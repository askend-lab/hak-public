import { colors } from '../../styles/colors'

const WAFFLE_DOT_COUNT = 9;

export function WaffleMenu() {
  const WAFFLE_DOTS_COUNT = 9;
  return (
    <button style={{
      width: '40px',
      height: '40px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 6px)',
      gridTemplateRows: 'repeat(3, 6px)',
      gap: '4px',
      padding: '8px',
    }}>
      {[...Array(WAFFLE_DOTS_COUNT)].map((_, i) => (
        <div key={i} style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: colors.gray,
        }} />
      ))}
    </button>
  )
}

export default WaffleMenu
