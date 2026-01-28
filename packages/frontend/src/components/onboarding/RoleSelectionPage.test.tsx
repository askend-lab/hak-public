 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);
      expect(screen.getByText('Vali oma roll')).toBeInTheDocument();
    });

    it('renders role cards', () => {
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);
      expect(document.querySelectorAll('.role-card').length).toBeGreaterThan(0);
    });

    it('renders learner role', () => {
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);
      expect(screen.getByText(/Olen õppija/i)).toBeInTheDocument();
    });

    it('renders teacher role', () => {
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);
      expect(screen.getByText(/Olen õpetaja/i)).toBeInTheDocument();
    });

    it('renders specialist role', () => {
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);
      expect(screen.getByText(/Olen uurija/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls selectRole when button clicked', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);

      const buttons = screen.getAllByRole('button');
      if (buttons[0]) {
        await user.click(buttons[0]);
        expect(mockSelectRole).toHaveBeenCalled();
      }
    });

    it('calls selectRole with learner role', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><RoleSelectionContent /></MemoryRouter>);

      const buttons = screen.getAllByRole('button');
      if (buttons[0]) {
        await user.click(buttons[0]);
        expect(mockSelectRole).toHaveBeenCalledWith('learner');
      }
    });
  });
});
