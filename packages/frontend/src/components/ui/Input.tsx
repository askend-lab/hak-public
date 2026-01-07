import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error'
  size?: 'small' | 'medium' | 'large'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'large', ...props }, ref) => {
    return (
      <div className="input-wrapper" data-variant={variant}>
        <input
          ref={ref}
          className={cn(
            'input',
            `input--${size}`,
            variant === 'error' && 'error',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
