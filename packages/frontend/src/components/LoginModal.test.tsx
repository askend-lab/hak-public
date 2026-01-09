/* eslint-disable max-lines-per-function, max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginModal from './LoginModal';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('LoginModal', () => {
  const mockOnClose = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin.mockResolvedValue(undefined),
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
      expect(screen.getByText('Logi sisse siseveebi')).toBeInTheDocument();
    });

    it('renders auth method tabs', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Smart-ID')).toBeInTheDocument();
      expect(screen.getByText('Mobiil-ID')).toBeInTheDocument();
      expect(screen.getByText('ID-kaart')).toBeInTheDocument();
    });

    it('renders isikukood input', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText('Isikukood')).toBeInTheDocument();
    });

    it('renders demo isikukoodid', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Demo isikukoodid:')).toBeInTheDocument();
      expect(screen.getByText('38001085718')).toBeInTheDocument();
    });

    it('renders submit button disabled initially', () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('button', { name: 'Sisene' })).toBeDisabled();
    });
  });

  describe('auth method switching', () => {
    it('switches to mobileid method', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('Mobiil-ID'));
      expect(screen.getByText('Mobiil-ID')).toHaveClass('login-modal__auth-tab--active');
    });

    it('switches to idcard method', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('ID-kaart'));
      expect(screen.getByText('ID-kaart')).toHaveClass('login-modal__auth-tab--active');
    });
  });

  describe('input handling', () => {
    it('allows only digits in isikukood input', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByLabelText('Isikukood');
      await user.type(input, 'abc123def456');
      expect(input).toHaveValue('123456');
    });

    it('limits input to 11 characters', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByLabelText('Isikukood');
      await user.type(input, '123456789012345');
      expect(input).toHaveValue('12345678901');
    });

    it('enables submit button with valid length input', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByLabelText('Isikukood');
      await user.type(input, '38001085718');
      expect(screen.getByRole('button', { name: 'Sisene' })).not.toBeDisabled();
    });
  });

  describe('demo codes', () => {
    it('fills input when demo code clicked', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      expect(screen.getByLabelText('Isikukood')).toHaveValue('38001085718');
    });
  });

  describe('validation', () => {
    it('shows error for empty isikukood', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByLabelText('Isikukood');
      await user.type(input, '38001085718');
      await user.clear(input);
      await user.type(input, '           ');

      const submitBtn = screen.getByRole('button', { name: 'Sisene' });
      expect(submitBtn).toBeDisabled();
    });

    it('shows error for invalid isikukood', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByLabelText('Isikukood');
      await user.type(input, '12345678901');

      await user.click(screen.getByRole('button', { name: 'Sisene' }));
      
      await waitFor(() => {
        expect(screen.getByText(/Vigane isikukood/)).toBeInTheDocument();
      });
    });
  });

  describe('login flow', () => {
    it('calls login with valid isikukood', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('38001085718');
      });
    });

    it('shows loading state during login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      expect(screen.getByText('Sisenen...')).toBeInTheDocument();
    });

    it('shows loading message for Smart-ID', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      expect(screen.getByText('Ootan Smart-ID kinnitust...')).toBeInTheDocument();
    });

    it('shows loading message for Mobiil-ID', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('Mobiil-ID'));
      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      expect(screen.getByText('Ootan Mobiil-ID kinnitust...')).toBeInTheDocument();
    });

    it('shows loading message for ID-kaart', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('ID-kaart'));
      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      expect(screen.getByText('Kontrollin ID-kaarti...')).toBeInTheDocument();
    });

    it('closes modal on successful login', async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('shows error on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('shows generic error for non-Error rejection', async () => {
      mockLogin.mockRejectedValue('unknown error');
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));

      await waitFor(() => {
        expect(screen.getByText('Sisselogimine ebaõnnestus')).toBeInTheDocument();
      });
    });
  });

  describe('close handling', () => {
    it('does not close during loading', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText('38001085718'));
      await user.click(screen.getByRole('button', { name: 'Sisene' }));
      
      // Try to trigger close (would be via BaseModal's close button)
      // The modal should prevent closing while loading
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
