import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/colors'
import { Logo } from './Logo'

const FONT_WEIGHT_MEDIUM = 500;
const FONT_WEIGHT_SEMIBOLD = 600;

interface LogoWithTextProps {
  withBackground?: boolean
  size?: 'small' | 'medium'
}

export function LogoWithText({ withBackground = false, size = 'small' }: LogoWithTextProps) {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', alignItems: withBackground ? 'flex-start' : 'center', gap: withBackground ? '0.5rem' : '0.75rem' }}>
      <Logo size={size} withBackground={withBackground} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{
          fontSize: withBackground ? '0.75rem' : '0.625rem',
          fontWeight: 700,
          color: colors.primary,
          letterSpacing: withBackground ? undefined : '0.5px',
        }}>
          {t('header.title1')}
        </span>
        <span style={{
          fontSize: withBackground ? '0.625rem' : '0.75rem',
          fontWeight: withBackground ? FONT_WEIGHT_MEDIUM : FONT_WEIGHT_SEMIBOLD,
          color: colors.primary,
        }}>
          {t('header.title2')}
        </span>
      </div>
    </div>
  )
}

export default LogoWithText
