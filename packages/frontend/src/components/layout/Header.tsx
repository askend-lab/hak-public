import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, WaffleMenu, UserAvatar, NavTab, LogoWithText } from '../ui'
import { colors } from '../../styles/colors'
import { useAuth } from '../../services/auth'

export function Header() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'synthesis' | 'tasks'>('synthesis')
  const { isAuthenticated, user, login } = useAuth()

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
      <LogoWithText />

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '2rem' }}>
        <NavTab
          label={t('nav.synthesis')}
          isActive={activeTab === 'synthesis'}
          onClick={() => setActiveTab('synthesis')}
        />
        <NavTab
          label={t('nav.tasks')}
          isActive={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
        />
        <Link
          to="/tests"
          style={{
            padding: '0.5rem 0',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid transparent',
            color: colors.gray,
            fontSize: '0.9375rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Tests
        </Link>
      </nav>

      {/* Right side - Auth & Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated && user ? (
          <UserAvatar 
            initials={user.email?.substring(0, 2).toUpperCase() || 'U'} 
            name={user.email || ''} 
            id={user.id}
          />
        ) : (
          <Button variant="primary" onClick={login}>Logi sisse</Button>
        )}

        <WaffleMenu />
      </div>
    </header>
  )
}

export default Header
