import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { AudioPlayer } from './AudioPlayer';
import { mockStoreWith, mockStoreWithAudio, TEST_AUDIO_URL } from './test-utils';

jest.mock('../../features', () => ({
  useSynthesisStore: jest.fn(),
}));

describe('AudioPlayer', () => {
  const mockSetAudioElement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no audio result', () => {
    mockStoreWith({ result: null, setAudioElement: mockSetAudioElement });
    const { container } = render(<AudioPlayer />);
    expect(container.querySelector('.audio-player')).toBeNull();
  });

  it('should render play button when not playing', () => {
    mockStoreWithAudio(TEST_AUDIO_URL, false, false);
    render(<AudioPlayer />);
    expect(screen.getByText('▶ Mängi')).toBeInTheDocument();
  });

  it('should render pause button when playing', () => {
    mockStoreWithAudio(TEST_AUDIO_URL, false, true);
    render(<AudioPlayer />);
    expect(screen.getByText('⏸ Paus')).toBeInTheDocument();
  });

  it('should show cached status', () => {
    mockStoreWithAudio(TEST_AUDIO_URL, true, false);
    render(<AudioPlayer />);
    expect(screen.getByText('(vahemälust)')).toBeInTheDocument();
  });

  it('should show new status when not cached', () => {
    mockStoreWithAudio(TEST_AUDIO_URL, false, false);
    render(<AudioPlayer />);
    expect(screen.getByText('(uus)')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockStoreWithAudio(TEST_AUDIO_URL, false, false);
    render(<AudioPlayer className="custom-player" />);
    expect(document.querySelector('.custom-player')).toBeInTheDocument();
  });

  it('should call setAudioElement on mount', () => {
    mockStoreWith({
      result: { audioUrl: TEST_AUDIO_URL, cached: false },
      setAudioElement: mockSetAudioElement,
    });
    render(<AudioPlayer />);
    expect(mockSetAudioElement).toHaveBeenCalled();
  });
});
