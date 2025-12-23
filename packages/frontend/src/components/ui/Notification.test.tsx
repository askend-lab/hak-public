import { render, screen, fireEvent, act } from '@testing-library/react';

import { useUIStore } from '../../features';

import { NotificationContainer } from './Notification';

describe('NotificationContainer', () => {
  beforeEach(() => {
    useUIStore.setState({
      notifications: [],
      activeModal: null,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when no notifications', () => {
    const { container } = render(<NotificationContainer />);
    expect(container.querySelector('.notification-container')).toBeNull();
  });

  it('should render notifications', () => {
    useUIStore.setState({
      notifications: [
        { id: '1', type: 'success', message: 'Success!', duration: 5000 },
        { id: '2', type: 'error', message: 'Error!', duration: 5000 },
      ],
    });

    render(<NotificationContainer />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('should apply correct type class', () => {
    useUIStore.setState({
      notifications: [
        { id: '1', type: 'success', message: 'Success!', duration: 5000 },
      ],
    });

    render(<NotificationContainer />);
    expect(document.querySelector('.notification--success')).toBeInTheDocument();
  });

  it('should remove notification on close button click', () => {
    useUIStore.setState({
      notifications: [
        { id: '1', type: 'info', message: 'Info', duration: 5000 },
      ],
    });

    render(<NotificationContainer />);
    fireEvent.click(screen.getByText('×'));
    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('should auto-remove notification after duration', () => {
    useUIStore.setState({
      notifications: [
        { id: '1', type: 'info', message: 'Auto remove', duration: 3000 },
      ],
    });

    render(<NotificationContainer />);
    expect(screen.getByText('Auto remove')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(useUIStore.getState().notifications).toHaveLength(0);
  });

  it('should not auto-remove notification with zero duration', () => {
    useUIStore.setState({
      notifications: [
        { id: '1', type: 'info', message: 'Persistent', duration: 0 },
      ],
    });

    render(<NotificationContainer />);
    
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(useUIStore.getState().notifications).toHaveLength(1);
  });
});
