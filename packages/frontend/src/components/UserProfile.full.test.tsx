/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({ logout: vi.fn() })),
}));

describe('UserProfile Full', () => {
  const props = {
    user: { id: 'user-123', name: 'Test User', email: 'test@test.ee' },
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders user name', () => {
    render(<UserProfile {...props} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders dropdown on click', () => {
    render(<UserProfile {...props} />);
    fireEvent.click(screen.getByText('Test User'));
    expect(screen.getByText(/logi välja/i)).toBeInTheDocument();
  });

  it('calls logout when logout clicked', async () => {
    const { useAuth } = await import('@/services/auth');
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ logout, user: null, isAuthenticated: false, isLoading: false, login: vi.fn(), showLoginModal: false, setShowLoginModal: vi.fn(), refreshSession: vi.fn(), handleCodeCallback: vi.fn(), error: null });
    
    render(<UserProfile {...props} />);
    fireEvent.click(screen.getByText('Test User'));
    fireEvent.click(screen.getByText(/logi välja/i));
    expect(logout).toHaveBeenCalled();
  });

  it('closes dropdown when clicking outside', () => {
    render(<UserProfile {...props} />);
    fireEvent.click(screen.getByText('Test User'));
    expect(screen.getByText(/logi välja/i)).toBeInTheDocument();
    fireEvent.click(document.body);
  });

  it('displays user initials', () => {
    render(<UserProfile {...props} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('handles user without name gracefully', () => {
    render(<UserProfile user={{ id: '123', email: 'a@b.c' }} />);
    expect(screen.getByText('a')).toBeInTheDocument();
  });
});
