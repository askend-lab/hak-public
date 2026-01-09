/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfile from './UserProfile';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    logout: vi.fn(),
  })),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('UserProfile', () => {
  const mockUser = {
    id: '38001085718',
    name: 'Margus Tamm',
    email: 'margus@test.ee'
  };
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      logout: mockLogout,
    });
  });

  describe('rendering', () => {
    it('renders user avatar with initials', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('MT')).toBeInTheDocument();
    });

    it('renders user name', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('Margus Tamm')).toBeInTheDocument();
    });

    it('renders user id', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText('38001085718')).toBeInTheDocument();
    });

    it('dropdown is closed by default', () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.queryByText('Logi välja')).not.toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('opens dropdown when button clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('Logi välja')).toBeInTheDocument();
      expect(screen.getByText('Kustuta kohalikud andmed')).toBeInTheDocument();
    });

    it('shows user details in dropdown', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('margus@test.ee')).toBeInTheDocument();
      expect(screen.getByText('Isikukood: 38001085718')).toBeInTheDocument();
    });

    it('closes dropdown when backdrop clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByText('Logi välja')).toBeInTheDocument();

      const backdrop = document.querySelector('.user-profile__backdrop');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(screen.queryByText('Logi välja')).not.toBeInTheDocument();
    });
  });

  describe('logout', () => {
    it('calls logout when logout button clicked', async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('Logi välja'));

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('avatar initials', () => {
    it('handles single name', () => {
      render(<UserProfile user={{ ...mockUser, name: 'Margus' }} />);
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('handles multiple names', () => {
      render(<UserProfile user={{ ...mockUser, name: 'Margus Erik Tamm' }} />);
      expect(screen.getByText('MET')).toBeInTheDocument();
    });
  });
});
