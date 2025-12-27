import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useAuth } from '../../services/auth'
import { colors, layout, gap, fontWeight, cursors, textDecoration } from '../../styles/colors'
import { Button, WaffleMenu, UserAvatar, NavTab, LogoWithText } from '../ui'

const headerStyle = {
  maxWidth: layout.maxWidthWide,
  margin: '0 auto',
  padding: '1rem 1.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const;

 
export function Header() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'synthesis' | 'tasks'>('synthesis')
  const { isAuthenticated, user, login, logout } = useAuth()

  return (
    <header style={headerStyle}>
      <LogoWithText />
      <nav style={{ display: 'flex', gap: gap.xxl }}>
        <NavTab
          label={t('nav.synthesis')}
          isActive={activeTab === 'synthesis'}
          onClick={() => { setActiveTab('synthesis'); }}
        />
        <NavTab
          label={t('nav.tasks')}
          isActive={activeTab === 'tasks'}
          onClick={() => { setActiveTab('tasks'); }}
        />
        <Link
          to="/specs"
          style={{
            padding: '0.5rem 0',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid transparent',
            color: colors.gray,
            fontSize: '0.9375rem',
            fontWeight: fontWeight.medium,
            cursor: cursors.pointer,
            textDecoration: textDecoration.none,
          }}
        >
          Tests
        </Link>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: gap.lg }}>
        {isAuthenticated && user ? (
          <>
            <UserAvatar 
              initials={user.email.substring(0, 2).toUpperCase()} 
              name={user.email} 
              id={user.id}
            />
            <Button variant="outline" onClick={() => { void logout(); }}>Logi välja</Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => { void login(); }}>Logi sisse</Button>
        )}
        <WaffleMenu />
      </div>
    </header>
  )
}
