import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div className="input-wrapper" data-variant={variant}>
        <textarea
          ref={ref}
          className={cn(
            'input',
            variant === 'error' && 'error',
            'textarea',
            className
          )}
          style={{
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
          }}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
