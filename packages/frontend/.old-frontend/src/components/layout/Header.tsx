import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useSynthesisStore } from '../../features'
import { useAuth } from '../../services/auth'
import { Button, WaffleMenu, UserAvatar, NavTab, LogoWithText, SynthesisIcon, TasksIcon, SpecsIcon } from '../ui'

function getActiveTab(pathname: string): 'synthesis' | 'tasks' | 'specs' {
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/specs')) return 'specs';
  return 'synthesis';
}

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = getActiveTab(location.pathname)
  const { isAuthenticated, user, login, logout, refreshSession } = useAuth()
  const resetSynthesis = useSynthesisStore(state => state.reset)

  const handleReset = (): void => {
    resetSynthesis()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header__container">
        <LogoWithText />
        <nav className="header__nav">
        <NavTab
          label={t('nav.synthesis')}
          isActive={activeTab === 'synthesis'}
          onClick={() => { navigate('/'); }}
          icon={<SynthesisIcon />}
        />
        <NavTab
          label={t('nav.tasks')}
          isActive={activeTab === 'tasks'}
          onClick={() => { navigate('/tasks'); }}
          icon={<TasksIcon />}
        />
        <NavTab
          label="Tests"
          isActive={activeTab === 'specs'}
          onClick={() => { navigate('/specs'); }}
          icon={<SpecsIcon />}
        />
      </nav>
      <div className="header__actions">
        {isAuthenticated && user ? (
          <UserAvatar 
            initials={user.email.substring(0, 2).toUpperCase()} 
            name={user.name ?? user.email} 
            email={user.email}
            idCode="23456789765"
            onReset={handleReset}
            onLogout={() => { void logout(); }}
            onRefreshToken={user.email === 'aleksei.bljahhin@gmail.com' ? refreshSession : undefined}
          />
        ) : (
          <Button variant="primary" onClick={() => { void login(); }}>Logi sisse</Button>
        )}
        <WaffleMenu />
        </div>
      </div>
    </header>
  )
}
