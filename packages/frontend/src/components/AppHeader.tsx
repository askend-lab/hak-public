import { NavLink } from 'react-router-dom';
import UserProfile from './UserProfile';
import { HelpIcon, MenuIcon } from './ui/Icons';
import type { User } from '@/services/auth';

interface AppHeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  onTasksClick: () => void;
  onHelpClick: () => void;
  onLoginClick: () => void;
}

export default function AppHeader({ isAuthenticated, user, onTasksClick, onHelpClick, onLoginClick }: AppHeaderProps) {
  const handleTasksClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onTasksClick();
    }
  };

  return (
    <header className="page-layout__header">
      <div className="page-layout__header-content">
        <div className="eki-logo"><img src="/icons/logo.svg" alt="EKI Logo" /></div>
        <nav className="header-nav">
          <NavLink to="/synthesis" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Kõnesüntees</NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`} data-nav="tasks" onClick={handleTasksClick}>Ülesanded</NavLink>
          <NavLink to="/specs" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>Testid</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`} data-nav="dashboard">Töölaud</NavLink>
        </nav>
        <div className="header-functions">
          <button className="header-help-button" onClick={onHelpClick} aria-label="Abi ja juhend" title="Näita juhendeid">
            <HelpIcon size="2xl" />
          </button>
          {isAuthenticated && user ? <UserProfile user={user} /> : <button className="header-login-button" onClick={onLoginClick}>Logi sisse</button>}
          <button className="header-menu-button" aria-label="Menu"><MenuIcon size="2xl" /></button>
        </div>
      </div>
    </header>
  );
}
