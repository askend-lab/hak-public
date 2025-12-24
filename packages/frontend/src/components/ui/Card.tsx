import { ReactNode } from 'react'

import { colors, borderRadius, gap } from '../../styles/colors'

interface CardProps {
  children: ReactNode
}

export function Card({ children }: CardProps) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: borderRadius.medium,
      boxShadow: '0 2px 8px rgba(23, 49, 72, 0.08)',
      border: `1px solid ${colors.outlinedNeutral}`,
      padding: gap.lg,
    }}>
      {children}
    </div>
  )
}
