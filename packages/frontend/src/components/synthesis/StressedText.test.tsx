import { render, screen } from '@testing-library/react';

import { StressedText } from './StressedText';
import { mockStoreWithPhonetic } from './test-utils';

jest.mock('../../features', () => ({
  useSynthesisStore: jest.fn(),
}));

describe('StressedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no text', () => {
    mockStoreWithPhonetic('', '');
    const { container } = render(<StressedText />);
    expect(container.querySelector('.stressed-text')).toBeNull();
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
