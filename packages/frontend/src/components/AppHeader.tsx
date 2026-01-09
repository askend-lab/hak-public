import UserProfile from './UserProfile';
interface User {
  id: string;
  email: string;
  name: string;
}

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </button>
          {isAuthenticated && user ? <UserProfile user={user} /> : <button className="header-login-button" onClick={onLoginClick}>Logi sisse</button>}
          <button className="header-menu-button" aria-label="Menu"><img src="/icons/Group.svg" alt="Menu" /></button>
        </div>
      </div>
    </header>
  );
}
