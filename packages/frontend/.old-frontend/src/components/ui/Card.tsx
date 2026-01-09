import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  const classes = ['card', 'card--simple', className].filter(Boolean).join(' ')
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}
