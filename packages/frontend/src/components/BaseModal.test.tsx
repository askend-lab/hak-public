/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseModal from './BaseModal';

describe('BaseModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <BaseModal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>
    );
    
    const closeButton = screen.getByRole('button', { name: /sulge/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>
    );
    
    const backdrop = container.querySelector('.base-modal__backdrop');
    if (backdrop) fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking modal content', () => {
    const onClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content</p>
      </BaseModal>
    );
    
    const content = screen.getByText('Modal content');
    fireEvent.click(content);
    
    expect(onClose).not.toHaveBeenCalled();
  });
});
