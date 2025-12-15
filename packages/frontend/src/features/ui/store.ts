import { create } from 'zustand';

type ModalType = 'taskSelect' | 'taskCreate' | 'login' | null;
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface UIState {
  activeModal: ModalType;
  notifications: Notification[];
}

interface UIActions {
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const initialState: UIState = {
  activeModal: null,
  notifications: [],
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...initialState,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  addNotification: (type, message, duration = 5000) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: `${Date.now()}`, type, message, duration },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

export type { ModalType, NotificationType, Notification };
