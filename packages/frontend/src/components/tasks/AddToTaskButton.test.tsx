import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { useSynthesisStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';

import { AddToTaskButton } from './AddToTaskButton';

vi.mock('../../features', () => ({
  useSynthesisStore: vi.fn(),
  useUIStore: vi.fn(),
}));

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(),
}));

const mockUseSynthesisStore = useSynthesisStore as vi.MockedFunction<typeof useSynthesisStore>;
const mockUseUIStore = useUIStore as vi.MockedFunction<typeof useUIStore>;
const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;

describe('AddToTaskButton', () => {
  const mockOpenModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUIStore.mockReturnValue({ openModal: mockOpenModal } as ReturnType<typeof mockUseUIStore>);
    mockUseAuth.mockReturnValue({} as ReturnType<typeof mockUseAuth>);
  });

  it('should not render when no result', () => {
    mockUseSynthesisStore.mockReturnValue({ result: null } as ReturnType<typeof mockUseSynthesisStore>);

    const { container } = render(<AddToTaskButton />);
    expect(container.querySelector('.add-to-task-button')).toBeNull();
  });

  it('should render button when result exists', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'test.mp3' },
    } as ReturnType<typeof mockUseSynthesisStore>);

    render(<AddToTaskButton />);
    expect(screen.getByText('+ Lisa ülesandesse')).toBeInTheDocument();
  });

  it('should open task select modal on click', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'test.mp3' },
    } as ReturnType<typeof mockUseSynthesisStore>);

    render(<AddToTaskButton />);
    fireEvent.click(screen.getByText('+ Lisa ülesandesse'));
    expect(mockOpenModal).toHaveBeenCalledWith('taskSelect');
  });

  it('should apply custom className', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'test.mp3' },
    } as ReturnType<typeof mockUseSynthesisStore>);

    render(<AddToTaskButton className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });
});
