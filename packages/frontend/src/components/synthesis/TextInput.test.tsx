import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { mockUseSynthesisStore, mockStoreWithText } from './test-utils';
import { TextInput } from './TextInput';

vi.mock('../../features', () => ({
  useSynthesisStore: vi.fn(),
}));

describe('TextInput', () => {
  const mockSetText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSynthesisStore.mockReturnValue({
      text: '',
      setText: mockSetText,
      isLoading: false,
    } as ReturnType<typeof mockUseSynthesisStore>);
  });

  it('should render textarea with placeholder', () => {
    render(<TextInput />);
    expect(screen.getByPlaceholderText('Sisesta eesti keelne tekst...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<TextInput placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should call setText on input change', () => {
    render(<TextInput />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(mockSetText).toHaveBeenCalledWith('Hello');
  });

  it('should truncate text at maxLength', () => {
    render(<TextInput maxLength={5} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    expect(mockSetText).toHaveBeenCalledWith('Hello');
  });

  it('should show character count', () => {
    mockStoreWithText('Test');
    render(<TextInput maxLength={500} />);
    expect(screen.getByText('4/500')).toBeInTheDocument();
  });

  it('should call onSynthesize when button clicked', () => {
    const onSynthesize = vi.fn();
    mockStoreWithText('Hello');
    render(<TextInput onSynthesize={onSynthesize} />);
    fireEvent.click(screen.getByText('Sünteesi'));
    expect(onSynthesize).toHaveBeenCalled();
  });

  it('should disable button when loading', () => {
    mockStoreWithText('Hello', true);
    render(<TextInput />);
    expect(screen.getByText('Töötlen...')).toBeDisabled();
  });

  it('should disable button when text is empty', () => {
    render(<TextInput />);
    expect(screen.getByText('Sünteesi')).toBeDisabled();
  });

  it('should call onSynthesize on Ctrl+Enter', () => {
    const onSynthesize = vi.fn();
    mockStoreWithText('Hello');
    render(<TextInput onSynthesize={onSynthesize} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(onSynthesize).toHaveBeenCalled();
  });

  it('should not call onSynthesize on Enter without Ctrl', () => {
    const onSynthesize = vi.fn();
    mockStoreWithText('Hello');
    render(<TextInput onSynthesize={onSynthesize} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSynthesize).not.toHaveBeenCalled();
  });
});
