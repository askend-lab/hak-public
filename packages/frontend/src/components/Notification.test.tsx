import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Notification from './Notification';

describe('Notification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders notification with message', () => {
    render(
      <Notification
        type="success"
        message="Test message"
        onClose={vi.fn()}
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders notification with description', () => {
    render(
      <Notification
        type="info"
        message="Test message"
        description="Test description"
        onClose={vi.fn()}
      />
    );
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    const onClose = vi.fn();
    render(
      <Notification
        type="success"
        message="Test message"
        duration={3000}
        onClose={onClose}
      />
    );
    
    expect(onClose).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-close when duration is 0', () => {
    const onClose = vi.fn();
    render(
      <Notification
        type="success"
        message="Test message"
        duration={0}
        onClose={onClose}
      />
    );
    
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders action button when provided', () => {
    const actionClick = vi.fn();
    render(
      <Notification
        type="info"
        message="Test message"
        action={{ label: 'Undo', onClick: actionClick }}
        onClose={vi.fn()}
      />
    );
    
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });
});
