import { colors } from '../../styles/colors'

interface SectionHeadingProps {
  children: string
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h3 style={{
      fontSize: '0.875rem',
      fontWeight: 600,
      color: colors.primary,
      margin: '0 0 1rem 0',
    }}>
      {children}
    </h3>
  )
}

export default SectionHeading
