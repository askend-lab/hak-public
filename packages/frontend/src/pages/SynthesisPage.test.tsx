import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useSynthesisStore } from '../features';
import { synthesizeWithRetry } from '../services/audio';

import { SynthesisPage } from './SynthesisPage';

vi.mock('../features', () => ({
  useSynthesisStore: vi.fn(),
}));

vi.mock('../services/audio', () => ({
  synthesizeWithRetry: vi.fn(),
}));

vi.mock('../components', () => ({
  TextInput: ({ onSynthesize }: { onSynthesize: () => void }) => (
    <button onClick={onSynthesize} data-testid="synthesize">Synthesize</button>
  ),
  AudioPlayer: () => <div data-testid="audio-player">AudioPlayer</div>,
  StressedText: () => <div data-testid="stressed-text">StressedText</div>,
  AddToTaskButton: () => <div data-testid="add-to-task">AddToTask</div>,
  TaskSelectModal: () => <div data-testid="task-modal">TaskModal</div>,
  NotificationContainer: () => <div data-testid="notifications">Notifications</div>,
}));

const mockUseSynthesisStore = useSynthesisStore as vi.MockedFunction<typeof useSynthesisStore>;
const mockSynthesizeWithRetry = synthesizeWithRetry as vi.MockedFunction<typeof synthesizeWithRetry>;

describe('SynthesisPage', () => {
  const mockSetResult = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSynthesisStore.mockReturnValue({
      text: 'test text',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    } as vi.Mocked<Partial<ReturnType<typeof useSynthesisStore>>>);
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
    } as vi.Mocked<Partial<ReturnType<typeof useSynthesisStore>>>);

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
    } as vi.Mocked<Partial<ReturnType<typeof useSynthesisStore>>>);

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

  it('should not synthesize empty text', () => {
    mockUseSynthesisStore.mockReturnValue({
      text: '   ',
      setResult: mockSetResult,
      setLoading: mockSetLoading,
      setError: mockSetError,
      isLoading: false,
      error: null,
    } as vi.Mocked<Partial<ReturnType<typeof useSynthesisStore>>>);

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
