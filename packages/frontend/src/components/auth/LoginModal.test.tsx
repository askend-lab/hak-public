import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { LoginModal } from './LoginModal';
import { useUIStore } from '../../features';
import { useAuth } from '../../services/auth';

vi.mock('../../features', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(),
}));

const mockUseUIStore = useUIStore as unknown as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;

describe('LoginModal', () => {
  const mockCloseModal = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ login: mockLogin });
  });

  it('returns null when activeModal is not login', () => {
    mockUseUIStore.mockReturnValue({ activeModal: null, closeModal: mockCloseModal });
    
    const { container } = render(<LoginModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when activeModal is login', () => {
    mockUseUIStore.mockReturnValue({ activeModal: 'login', closeModal: mockCloseModal });
    
    render(<LoginModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Logi sisse')).toHaveLength(2);
  });

  it('calls closeModal when close button clicked', () => {
    mockUseUIStore.mockReturnValue({ activeModal: 'login', closeModal: mockCloseModal });
    
    render(<LoginModal />);
    fireEvent.click(screen.getByText('×'));
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls closeModal when cancel button clicked', () => {
    mockUseUIStore.mockReturnValue({ activeModal: 'login', closeModal: mockCloseModal });
    
    render(<LoginModal />);
    fireEvent.click(screen.getByText('Tühista'));
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('calls login and closeModal when login button clicked', () => {
    mockUseUIStore.mockReturnValue({ activeModal: 'login', closeModal: mockCloseModal });
    
    render(<LoginModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Logi sisse' }));
    
    expect(mockLogin).toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
  });
});
