 
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackModal from './FeedbackModal';

describe('FeedbackModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <FeedbackModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    
    expect(screen.queryByText(/tagasiside/i)).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    
    const modal = document.querySelector('.base-modal');
    expect(modal).toBeInTheDocument();
  });
});
