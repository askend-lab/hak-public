import { colors, fontWeight, gap } from '../../styles/colors'

interface SectionHeadingProps {
  children: string
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h3 style={{
      fontSize: '0.875rem',
      fontWeight: fontWeight.semibold,
      color: colors.primary,
      margin: `0 0 ${gap.lg} 0`,
    }}>
      {children}
    </h3>
  )
}
