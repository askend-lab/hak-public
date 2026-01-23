import { useReducer, useCallback } from 'react';

export type ModalType = 'create' | 'edit' | 'delete' | 'share' | 'addTask' | 'addToTaskDropdown' | null;

interface TaskData {
  id: string;
  name: string;
  description?: string | null;
  shareToken?: string;
}

interface ModalState {
  activeModal: ModalType;
  task: TaskData | null;
}

type ModalAction =
  | { type: 'OPEN'; modal: ModalType; task?: TaskData }
  | { type: 'CLOSE' }
  | { type: 'UPDATE_TASK'; task: TaskData };

const initialState: ModalState = {
  activeModal: null,
  task: null
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN':
      return { activeModal: action.modal, task: action.task ?? null };
    case 'CLOSE':
      return initialState;
    case 'UPDATE_TASK':
      return { ...state, task: action.task };
    default:
      return state;
  }
}

interface UseModalStateReturn {
  activeModal: ModalType;
  task: TaskData | null;
  isOpen: (modal: ModalType) => boolean;
  open: (modal: ModalType, task?: TaskData) => void;
  close: () => void;
  updateTask: (task: TaskData) => void;
  // Convenience booleans for common modal types
  showTaskCreationModal: boolean;
  showAddTaskModal: boolean;
  showAddToTaskDropdown: boolean;
  showTaskEditModal: boolean;
  showShareTaskModal: boolean;
  showDeleteConfirmation: boolean;
  taskToEdit: TaskData | null;
  taskToShare: TaskData | null;
  taskToDelete: TaskData | null;
}

/**
 * Simplified modal state management using reducer pattern
 * Replaces multiple useState calls with a single state object
 */
export function useModalState(): UseModalStateReturn {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  const isOpen = useCallback((modal: ModalType) => state.activeModal === modal, [state.activeModal]);
  const open = useCallback((modal: ModalType, task?: TaskData) => dispatch({ type: 'OPEN', modal, ...(task && { task }) }), []);
  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const updateTask = useCallback((task: TaskData) => dispatch({ type: 'UPDATE_TASK', task }), []);

  return {
    activeModal: state.activeModal,
    task: state.task,
    isOpen,
    open,
    close,
    updateTask,
    // Convenience booleans for backward compatibility
    showTaskCreationModal: state.activeModal === 'create',
    showAddTaskModal: state.activeModal === 'addTask',
    showAddToTaskDropdown: state.activeModal === 'addToTaskDropdown',
    showTaskEditModal: state.activeModal === 'edit',
    showShareTaskModal: state.activeModal === 'share',
    showDeleteConfirmation: state.activeModal === 'delete',
    taskToEdit: state.activeModal === 'edit' ? state.task : null,
    taskToShare: state.activeModal === 'share' ? state.task : null,
    taskToDelete: state.activeModal === 'delete' ? state.task : null
  };
}
