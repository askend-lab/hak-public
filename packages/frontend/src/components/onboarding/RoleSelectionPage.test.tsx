/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleSelectionContent from './RoleSelectionPage';

vi.mock('@/contexts/OnboardingContext', () => ({
  useOnboarding: vi.fn(() => ({
    selectRole: vi.fn(),
  })),
}));

import { useOnboarding } from '@/contexts/OnboardingContext';

describe('RoleSelectionContent', () => {
  const mockSelectRole = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOnboarding as ReturnType<typeof vi.fn>).mockReturnValue({
      selectRole: mockSelectRole,
    });
  });

  describe('rendering', () => {
    it('renders title', () => {
      render(<RoleSelectionContent />);
      expect(screen.getByText('Teksti kõnesünteesiks vali oma roll')).toBeInTheDocument();
    });

    it('renders role cards', () => {
      render(<RoleSelectionContent />);
      expect(document.querySelectorAll('.role-card').length).toBeGreaterThan(0);
    });

    it('renders learner role', () => {
      render(<RoleSelectionContent />);
      expect(screen.getByText(/Olen õppija/i)).toBeInTheDocument();
    });

    it('renders teacher role', () => {
      render(<RoleSelectionContent />);
      expect(screen.getByText(/Olen õpetaja/i)).toBeInTheDocument();
    });

    it('renders specialist role', () => {
      render(<RoleSelectionContent />);
      expect(screen.getByText(/Olen kõnesünteesi spetsialist/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls selectRole when button clicked', async () => {
      const user = userEvent.setup();
      render(<RoleSelectionContent />);

      const buttons = screen.getAllByRole('button');
      if (buttons[0]) {
        await user.click(buttons[0]);
        expect(mockSelectRole).toHaveBeenCalled();
      }
    });

    it('calls selectRole with learner role', async () => {
      const user = userEvent.setup();
      render(<RoleSelectionContent />);

      const buttons = screen.getAllByRole('button');
      if (buttons[0]) {
        await user.click(buttons[0]);
        expect(mockSelectRole).toHaveBeenCalledWith('learner');
      }
    });
  });
});
