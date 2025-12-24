import { useAuth } from '../../services/auth';
import { colors, gap, borderRadius, fontWeight, cursors } from '../../styles/colors';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: gap.lg }}>
        <span style={{ color: colors.primary, fontWeight: fontWeight.medium }}>{user?.email}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: borderRadius.small,
            color: colors.gray,
            fontSize: '0.875rem',
            fontWeight: fontWeight.medium,
            cursor: cursors.pointer,
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: '0.75rem 1.5rem',
        background: colors.primary,
        border: '1px solid transparent',
        borderRadius: borderRadius.small,
        color: colors.white,
        fontSize: '0.875rem',
        fontWeight: fontWeight.medium,
        cursor: cursors.pointer,
      }}
    >
      Login
    </button>
  );
}
