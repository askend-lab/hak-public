import { colors } from '../../styles/colors'

interface NavTabProps {
  label: string
  isActive: boolean
  onClick: () => void
}

export function NavTab({ label, isActive, onClick }: NavTabProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 0',
        background: 'transparent',
        border: 'none',
        borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
        color: isActive ? colors.primary : colors.gray,
        fontSize: '0.9375rem',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default NavTab
