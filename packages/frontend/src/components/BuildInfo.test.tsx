import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BuildInfo from './BuildInfo';

describe('BuildInfo', () => {
  it('renders build info button with hash', () => {
    render(<BuildInfo />);
    expect(document.querySelector('.build-info-button')).toBeTruthy();
    expect(document.querySelector('.build-info-hash')).toBeTruthy();
  });

  it('opens modal with info when clicked', () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Build Info')).toBeTruthy();
    expect(screen.getByText('Hash')).toBeTruthy();
    expect(screen.getByText('Branch')).toBeTruthy();
  });

  it('closes modal when overlay or close button clicked', () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText('Build Info')).toBeNull();
  });
});
