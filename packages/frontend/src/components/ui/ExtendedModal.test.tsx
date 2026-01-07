import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExtendedModal } from './ExtendedModal'

describe('ExtendedModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render modal when isOpen is true', () => {
    render(<ExtendedModal {...defaultProps} />)
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(<ExtendedModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should render footer when provided', () => {
    render(
      <ExtendedModal 
        {...defaultProps} 
        footer={<button>Footer Button</button>}
      />
    )
    
    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('should apply size variant classes', () => {
    const { rerender } = render(
      <ExtendedModal {...defaultProps} size="sm" />
    )
    expect(screen.getByRole('dialog')).toHaveClass('modal', 'modal--small')

    rerender(<ExtendedModal {...defaultProps} size="md" />)
    expect(screen.getByRole('dialog')).toHaveClass('modal', 'modal--medium')

    rerender(<ExtendedModal {...defaultProps} size="lg" />)
    expect(screen.getByRole('dialog')).toHaveClass('modal', 'modal--large')
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ExtendedModal {...defaultProps} />)
    
    const closeButton = screen.getByText('×')
    await user.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<ExtendedModal {...defaultProps} />)
    
    const overlay = screen.getByRole('presentation')
    await user.click(overlay)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(<ExtendedModal {...defaultProps} />)
    
    await user.keyboard('{Escape}')
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should stop propagation when modal content is clicked', async () => {
    const user = userEvent.setup()
    render(<ExtendedModal {...defaultProps} />)
    
    const modalContent = screen.getByRole('dialog')
    await user.click(modalContent)
    
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<ExtendedModal {...defaultProps} className="custom-modal" />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('modal', 'modal--medium', 'custom-modal')
  })

  it('should have proper accessibility attributes', () => {
    render(<ExtendedModal {...defaultProps} />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('tabIndex', '-1')
  })
})
