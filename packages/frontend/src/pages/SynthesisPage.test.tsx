import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SynthesisPage } from './SynthesisPage';
import { useSynthesisStore } from '../features';
import { synthesizeWithRetry } from '../services/audio';

jest.mock('../features', () => ({
  useSynthesisStore: jest.fn(),
}));

jest.mock('../services/audio', () => ({
  synthesizeWithRetry: jest.fn(),
}));

jest.mock('../components', () => ({
  TextInput: ({ onSynthesize }: { onSynthesize: () => void }) => (
    <button onClick={onSynthesize} data-testid="synthesize">Synthesize</button>
  ),
  AudioPlayer: () => <div data-testid="audio-player">AudioPlayer</div>,
  StressedText: () => <div data-testid="stressed-text">StressedText</div>,
  AddToTaskButton: () => <div data-testid="add-to-task">AddToTask</div>,
  TaskSelectModal: () => <div data-testid="task-modal">TaskModal</div>,
  NotificationContainer: () => <div data-testid="notifications">Notifications</div>,
}));

const mockUseSynthesisStore = useSynthesisStore as jest.MockedFunction<typeof useSynthesisStore>;
const mockSynthesizeWithRetry = synthesizeWithRetry as jest.MockedFunction<typeof synthesizeWithRetry>;

describe('SynthesisPage', () => {
  const mockSetResult = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSynthesisStore.mockReturnValue({
      text: 'test text',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render page title', () => {
    render(<SynthesisPage />);
    expect(screen.getByText('Eesti keele häälduse õpe')).toBeInTheDocument();
  });

  it('should render components when not loading', () => {
    render(<SynthesisPage />);
    expect(screen.getByTestId('audio-player')).toBeInTheDocument();
    expect(screen.getByTestId('stressed-text')).toBeInTheDocument();
    expect(screen.getByTestId('add-to-task')).toBeInTheDocument();
  });

  it('should not render audio components when loading', () => {
    mockUseSynthesisStore.mockReturnValue({
      text: 'test',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: true,
      error: null,
    } as any);

    render(<SynthesisPage />);
    expect(screen.queryByTestId('audio-player')).not.toBeInTheDocument();
  });

  it('should show error message when error exists', () => {
    mockUseSynthesisStore.mockReturnValue({
      text: 'test',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: 'Something went wrong',
    } as any);

    render(<SynthesisPage />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should call synthesize on button click', async () => {
    mockSynthesizeWithRetry.mockResolvedValue({ audioUrl: 'test.mp3' });

    render(<SynthesisPage />);
    fireEvent.click(screen.getByTestId('synthesize'));

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true);
    });
  });

  it('should not synthesize empty text', async () => {
    mockUseSynthesisStore.mockReturnValue({
      text: '   ',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    } as any);

    render(<SynthesisPage />);
    fireEvent.click(screen.getByTestId('synthesize'));

    expect(mockSetLoading).not.toHaveBeenCalled();
  });

  it('should handle synthesis error', async () => {
    mockSynthesizeWithRetry.mockRejectedValue(new Error('Synthesis failed'));

    render(<SynthesisPage />);
    fireEvent.click(screen.getByTestId('synthesize'));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Synthesis failed');
    });
  });

  it('should handle non-Error synthesis error', async () => {
    mockSynthesizeWithRetry.mockRejectedValue('Unknown error');

    render(<SynthesisPage />);
    fireEvent.click(screen.getByTestId('synthesize'));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Süntees ebaõnnestus');
    });
  });
});
