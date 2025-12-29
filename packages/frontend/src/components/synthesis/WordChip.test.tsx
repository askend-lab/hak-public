import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import { WordChip } from './WordChip';

describe('WordChip', () => {
  const defaultProps = {
    word: 'tere',
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render word text', () => {
    const { getByText } = render(<WordChip {...defaultProps} />);
    expect(getByText('tere')).toBeInTheDocument();
  });

  it('should have word-chip class', () => {
    const { container } = render(<WordChip {...defaultProps} />);
    expect(container.querySelector('.word-chip')).toBeInTheDocument();
  });

  it('should have data-word attribute', () => {
    const { container } = render(<WordChip {...defaultProps} />);
    const chip = container.querySelector('.word-chip');
    expect(chip).toHaveAttribute('data-word', 'tere');
  });

  it('should call onClick when clicked', () => {
    const { getByText } = render(<WordChip {...defaultProps} />);
    fireEvent.click(getByText('tere'));
    expect(defaultProps.onClick).toHaveBeenCalledWith('tere');
  });

  it('should have selected class when isSelected is true', () => {
    const { container } = render(<WordChip {...defaultProps} isSelected={true} />);
    expect(container.querySelector('.word-chip--selected')).toBeInTheDocument();
  });

  it('should not have selected class when isSelected is false', () => {
    const { container } = render(<WordChip {...defaultProps} isSelected={false} />);
    expect(container.querySelector('.word-chip--selected')).not.toBeInTheDocument();
  });

  it('should be accessible with role button', () => {
    const { container } = render(<WordChip {...defaultProps} />);
    const chip = container.querySelector('.word-chip');
    expect(chip).toHaveAttribute('role', 'button');
  });

  it('should be focusable with tabIndex', () => {
    const { container } = render(<WordChip {...defaultProps} />);
    const chip = container.querySelector('.word-chip');
    expect(chip).toHaveAttribute('tabIndex', '0');
  });

  it('should call onClick on Enter key press', () => {
    const { container } = render(<WordChip {...defaultProps} />);
    const chip = container.querySelector('.word-chip')!;
    fireEvent.keyDown(chip, { key: 'Enter' });
    expect(defaultProps.onClick).toHaveBeenCalledWith('tere');
  });

  it('should call onClick on Space key press', () => {
    const { container } = render(<WordChip {...defaultProps} />);
    const chip = container.querySelector('.word-chip')!;
    fireEvent.keyDown(chip, { key: ' ' });
    expect(defaultProps.onClick).toHaveBeenCalledWith('tere');
  });
});
