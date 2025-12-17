import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'
import { colors } from '../../styles/colors'

export function Header() {
  const { t } = useTranslation()

  return (
    <header style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="8" fill={colors.primary}/>
          <path d="M34 8H14V28H26C25.8 32 24.8 34.5 23 36.2C21.2 37.9 18.2 38.9 14 39V44C26 43.6 34 37 34 24V8Z" fill={colors.white}/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: '0.5px',
          }}>
            {t('header.title1')}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: colors.primary,
            letterSpacing: '0.25px',
          }}>
            {t('header.title2')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: colors.primary,
            border: '1px solid transparent',
            borderRadius: '8px',
            color: colors.white,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            {t('nav.synthesis')}
          </button>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: '8px',
            color: colors.gray,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            {t('nav.tasks')}
          </button>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  )
}

export default Header
