import { CSSProperties, ReactNode } from 'react'
import { colors } from '../../styles/colors'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'small' | 'medium'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  style?: CSSProperties
}

const baseStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: '25px',
  },
  secondary: {
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '25px',
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.gray,
    border: `1px solid ${colors.outlinedNeutral}`,
    borderRadius: '20px',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.gray,
    border: 'none',
  },
}

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  small: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  medium: {
    padding: '0.625rem 1.5rem',
    fontSize: '0.875rem',
  },
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled,
  style,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export default Button
