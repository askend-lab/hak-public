import { useTranslation } from 'react-i18next'

import { colors, fontWeight, gap, lineHeight } from '../../styles/colors'

import { Logo } from './Logo'

interface LogoWithTextProps {
  withBackground?: boolean
  size?: 'small' | 'medium'
}

export function LogoWithText({ withBackground = false, size = 'small' }: LogoWithTextProps) {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', alignItems: withBackground ? 'flex-start' : 'center', gap: withBackground ? gap.sm : gap.md }}>
      <Logo size={size} withBackground={withBackground} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: lineHeight.tight }}>
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
          fontWeight: withBackground ? fontWeight.medium : fontWeight.semibold,
          color: colors.primary,
        }}>
          {t('header.title2')}
        </span>
      </div>
    </div>
  )
}
