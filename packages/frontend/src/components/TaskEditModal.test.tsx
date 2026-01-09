import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskEditModal from './TaskEditModal';

describe('TaskEditModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <TaskEditModal
        isOpen={false}
        task={null}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true with task', () => {
    render(
      <TaskEditModal
        isOpen={true}
        task={{ id: '1', name: 'Test Task', description: 'Test' }}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    
    const modal = document.querySelector('.base-modal');
    expect(modal).toBeInTheDocument();
  });
});
