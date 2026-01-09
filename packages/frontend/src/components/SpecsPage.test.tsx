import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpecsPage from './SpecsPage';

vi.mock('./specs', () => ({
  SpecsNav: () => <div data-testid="specs-nav">Nav</div>,
  SpecsContent: () => <div data-testid="specs-content">Content</div>
}));

vi.mock('../services/specs', () => ({
  loadCucumberResults: vi.fn().mockResolvedValue(null),
  getFeatureGroups: vi.fn(() => ({})),
  parseCucumberResults: vi.fn(() => [])
}));

vi.mock('@hak/specifications', () => ({
  parseFeatureContent: vi.fn(() => null)
}));

describe('SpecsPage', () => {
  const mockOnBack = vi.fn();
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders specs page container', () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(document.querySelector('.specs-page')).toBeTruthy();
  });

  it('renders header with title', () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(screen.getByText('Testid')).toBeTruthy();
  });

  it('renders back button with text', () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(screen.getByText(/Tagasi/)).toBeTruthy();
  });

  it('calls onBack when back button clicked', () => {
    render(<SpecsPage onBack={mockOnBack} />);
    fireEvent.click(screen.getByText(/Tagasi/));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('shows loading text initially', () => {
    render(<SpecsPage onBack={mockOnBack} />);
    expect(screen.getByText(/Laen spetsifikatsioone/)).toBeTruthy();
  });
});
