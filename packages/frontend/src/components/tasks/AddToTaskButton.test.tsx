import { render, screen, fireEvent } from '@testing-library/react';
import { AddToTaskButton } from './AddToTaskButton';
import { useSynthesisStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';

jest.mock('../../features', () => ({
  useSynthesisStore: jest.fn(),
  useUIStore: jest.fn(),
}));

jest.mock('../../services/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseSynthesisStore = useSynthesisStore as jest.MockedFunction<typeof useSynthesisStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AddToTaskButton', () => {
  const mockOpenModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUIStore.mockReturnValue({ openModal: mockOpenModal } as any);
    mockUseAuth.mockReturnValue({} as any);
  });

  it('should not render when no result', () => {
    mockUseSynthesisStore.mockReturnValue({ result: null } as any);

    const { container } = render(<AddToTaskButton />);
    expect(container.querySelector('.add-to-task-button')).toBeNull();
  });

  it('should render button when result exists', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'test.mp3' },
    } as any);

    render(<AddToTaskButton />);
    expect(screen.getByText('+ Lisa ülesandesse')).toBeInTheDocument();
  });

  it('should open task select modal on click', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'test.mp3' },
    } as any);

    render(<AddToTaskButton />);
    fireEvent.click(screen.getByText('+ Lisa ülesandesse'));
    expect(mockOpenModal).toHaveBeenCalledWith('taskSelect');
  });

  it('should apply custom className', () => {
    mockUseSynthesisStore.mockReturnValue({
      result: { audioUrl: 'test.mp3' },
    } as any);

    render(<AddToTaskButton className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });
});
