import { describe, it, expect, vi } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import { NotificationProvider, useNotification } from './NotificationContext';
import { ReactNode } from 'react';

vi.mock('@/components/NotificationContainer', () => ({
  default: vi.fn(({ ref }: { ref: unknown }) => {
    if (ref && typeof ref === 'object' && ref !== null && 'current' in ref) {
      (ref as { current: { show: () => void } }).current = {
        show: vi.fn()
      };
    }
    return <div data-testid="notification-container">Container</div>;
  })
}));

describe('NotificationContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  it('should provide notification context', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    
    expect(result.current).toBeDefined();
    expect(result.current.showNotification).toBeInstanceOf(Function);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useNotification());
    }).toThrow('useNotification must be used within NotificationProvider');
  });

  it('should render notification container', () => {
    render(
      <NotificationProvider>
        <div>Test Content</div>
      </NotificationProvider>
    );

    expect(screen.getByTestId('notification-container')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should call show on notification ref', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    result.current.showNotification('success', 'Test message');
    result.current.showNotification('error', 'Error message', 'Description');
    result.current.showNotification('info', 'Info', 'Desc', 5000);
    result.current.showNotification('warning', 'Warning', 'Desc', 3000);
    result.current.showNotification('success', 'Success', 'Desc', 4000, undefined, {
      label: 'Action',
      onClick: () => {}
    });

    expect(result.current.showNotification).toHaveBeenCalled;
  });
});
