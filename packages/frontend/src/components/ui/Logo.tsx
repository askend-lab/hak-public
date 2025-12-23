import { colors } from '../../styles/colors'

const LOGO_SIZE_SMALL = 40;
const LOGO_SIZE_MEDIUM = 48;

interface LogoProps {
  size?: 'small' | 'medium'
  withBackground?: boolean
}

const LOGO_SIZE_SMALL = 40;
const LOGO_SIZE_MEDIUM = 48;

export function Logo({ size = 'medium', withBackground = false }: LogoProps) {
  const dimensions = size === 'small' ? LOGO_SIZE_SMALL : LOGO_SIZE_MEDIUM

  if (withBackground) {
    return (
      <svg width={dimensions} height={dimensions} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="8" fill={colors.primary}/>
        <path d="M34 8H14V28H26C25.8 32 24.8 34.5 23 36.2C21.2 37.9 18.2 38.9 14 39V44C26 43.6 34 37 34 24V8Z" fill={colors.white}/>
      </svg>
    )
  }

  return (
    <svg width={dimensions} height={dimensions} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 0H0V20H14C13.8 24.8 12.6 28 10.4 30.2C8.2 32.4 4.4 33.6 0 33.8V40C14.4 39.5 24 32 24 18V0Z" fill={colors.primary}/>
    </svg>
  )
}

export default Logo
