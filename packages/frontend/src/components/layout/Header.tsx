import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, WaffleMenu, UserAvatar, NavTab, LogoWithText } from '../ui'

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
