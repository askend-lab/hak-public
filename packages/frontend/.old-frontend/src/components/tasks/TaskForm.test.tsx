import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title input with placeholder', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toBeInTheDocument();
  });

  it('renders description textarea with placeholder', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByPlaceholderText('Kirjeldus')).toBeInTheDocument();
  });

  it('renders submit button with default text "Lisa"', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByRole('button', { name: 'Lisa' })).toBeInTheDocument();
  });

  it('renders submit button with custom text', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} submitText="Salvesta" />);
    expect(screen.getByRole('button', { name: 'Salvesta' })).toBeInTheDocument();
  });

  it('disables submit button when title is empty', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByRole('button', { name: 'Lisa' })).toBeDisabled();
  });

  it('enables submit button when title is filled', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), { target: { value: 'Test' } });
    expect(screen.getByRole('button', { name: 'Lisa' })).not.toBeDisabled();
  });

  it('calls onSubmit with name and description when submitted', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), { target: { value: 'My Task' } });
    fireEvent.change(screen.getByPlaceholderText('Kirjeldus'), { target: { value: 'Description' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa' }));
    expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'My Task', description: 'Description' });
  });

  it('shows initial values when provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialName="Existing" initialDescription="Desc" />);
    expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toHaveValue('Existing');
    expect(screen.getByPlaceholderText('Kirjeldus')).toHaveValue('Desc');
  });

  it('disables inputs when isSubmitting is true', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />);
    expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toBeDisabled();
    expect(screen.getByPlaceholderText('Kirjeldus')).toBeDisabled();
  });

  it('shows error message when provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
