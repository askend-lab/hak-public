import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByText('×'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay clicked', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByText('Test Modal').closest('.modal-overlay')!);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should not call onClose when modal content clicked', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByText('Modal content'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should render footer when provided', () => {
    render(<Modal {...defaultProps} footer={<button>Save</button>} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    expect(document.querySelector('.custom-modal')).toBeInTheDocument();
  });
});
