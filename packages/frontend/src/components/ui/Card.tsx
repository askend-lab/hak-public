import { ReactNode } from 'react'
import { colors } from '../../styles/colors'

interface CardProps {
  children: ReactNode
}

export function Card({ children }: CardProps) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(23, 49, 72, 0.08)',
      border: `1px solid ${colors.outlinedNeutral}`,
      padding: '1rem',
    }}>
      {children}
    </div>
  )
}

export default Card
