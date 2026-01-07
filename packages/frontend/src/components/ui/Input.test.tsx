import { render, screen } from '@testing-library/react'

import { Input } from './Input'

describe('Input', () => {
  it('should render input with default props', () => {
    render(<Input data-testid="test-input" />)
    
    const input = screen.getByTestId('test-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('input', 'input--large')
  })

  it('should apply size variant classes', () => {
    const { rerender } = render(<Input size="small" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveClass('input--small')

    rerender(<Input size="medium" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveClass('input--medium')

    rerender(<Input size="large" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveClass('input--large')
  })

  it('should apply error variant', () => {
    render(<Input variant="error" data-testid="test-input" />)
    
    const input = screen.getByTestId('test-input')
    const wrapper = input.closest('div')
    expect(wrapper).toHaveAttribute('data-variant', 'error')
    expect(wrapper).toHaveClass('input-wrapper')
    expect(input).toHaveClass('error')
  })

  it('should pass through all input props', () => {
    render(
      <Input
        data-testid="test-input"
        placeholder="Enter text"
        disabled
        value="test value"
        onChange={() => {}}
      />
    )
    
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('placeholder', 'Enter text')
    expect(input).toBeDisabled()
    expect(input).toHaveValue('test value')
  })

  it('should apply custom className', () => {
    render(<Input className="custom-input" data-testid="test-input" />)
    
    const input = screen.getByTestId('test-input')
    expect(input).toHaveClass('input', 'input--large', 'custom-input')
  })

  it('should be wrapped in input-wrapper div', () => {
    render(<Input data-testid="test-input" />)
    
    const input = screen.getByTestId('test-input')
    const wrapper = input.parentElement
    expect(wrapper).toHaveClass('input-wrapper')
  })
})
