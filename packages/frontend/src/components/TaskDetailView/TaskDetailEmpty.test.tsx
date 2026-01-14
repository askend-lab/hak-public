import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetailEmpty } from './TaskDetailEmpty';

const mockTask = {
  id: 't1', name: 'Test', description: 'Desc', userId: 'u1',
  entries: [], speechSequences: [], shareToken: 'tok', createdAt: new Date(), updatedAt: new Date(),
};

describe('TaskDetailEmpty', () => {
  it('renders task name and description when task provided', () => {
    render(<TaskDetailEmpty task={mockTask} onAddEntry={vi.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('renders placeholder text when task is null', () => {
    render(<TaskDetailEmpty task={null} onAddEntry={vi.fn()} />);
    expect(screen.getByText('[Siin on ülesande pealkiri]')).toBeInTheDocument();
    expect(screen.getByText('[Siin on ülesande lühikirjeldus]')).toBeInTheDocument();
  });

  it('calls onAddEntry when button clicked', async () => {
    const onAddEntry = vi.fn();
    render(<TaskDetailEmpty task={mockTask} onAddEntry={onAddEntry} />);
    await userEvent.click(screen.getByText('Hakkan sisu looma'));
    expect(onAddEntry).toHaveBeenCalled();
  });
});
