import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StandardizedTaskForm } from './StandardizedTaskForm'

describe('StandardizedTaskForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with default values', () => {
    render(<StandardizedTaskForm {...defaultProps} />)
    
    expect(screen.getByPlaceholderText(/pealkiri/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/kirjeldus/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tühista/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lisa/i })).toBeInTheDocument()
  })

  it('should render with initial values', () => {
    render(
      <StandardizedTaskForm 
        {...defaultProps}
        initialName="Initial Task"
        initialDescription="Initial Description"
      />
    )
    
    const nameInput = screen.getByPlaceholderText(/pealkiri/i) as HTMLInputElement
    const descriptionInput = screen.getByPlaceholderText(/kirjeldus/i) as HTMLTextAreaElement
    
    expect(nameInput.value).toBe('Initial Task')
    expect(descriptionInput.value).toBe('Initial Description')
  })

  it('should update values when user types', async () => {
    const user = userEvent.setup()
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const nameInput = screen.getByPlaceholderText(/pealkiri/i)
    const descriptionInput = screen.getByPlaceholderText(/kirjeldus/i)
    
    await user.type(nameInput, 'New Task')
    await user.type(descriptionInput, 'New Description')
    
    expect(nameInput).toHaveValue('New Task')
    expect(descriptionInput).toHaveValue('New Description')
  })

  it('should submit form with trimmed values', async () => {
    const user = userEvent.setup()
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const nameInput = screen.getByPlaceholderText(/pealkiri/i)
    const descriptionInput = screen.getByPlaceholderText(/kirjeldus/i)
    const submitButton = screen.getByRole('button', { name: /lisa/i })
    
    await user.type(nameInput, '  Task Name  ')
    await user.type(descriptionInput, '  Description  ')
    await user.click(submitButton)
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      name: 'Task Name',
      description: 'Description',
    })
  })

  it('should not submit form if name is empty', async () => {
    const user = userEvent.setup()
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /lisa/i })
    await user.click(submitButton)
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('should disable submit button when name is empty', () => {
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /lisa/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when name has value', async () => {
    const user = userEvent.setup()
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const nameInput = screen.getByPlaceholderText(/pealkiri/i)
    const submitButton = screen.getByRole('button', { name: /lisa/i })
    
    await user.type(nameInput, 'Task Name')
    expect(submitButton).not.toBeDisabled()
  })

  it('should disable all inputs when submitting', () => {
    render(
      <StandardizedTaskForm 
        {...defaultProps}
        isSubmitting={true}
      />
    )
    
    const nameInput = screen.getByPlaceholderText(/pealkiri/i)
    const descriptionInput = screen.getByPlaceholderText(/kirjeldus/i)
    const submitButton = screen.getByRole('button', { name: /lisa/i })
    const cancelButton = screen.getByRole('button', { name: /tühista/i })
    
    expect(nameInput).toBeDisabled()
    expect(descriptionInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('should display error message when provided', () => {
    render(
      <StandardizedTaskForm 
        {...defaultProps}
        error="Task name is required"
      />
    )
    
    expect(screen.getByText('Task name is required')).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = jest.fn()
    render(
      <StandardizedTaskForm 
        {...defaultProps}
        onCancel={onCancel}
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /tühista/i })
    await user.click(cancelButton)
    
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit with empty values when cancel clicked without onCancel', async () => {
    const user = userEvent.setup()
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /tühista/i })
    await user.click(cancelButton)
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      name: '',
      description: '',
    })
  })

  it('should show required indicator on name field', () => {
    render(<StandardizedTaskForm {...defaultProps} />)
    
    const requiredIndicator = screen.getByText('*')
    expect(requiredIndicator).toBeInTheDocument()
  })

  it('should use custom submit text', () => {
    render(
      <StandardizedTaskForm 
        {...defaultProps}
        submitText="Create Task"
      />
    )
    
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })
})
