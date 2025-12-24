export const colors = {
  primary: '#173148',
  secondary: '#D7E5F2',
  softPrimaryBg: '#E3EFFB',
  surfaceBg: '#FBFCFE',
  softNeutralBg: '#F0F4F8',
  textSecondary: '#32383E',
  gray: '#636B74',
  outlinedNeutral: '#CDD7E1',
  outlinedPrimary: '#0B6BCB',
  white: '#FFFFFF',
  success: '#4CAF50',
  successLight: '#81C784',
  transparent: 'transparent',
  error: '#C62828',
  errorBg: '#FFEBEE',
  errorBorder: '#EF9A9A',
  successDark: '#2E7D32',
  successBg: '#E8F5E9',
  successBorder: '#A5D6A7',
  info: '#1565C0',
  warning: '#E65100',
  warningBg: '#FFF3E0',
  warningBgLight: '#FFFBF5',
  warningBorder: '#FFCC80',
}

export const borderRadius = {
  small: '8px',
  medium: '12px',
  large: '20px',
  round: '50%',
  pill: '25px',
} as const

export const fontFamily = {
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  monoSimple: "'JetBrains Mono', monospace",
  system: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const

export const backgrounds = {
  pageGradient: `linear-gradient(to bottom, ${colors.softPrimaryBg} 0%, ${colors.softNeutralBg} 100%)`,
} as const

export const layout = {
  maxWidthWide: '1400px',
  maxWidthContent: '1000px',
  maxWidthNarrow: '900px',
} as const

export const spacing = {
  mainPadding: '2rem 1.5rem 4rem',
  sectionMargin: '1.5rem',
} as const

export const fontSize = {
  xs: '0.625rem',
  sm: '0.75rem',
  md: '0.8125rem',
  base: '0.875rem',
  lg: '0.9375rem',
  xl: '1rem',
} as const

export const fontWeight = {
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const transitions = {
  fast: '0.2s',
  medium: '0.3s',
} as const

export const cursors = {
  pointer: 'pointer',
  default: 'default',
  notAllowed: 'not-allowed',
} as const

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
} as const

export const textDecoration = {
  none: 'none',
  underline: 'underline',
} as const

export const display = {
  flex: 'flex',
  grid: 'grid',
  block: 'block',
  none: 'none',
} as const

export const flexAlign = {
  center: 'center',
  start: 'flex-start',
  end: 'flex-end',
  stretch: 'stretch',
  spaceBetween: 'space-between',
} as const

export const gap = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  xxl: '2rem',
} as const

export const overflow = {
  hidden: 'hidden',
  auto: 'auto',
  scroll: 'scroll',
  visible: 'visible',
} as const
