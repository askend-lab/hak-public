import { useAuth } from '../../services/auth';

const colors = {
  primary: '#173148',
  white: '#FFFFFF',
  gray: '#636B74',
};

export function AuthDisplay() {
  const { isAuthenticated, user, login, logout } = useAuth();

  
  
  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: colors.primary, fontWeight: 500 }}>{user?.email}</span>
        <button
          onClick={logout}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: '8px',
            color: colors.gray,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      style={{
        padding: '0.75rem 1.5rem',
        background: colors.primary,
        border: '1px solid transparent',
        borderRadius: '8px',
        color: colors.white,
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      Login
    </button>
  );
}
