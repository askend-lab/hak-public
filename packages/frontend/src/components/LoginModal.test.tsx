 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginModal from './LoginModal';

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(undefined),
    loginWithTara: vi.fn(),
  })),
}));

import { useAuth } from '@/services/auth';

describe('LoginModal', () => {
  const mockOnClose = vi.fn();
  const mockLogin = vi.fn();
  const mockLoginWithTara = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin.mockResolvedValue(undefined),
      loginWithTara: mockLoginWithTara,
    });
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <LoginModal isOpen={false} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Logi sisse')).toBeInTheDocument();
    });

    it('renders Google login button', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/Jätka Google/)).toBeInTheDocument();
    });

    it('renders description for Google login', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/Sisene oma Google kontoga/)).toBeInTheDocument();
    });
  });

  describe('login flow', () => {
    it('calls login when Google button clicked', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      expect(mockLogin).toHaveBeenCalled();
    });

    it('shows loading state during login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      // Both buttons show loading text when loading
      expect(screen.getAllByText('Suunan...').length).toBeGreaterThan(0);
    });

    it('shows error on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      await vi.waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('shows generic error for non-Error rejection', async () => {
      mockLogin.mockRejectedValue('unknown error');
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      await vi.waitFor(() => {
        expect(screen.getByText('Sisselogimine ebaõnnestus')).toBeInTheDocument();
      });
    });
  });

  describe('close handling', () => {
    it('does not close during loading', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
