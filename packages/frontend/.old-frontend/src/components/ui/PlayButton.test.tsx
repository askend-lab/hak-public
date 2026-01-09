import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { PlayButton } from './PlayButton';

describe('PlayButton', () => {
  it('should render play icon by default', () => {
    render(<PlayButton onClick={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Play' });
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should be disabled when not active', () => {
    render(<PlayButton onClick={vi.fn()} isActive={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be enabled when active', () => {
    render(<PlayButton onClick={vi.fn()} isActive={true} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should show loading icon when isLoading', () => {
    render(<PlayButton onClick={vi.fn()} isLoading={true} isActive={true} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('play-button--loading');
    expect(button).toBeDisabled();
  });

  it('should show pause icon when isPlaying', () => {
    render(<PlayButton onClick={vi.fn()} isPlaying={true} />);
    const button = screen.getByRole('button', { name: 'Pause' });
    expect(button).toHaveClass('play-button--playing');
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<PlayButton onClick={onClick} isActive={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should have correct size class', () => {
    render(<PlayButton onClick={vi.fn()} size="large" isActive={true} />);
    expect(screen.getByRole('button')).toHaveClass('play-button--large');
  });

  it('should have active class when isActive', () => {
    render(<PlayButton onClick={vi.fn()} isActive={true} />);
    expect(screen.getByRole('button')).toHaveClass('play-button--active');
  });

  it('should NOT have active class when not active (passive state)', () => {
    render(<PlayButton onClick={vi.fn()} isActive={false} />);
    expect(screen.getByRole('button')).not.toHaveClass('play-button--active');
  });
});
