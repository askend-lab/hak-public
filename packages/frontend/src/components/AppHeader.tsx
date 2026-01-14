import UserProfile from './UserProfile';
import { HelpIcon, MenuIcon } from './ui/Icons';
import type { User } from '@/services/auth';

interface AppHeaderProps {
  currentView: 'synthesis' | 'tasks' | 'specs' | 'dashboard';
  isAuthenticated: boolean;
  user: User | null;
  onSynthesisClick: () => void;
  onTasksClick: () => void;
  onSpecsClick: () => void;
  onDashboardClick: () => void;
  onHelpClick: () => void;
  onLoginClick: () => void;
}

export default function AppHeader({ currentView, isAuthenticated, user, onSynthesisClick, onTasksClick, onSpecsClick, onDashboardClick, onHelpClick, onLoginClick }: AppHeaderProps) {
  return (
    <header className="page-layout__header">
      <div className="page-layout__header-content">
        <div className="eki-logo"><img src="/icons/logo.svg" alt="EKI Logo" /></div>
        <nav className="header-nav">
          <a href="#" className={`header-nav-link ${currentView === 'synthesis' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onSynthesisClick(); }}>Kõnesüntees</a>
          <a href="#" className={`header-nav-link ${currentView === 'tasks' ? 'active' : ''}`} data-nav="tasks" onClick={(e) => { e.preventDefault(); onTasksClick(); }}>Ülesanded</a>
          <a href="#" className={`header-nav-link ${currentView === 'specs' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onSpecsClick(); }}>Testid</a>
          <a href="#" className={`header-nav-link ${currentView === 'dashboard' ? 'active' : ''}`} data-nav="dashboard" onClick={(e) => { e.preventDefault(); onDashboardClick(); }}>Töölaud</a>
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
