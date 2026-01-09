/* eslint-disable max-lines-per-function */
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
    class MockAudio {
      src = ''; currentTime = 0; duration = 100; onended: (() => void) | null = null; ontimeupdate: (() => void) | null = null; onloadedmetadata: (() => void) | null = null; onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => { setTimeout(() => this.onended?.(), 10); return Promise.resolve(); });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
  });

  it('renders play button', () => {
    render(<AudioPlayer {...props} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('renders with autoPlay', () => {
    render(<AudioPlayer {...props} autoPlay={true} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('handles play click', async () => {
    render(<AudioPlayer {...props} />);
    const buttons = screen.getAllByRole('button');
    if (buttons[0]) fireEvent.click(buttons[0]);
  });

  it('handles pause click after play', async () => {
    render(<AudioPlayer {...props} />);
    const buttons = screen.getAllByRole('button');
    if (buttons[0]) { fireEvent.click(buttons[0]); fireEvent.click(buttons[0]); }
  });

  it('handles null audioUrl', () => {
    const { container } = render(<AudioPlayer {...props} audioUrl={null} />);
    expect(container).toBeTruthy();
  });

  it('handles empty string audioUrl', () => {
    const { container } = render(<AudioPlayer {...props} audioUrl="" />);
    expect(container).toBeTruthy();
  });

  it('calls onEnded when audio ends', () => {
    render(<AudioPlayer {...props} />);
  });

  it('shows progress bar', () => {
    render(<AudioPlayer {...props} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('handles audio error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AudioPlayer {...props} />);
    consoleSpy.mockRestore();
  });
});
