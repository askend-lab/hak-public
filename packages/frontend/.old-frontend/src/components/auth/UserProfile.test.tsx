import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfile } from './UserProfile';
import type { AuthContextValue } from '../../services/auth/types';

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../services/auth';

const mockAuth = (overrides: Partial<AuthContextValue>): AuthContextValue => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('UserProfile', () => {
  it('returns null when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({ isAuthenticated: false, user: null }));
    const { container } = render(<UserProfile />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no user', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({ isAuthenticated: true, user: null }));
    const { container } = render(<UserProfile />);
    expect(container.firstChild).toBeNull();
  });

  it('renders user profile with name and email', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    }));
    render(<UserProfile />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders user profile with picture', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', picture: 'https://example.com/pic.jpg' },
    }));
    render(<UserProfile />);
    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });

  it('renders email as name fallback when no name', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
    }));
    render(<UserProfile />);
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('renders with custom stats', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({
      isAuthenticated: true,
      user: { id: '1', name: 'Test', email: 'test@example.com' },
    }));
    render(<UserProfile stats={{ tasksCreated: 5, totalEntries: 10, createdAt: '2024-01-01' }} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('renders default stats when none provided', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({
      isAuthenticated: true,
      user: { id: '1', name: 'Test', email: 'test@example.com' },
    }));
    render(<UserProfile />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Tasks Created')).toBeInTheDocument();
  });
});
