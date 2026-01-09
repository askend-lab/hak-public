import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog full coverage', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with title', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('renders dialog with message', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders confirm button', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /jah|kinnita|ok/i })).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /ei|tühista|cancel/i })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /jah|kinnita|ok/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /ei|tühista|cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('renders with custom confirm text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders with custom cancel text', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="Go back" />);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('renders with variant danger', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
});
