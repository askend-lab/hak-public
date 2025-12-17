import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../../styles/colors'
import { Logo, Button } from '../ui'
import { useAuth } from '../../services/auth'

export function Header() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'synthesis' | 'tasks'>('synthesis')
  const { isAuthenticated, user, login, logout } = useAuth()

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
        {isAuthenticated && user ? (
          /* Logged in - User profile */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#2D5A7B',
              color: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              {user.email?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: colors.primary,
              }}>
                {user.email}
              </span>
              <button
                onClick={logout}
                style={{
                  fontSize: '0.75rem',
                  color: colors.gray,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Logi välja
              </button>
            </div>
          </div>
        ) : (
          <Button variant="primary" onClick={login}>Logi sisse</Button>
        )}

        {/* Waffle menu */}
        <button style={{
          width: '40px',
          height: '40px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 6px)',
          gridTemplateRows: 'repeat(3, 6px)',
          gap: '4px',
          padding: '8px',
        }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: colors.gray,
            }} />
          ))}
        </button>
      </div>
    </header>
  )
}

export default Header
