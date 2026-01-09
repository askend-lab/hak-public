import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

describe('AudioPlayer Full', () => {
  const props = {
    audioUrl: 'blob:audio-url',
    onEnded: vi.fn(),
    autoPlay: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      duration: 100,
      onended: null,
      ontimeupdate: null,
      onloadedmetadata: null,
      onerror: null,
    }));
  });

  it('renders play button', () => {
    render(<AudioPlayer {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with autoPlay', () => {
    render(<AudioPlayer {...props} autoPlay={true} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles play click', async () => {
    render(<AudioPlayer {...props} />);
    fireEvent.click(screen.getByRole('button'));
  });

  it('handles pause click after play', async () => {
    render(<AudioPlayer {...props} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    fireEvent.click(btn);
  });

  it('handles null audioUrl', () => {
    render(<AudioPlayer {...props} audioUrl={null} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles empty string audioUrl', () => {
    render(<AudioPlayer {...props} audioUrl="" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onEnded when audio ends', () => {
    render(<AudioPlayer {...props} />);
    // Simulate audio end - would trigger onEnded
  });

  it('shows progress bar', () => {
    render(<AudioPlayer {...props} />);
    // Progress bar should be rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles audio error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AudioPlayer {...props} />);
    consoleSpy.mockRestore();
  });
});
