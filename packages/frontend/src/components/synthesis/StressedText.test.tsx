import { render, screen } from '@testing-library/react';
import { StressedText } from './StressedText';
import { useSynthesisStore } from '../../features';

jest.mock('../../features', () => ({
  useSynthesisStore: jest.fn(),
}));

const mockUseSynthesisStore = useSynthesisStore as jest.MockedFunction<typeof useSynthesisStore>;

describe('StressedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no text', () => {
    mockUseSynthesisStore.mockReturnValue({
      phoneticText: '',
      text: '',
    } as any);

    const { container } = render(<StressedText />);
    expect(container.querySelector('.stressed-text')).toBeNull();
  });

  it('should render phonetic text when available', () => {
    mockUseSynthesisStore.mockReturnValue({
      phoneticText: 'te`re',
      text: 'tere',
    } as any);

    render(<StressedText />);
    expect(screen.getByText('te`re')).toBeInTheDocument();
  });

  it('should fall back to regular text when no phonetic', () => {
    mockUseSynthesisStore.mockReturnValue({
      phoneticText: '',
      text: 'tere',
    } as any);

    render(<StressedText />);
    expect(screen.getByText('tere')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseSynthesisStore.mockReturnValue({
      phoneticText: 'test',
      text: 'test',
    } as any);

    render(<StressedText className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should show label', () => {
    mockUseSynthesisStore.mockReturnValue({
      phoneticText: 'test',
      text: 'test',
    } as any);

    render(<StressedText />);
    expect(screen.getByText('Foneetiline tekst:')).toBeInTheDocument();
  });
});
