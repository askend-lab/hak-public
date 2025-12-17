import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from './AudioPlayer';
import { useSynthesisStore } from '../../features';

jest.mock('../../features', () => ({
  useSynthesisStore: jest.fn(),
}));

const mockUseSynthesisStore = useSynthesisStore as jest.MockedFunction<typeof useSynthesisStore>;

describe('AudioPlayer', () => {
  const mockSetIsPlaying = jest.fn();
  const mockSetAudioElement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no audio result', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: null,
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    const { container } = render(<AudioPlayer />);
    expect(container.querySelector('.audio-player')).toBeNull();
  });

  it('should render play button when not playing', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'data:audio/wav;base64,test', cached: false },
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    render(<AudioPlayer />);
    expect(screen.getByText('▶ Mängi')).toBeInTheDocument();
  });

  it('should render pause button when playing', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'data:audio/wav;base64,test', cached: false },
      isPlaying: true,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    render(<AudioPlayer />);
    expect(screen.getByText('⏸ Paus')).toBeInTheDocument();
  });

  it('should show cached status', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'data:audio/wav;base64,test', cached: true },
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    render(<AudioPlayer />);
    expect(screen.getByText('(vahemälust)')).toBeInTheDocument();
  });

  it('should show new status when not cached', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'data:audio/wav;base64,test', cached: false },
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    render(<AudioPlayer />);
    expect(screen.getByText('(uus)')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'data:audio/wav;base64,test', cached: false },
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    render(<AudioPlayer className="custom-player" />);
    expect(document.querySelector('.custom-player')).toBeInTheDocument();
  });

  it('should call setAudioElement on mount', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'data:audio/wav;base64,test', cached: false },
      isPlaying: false,
      setIsPlaying: mockSetIsPlaying,
      setAudioElement: mockSetAudioElement,
    } as any);

    render(<AudioPlayer />);
    expect(mockSetAudioElement).toHaveBeenCalled();
  });
});
