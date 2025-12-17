import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/colors'
import { Logo, Button, WaffleMenu, UserAvatar } from '../ui'

interface HeaderProps {
  isLoggedIn?: boolean
  user?: {
    name: string
    id: string
    initials: string
  }
}

export function Header({ isLoggedIn = false, user }: HeaderProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'synthesis' | 'tasks'>('synthesis')

  return (
    <header style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Logo size="small" />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: '0.5px',
          }}>
            {t('header.title1')}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: colors.primary,
          }}>
            {t('header.title2')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '2rem' }}>
        <button
          onClick={() => setActiveTab('synthesis')}
          style={{
            padding: '0.5rem 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'synthesis' ? `2px solid ${colors.primary}` : '2px solid transparent',
            color: activeTab === 'synthesis' ? colors.primary : colors.gray,
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t('nav.synthesis')}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '0.5rem 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'tasks' ? `2px solid ${colors.primary}` : '2px solid transparent',
            color: activeTab === 'tasks' ? colors.primary : colors.gray,
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t('nav.tasks')}
        </button>
      </nav>

      {/* Right side - Auth & Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isLoggedIn && user ? (
          <UserAvatar initials={user.initials} name={user.name} id={user.id} />
        ) : (
          <Button variant="primary">Logi sisse</Button>
        )}

        <WaffleMenu />
      </div>
    </header>
  )
}

export default Header
