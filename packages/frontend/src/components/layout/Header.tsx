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
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: colors.primary,
          color: colors.white,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.875rem',
          letterSpacing: '0.5px',
        }}>
          HAK
        </div>
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
