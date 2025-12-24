import { CSSProperties, ReactNode } from 'react'

import { colors, borderRadius, gap, cursors, fontWeight } from '../../styles/colors'

const DISABLED_OPACITY = 0.6;

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
  gap: gap.sm,
  border: 'none',
  cursor: cursors.pointer,
  fontWeight: fontWeight.medium,
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: borderRadius.pill,
  },
  secondary: {
    backgroundColor: colors.white,
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: borderRadius.pill,
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.gray,
    border: `1px solid ${colors.outlinedNeutral}`,
    borderRadius: borderRadius.large,
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
        cursor: disabled === true ? cursors.notAllowed : cursors.pointer,
        opacity: disabled === true ? DISABLED_OPACITY : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
