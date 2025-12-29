import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../services/auth'
import { Button, WaffleMenu, UserAvatar, NavTab, LogoWithText } from '../ui'

function getActiveTab(pathname: string): 'synthesis' | 'tasks' {
  if (pathname.startsWith('/tasks')) return 'tasks';
  return 'synthesis';
}

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = getActiveTab(location.pathname)
  const { isAuthenticated, user, login, logout } = useAuth()

  return (
    <header className="header">
      <LogoWithText />
      <nav className="header__nav">
        <NavTab
          label={t('nav.synthesis')}
          isActive={activeTab === 'synthesis'}
          onClick={() => { navigate('/'); }}
        />
        <NavTab
          label={t('nav.tasks')}
          isActive={activeTab === 'tasks'}
          onClick={() => { navigate('/tasks'); }}
        />
        <Link to="/specs" className="header__link">Tests</Link>
      </nav>
      <div className="header__actions">
        {isAuthenticated && user ? (
          <>
            <UserAvatar 
              initials={user.email.substring(0, 2).toUpperCase()} 
              name={user.name ?? user.email} 
              email={user.email}
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
