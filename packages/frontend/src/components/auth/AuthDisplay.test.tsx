import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AuthDisplay } from './AuthDisplay';
import { AuthProvider } from '../../services/auth/context';
import { AuthStorage } from '../../services/auth/storage';

const renderWithAuth = (ui: React.ReactElement) => render(<AuthProvider>{ui}</AuthProvider>);

describe('AuthDisplay', () => {
  beforeEach(() => {
    cleanup();
    AuthStorage.clear();
  });

  it('should render login button when not authenticated', () => {
    renderWithAuth(<AuthDisplay />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should call login when login button is clicked', () => {
    renderWithAuth(<AuthDisplay />);
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should show user email when authenticated', () => {
    renderWithAuth(<AuthDisplay />);
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should logout when logout button is clicked', () => {
    renderWithAuth(<AuthDisplay />);
    fireEvent.click(screen.getByText('Login'));
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
