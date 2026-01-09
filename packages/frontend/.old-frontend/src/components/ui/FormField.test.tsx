import { render, screen } from '@testing-library/react'

import { FormField } from './FormField'

describe('FormField', () => {
  it('should render form field with label and children', () => {
    render(
      <FormField label="Test Label">
        <input data-testid="test-input" />
      </FormField>
    )
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })

  it('should render required indicator when required is true', () => {
    render(
      <FormField label="Required Field" required={true}>
        <input data-testid="test-input" />
      </FormField>
    )
    
    const requiredIndicator = screen.getByText('*')
    expect(requiredIndicator).toBeInTheDocument()
    expect(requiredIndicator.tagName).toBe('SPAN')
  })

  it('should render error message when error is provided', () => {
    render(
      <FormField label="Test Field" error="This field is required">
        <input data-testid="test-input" />
      </FormField>
    )
    
    const errorMessage = screen.getByText('This field is required')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('input-helper-text')
  })

  it('should render helper text when provided and no error', () => {
    render(
      <FormField label="Test Field" helperText="This is helper text">
        <input data-testid="test-input" />
      </FormField>
    )
    
    const helperText = screen.getByText('This is helper text')
    expect(helperText).toBeInTheDocument()
    expect(helperText).toHaveClass('input-helper-text')
  })

  it('should not render helper text when error is present', () => {
    render(
      <FormField 
        label="Test Field" 
        error="Error message"
        helperText="Helper text"
      >
        <input data-testid="test-input" />
      </FormField>
    )
    
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <FormField label="Test Field" className="custom-class">
        <input data-testid="test-input" />
      </FormField>
    )
    
    const formField = screen.getByText('Test Field').closest('div')
    expect(formField).toHaveClass('form-field', 'custom-class')
  })

  it('should render without label', () => {
    render(
      <FormField>
        <input data-testid="test-input" />
      </FormField>
    )
    
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
  })
})
