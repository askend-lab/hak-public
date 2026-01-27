 
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const mockHandleCodeCallback = vi.fn();
const mockHandleTaraTokens = vi.fn();
vi.mock('../services/auth', () => ({
  useAuth: () => ({ 
    handleCodeCallback: mockHandleCodeCallback,
    handleTaraTokens: mockHandleTaraTokens,
  }),
}));

import { AuthCallbackPage } from './AuthCallbackPage';

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { search: '', hash: '' },
      writable: true,
    });
  });

  it('redirects to home when code callback succeeds', async () => {
    window.location.search = '?code=test-auth-code';
    mockHandleCodeCallback.mockResolvedValue(true);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockHandleCodeCallback).toHaveBeenCalledWith('test-auth-code');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows error when code callback fails', async () => {
    window.location.search = '?code=invalid-code';
    mockHandleCodeCallback.mockResolvedValue(false);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/Autentimise viga/)).toBeInTheDocument();
    });
  });

  it('shows error from query params', async () => {
    window.location.search = '?error=access_denied&error_description=User%20denied';

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/User denied/)).toBeInTheDocument();
    });
  });

  it('redirects to home when no code or error', async () => {
    window.location.search = '';

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows loading state initially', () => {
    window.location.search = '?code=test-code';
    mockHandleCodeCallback.mockImplementation(() => new Promise(() => {}));

    render(<AuthCallbackPage />);

    expect(screen.getByText('Sisenen...')).toBeInTheDocument();
  });
});
