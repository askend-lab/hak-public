import { useTranslation } from 'react-i18next'

import { Logo } from './Logo'

interface LogoWithTextProps {
  withBackground?: boolean
  size?: 'small' | 'medium'
}

export function LogoWithText({ withBackground = false, size = 'small' }: LogoWithTextProps) {
  const { t } = useTranslation()
  const containerClasses = ['logo-with-text', withBackground && 'logo-with-text--with-bg'].filter(Boolean).join(' ')
  const title1Classes = ['logo-with-text__title1', withBackground && 'logo-with-text__title1--with-bg'].filter(Boolean).join(' ')
  const title2Classes = ['logo-with-text__title2', withBackground && 'logo-with-text__title2--with-bg'].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <Logo size={size} withBackground={withBackground} />
      <div className="logo-with-text__text">
        <span className={title1Classes}>{t('header.title1')}</span>
        <span className={title2Classes}>{t('header.title2')}</span>
        <span className={title2Classes}>{t('header.title3')}</span>
      </div>
    </div>
  )
}
