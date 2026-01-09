import { useAuth } from '../../services/auth';

export function AuthDisplay() {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  const handleLogin = () => {
    void login();
  };

  if (isAuthenticated) {
    return (
      <div className="auth-display">
        <span className="auth-display__email">{user?.email}</span>
        <button onClick={handleLogout} className="auth-display__btn auth-display__btn--logout">
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="auth-display__btn auth-display__btn--login">
      Login
    </button>
  );
}
