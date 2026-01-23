 
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import RoleSelectionPage from './RoleSelectionPage';

describe('RoleSelectionPage render', () => {
  const renderWithProvider = () => {
    return render(
      <MemoryRouter>
        <OnboardingProvider>
          <RoleSelectionPage />
        </OnboardingProvider>
      </MemoryRouter>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderWithProvider();
    expect(container).toBeInTheDocument();
  });

  it('renders role options', () => {
    renderWithProvider();
    
    // Check for role-related content
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has clickable elements', () => {
    renderWithProvider();
    
    const clickables = screen.getAllByRole('button');
    expect(clickables.length).toBeGreaterThanOrEqual(1);
  });
});
