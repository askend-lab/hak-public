import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StressedText } from './StressedText';
import { mockStoreWithPhonetic } from './test-utils';

vi.mock('../../features', () => ({
  useSynthesisStore: vi.fn(),
}));

describe('StressedText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render label but no content when no text', () => {
    mockStoreWithPhonetic('', '');
    render(<StressedText />);
    expect(screen.getByText('Foneetiline tekst:')).toBeInTheDocument();
    expect(document.querySelector('.stressed-text__content')).toBeNull();
  });

  it('should render phonetic text when available', () => {
    mockStoreWithPhonetic('te`re', 'tere');
    render(<StressedText />);
    expect(screen.getByText('te`re')).toBeInTheDocument();
  });

  it('should fall back to regular text when no phonetic', () => {
    mockStoreWithPhonetic('', 'tere');
    render(<StressedText />);
    expect(screen.getByText('tere')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockStoreWithPhonetic('test', 'test');
    render(<StressedText className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should show label', () => {
    mockStoreWithPhonetic('test', 'test');
    render(<StressedText />);
    expect(screen.getByText('Foneetiline tekst:')).toBeInTheDocument();
  });
});
