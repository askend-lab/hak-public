/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import NotificationContainer, { NotificationRef } from './NotificationContainer';

describe('NotificationContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders empty container initially', () => {
      render(<NotificationContainer />);
      expect(document.querySelector('.notification-container')).toBeInTheDocument();
    });

    it('renders no notifications initially', () => {
      render(<NotificationContainer />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('show notification', () => {
    it('shows notification when show is called', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('success', 'Test message');
      });

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('shows notification with description', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('info', 'Title', 'Description text');
      });

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('shows multiple notifications', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('success', 'First');
        ref.current?.show('error', 'Second');
        ref.current?.show('info', 'Third');
      });

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('shows notification with custom color', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('success', 'Test', undefined, undefined, 'success');
      });

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('notification types', () => {
    it('shows success notification', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('success', 'Success message');
      });

      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('shows error notification', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('error', 'Error message');
      });

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('shows info notification', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('info', 'Info message');
      });

      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('shows warning notification', () => {
      const ref = createRef<NotificationRef>();
      render(<NotificationContainer ref={ref} />);

      act(() => {
        ref.current?.show('warning', 'Warning message');
      });

      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });
  });
});
