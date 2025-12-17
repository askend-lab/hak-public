import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from './TextInput';
import { useSynthesisStore } from '../../features';

// Mock the store
jest.mock('../../features', () => ({
  useSynthesisStore: jest.fn(),
}));

const mockUseSynthesisStore = useSynthesisStore as jest.MockedFunction<typeof useSynthesisStore>;

describe('TextInput', () => {
  const mockSetText = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSynthesisStore.mockReturnValue({
      text: '',
      setText: mockSetText,
      isLoading: false,
    } as any);
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
    mockUseSynthesisStore.mockReturnValue({
      text: 'Test',
      setText: mockSetText,
      isLoading: false,
    } as any);
    
    render(<TextInput maxLength={500} />);
    expect(screen.getByText('4/500')).toBeInTheDocument();
  });

  it('should call onSynthesize when button clicked', () => {
    const onSynthesize = jest.fn();
    mockUseSynthesisStore.mockReturnValue({
      text: 'Hello',
      setText: mockSetText,
      isLoading: false,
    } as any);
    
    render(<TextInput onSynthesize={onSynthesize} />);
    fireEvent.click(screen.getByText('Sünteesi'));
    expect(onSynthesize).toHaveBeenCalled();
  });

  it('should disable button when loading', () => {
    mockUseSynthesisStore.mockReturnValue({
      text: 'Hello',
      setText: mockSetText,
      isLoading: true,
    } as any);
    
    render(<TextInput />);
    expect(screen.getByText('Töötlen...')).toBeDisabled();
  });

  it('should disable button when text is empty', () => {
    render(<TextInput />);
    expect(screen.getByText('Sünteesi')).toBeDisabled();
  });

  it('should call onSynthesize on Ctrl+Enter', () => {
    const onSynthesize = jest.fn();
    mockUseSynthesisStore.mockReturnValue({
      text: 'Hello',
      setText: mockSetText,
      isLoading: false,
    } as any);
    
    render(<TextInput onSynthesize={onSynthesize} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(onSynthesize).toHaveBeenCalled();
  });

  it('should not call onSynthesize on Enter without Ctrl', () => {
    const onSynthesize = jest.fn();
    mockUseSynthesisStore.mockReturnValue({
      text: 'Hello',
      setText: mockSetText,
      isLoading: false,
    } as any);
    
    render(<TextInput onSynthesize={onSynthesize} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSynthesize).not.toHaveBeenCalled();
  });
});
