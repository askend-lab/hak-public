import { useUIStore } from './store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeModal: null,
      notifications: [],
    });
  });

  describe('modal actions', () => {
    it('should open modal', () => {
      useUIStore.getState().openModal('taskSelect');
      expect(useUIStore.getState().activeModal).toBe('taskSelect');
    });

    it('should close modal', () => {
      useUIStore.setState({ activeModal: 'login' });
      useUIStore.getState().closeModal();
      expect(useUIStore.getState().activeModal).toBeNull();
    });
  });

  describe('notification actions', () => {
    it('should add notification', () => {
      useUIStore.getState().addNotification('success', 'Test message');
      const notifications = useUIStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]?.type).toBe('success');
      expect(notifications[0]?.message).toBe('Test message');
    });

    it('should add notification with custom duration', () => {
      useUIStore.getState().addNotification('error', 'Error!', 10000);
      const notification = useUIStore.getState().notifications[0];
      expect(notification?.duration).toBe(10000);
    });

    it('should remove notification by id', () => {
      // Add notifications with known IDs by setting state directly
      useUIStore.setState({
        notifications: [
          { id: 'notif-1', type: 'info', message: 'Info 1', duration: 5000 },
          { id: 'notif-2', type: 'info', message: 'Info 2', duration: 5000 },
        ],
      });
      useUIStore.getState().removeNotification('notif-1');
      const remaining = useUIStore.getState().notifications;
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.id).toBe('notif-2');
    });

    it('should clear all notifications', () => {
      useUIStore.getState().addNotification('info', 'Info 1');
      useUIStore.getState().addNotification('info', 'Info 2');
      useUIStore.getState().clearNotifications();
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });
  });
});
