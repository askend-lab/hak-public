import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
  describe('Bug #4: Isikukood display', () => {
    it('should display Isikukood in dropdown when provided', () => {
      render(
        <UserAvatar 
          initials="MT" 
          name="Margus Tamm" 
          email="margus@example.com"
          idCode="23456789765"
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));

      // Should show Isikukood label and value
      expect(screen.getByText(/Isikukood:/)).toBeInTheDocument();
      expect(screen.getByText(/23456789765/)).toBeInTheDocument();
    });
  });

  describe('Bug #5: Reset button text', () => {
    it('should show "Kustuta kohalikud andmed" for reset button', () => {
      const mockReset = vi.fn();
      render(
        <UserAvatar 
          initials="MT" 
          name="Margus Tamm" 
          email="margus@example.com"
          onReset={mockReset}
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));

      // Should show correct text for reset button
      expect(screen.getByText('Kustuta kohalikud andmed')).toBeInTheDocument();
    });
  });

  describe('Bug #7: Avatar circle in dropdown', () => {
    it('should show avatar circle with initials in dropdown', () => {
      render(
        <UserAvatar 
          initials="MT" 
          name="Margus Tamm" 
          email="margus@example.com"
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));

      // Should have two instances of initials - one in button, one in dropdown
      const initials = screen.getAllByText('MT');
      expect(initials.length).toBe(2);
    });
  });

  describe('Bug #6: Menu button icons', () => {
    it('should have trash icon on reset button', () => {
      const mockReset = vi.fn();
      render(
        <UserAvatar 
          initials="MT" 
          name="Margus Tamm" 
          email="margus@example.com"
          onReset={mockReset}
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));

      // Should have trash icon (SVG with specific test-id or aria-label)
      const resetButton = screen.getByText('Kustuta kohalikud andmed').closest('button');
      expect(resetButton?.querySelector('svg')).toBeInTheDocument();
    });

    it('should have logout icon on logout button', () => {
      const mockLogout = vi.fn();
      render(
        <UserAvatar 
          initials="MT" 
          name="Margus Tamm" 
          email="margus@example.com"
          onLogout={mockLogout}
        />
      );

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));

      // Should have logout icon
      const logoutButton = screen.getByText('Logi välja').closest('button');
      expect(logoutButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('should render user initials, name and email', () => {
    render(
      <UserAvatar 
        initials="JD" 
        name="John Doe" 
        email="john@example.com" 
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle single character initials', () => {
    render(
      <UserAvatar 
        initials="A" 
        name="Alice" 
        email="alice@example.com" 
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle empty initials', () => {
    render(
      <UserAvatar 
        initials="" 
        name="No Initials" 
        email="no-initials@example.com" 
      />
    );

    // Should render without crashing
    expect(screen.getByText('No Initials')).toBeInTheDocument();
    expect(screen.getByText('no-initials@example.com')).toBeInTheDocument();
  });

  it('should handle missing email (optional prop)', () => {
    render(
      <UserAvatar 
        initials="LMN" 
        name="Very Long User Name That Might Overflow" 
      />
    );

    expect(screen.getByText('LMN')).toBeInTheDocument();
    expect(screen.getByText('Very Long User Name That Might Overflow')).toBeInTheDocument();
  });
});
