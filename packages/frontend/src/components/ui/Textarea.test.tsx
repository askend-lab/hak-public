import { render, screen } from '@testing-library/react'

import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('should render textarea with default props', () => {
    render(<Textarea data-testid="test-textarea" />)
    
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('should apply error variant', () => {
    render(<Textarea variant="error" data-testid="test-textarea" />)
    
    const wrapper = screen.getByTestId('test-textarea').closest('div')
    expect(wrapper).toHaveAttribute('data-variant', 'error')
    expect(wrapper).toHaveClass('input-wrapper', 'error')
  })

  it('should pass through all textarea props', () => {
    render(
      <Textarea
        data-testid="test-textarea"
        placeholder="Enter description"
        disabled
        value="test value"
        onChange={() => {}}
        rows={6}
      />
    )
    
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Enter description')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveValue('test value')
    expect(textarea).toHaveAttribute('rows', '6')
  })

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" data-testid="test-textarea" />)
    
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toHaveClass('input', 'textarea', 'custom-textarea')
  })

  it('should be wrapped in input-wrapper div', () => {
    render(<Textarea data-testid="test-textarea" />)
    
    const textarea = screen.getByTestId('test-textarea')
    const wrapper = textarea.parentElement
    expect(wrapper).toHaveClass('input-wrapper')
  })

  it('should have default styling attributes', () => {
    render(<Textarea data-testid="test-textarea" />)
    
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toHaveStyle({
      minHeight: '100px',
      resize: 'vertical',
      padding: '16px 14px',
      border: '1px solid var(--color-outlined-neutral, #C5CBD1)',
      borderRadius: '4px',
      fontFamily: 'inherit',
      fontSize: '16px',
      lineHeight: '1.5',
      color: 'var(--color-primary, #173148)',
      background: 'white',
      boxSizing: 'border-box',
    })
  })
})
