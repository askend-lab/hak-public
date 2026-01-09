import { ReactNode, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface FormFieldProps {
  label?: string
  error?: string | null
  helperText?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, helperText, required, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('form-field', className)}>
        {label && (
          <label className="input-label">
            {label}
            {required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
          </label>
        )}
        
        {children}
        
        {error && (
          <span className="input-helper-text" style={{ color: 'var(--color-error)' }}>
            {error}
          </span>
        )}
        
        {helperText && !error && (
          <span className="input-helper-text">{helperText}</span>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
