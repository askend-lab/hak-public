import { useState, useEffect } from 'react'
import { FormField, Input, Textarea, Button } from '../ui'

interface TaskFormProps {
  onSubmit: (data: { name: string; description: string }) => void
  onCancel?: () => void
  initialName?: string
  initialDescription?: string
  submitText?: string
  isSubmitting?: boolean
  error?: string | null
}

export function StandardizedTaskForm({
  onSubmit,
  onCancel,
  initialName = '',
  initialDescription = '',
  submitText = 'Lisa',
  isSubmitting = false,
  error = null,
}: TaskFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  useEffect(() => {
    setName(initialName)
    setDescription(initialDescription)
  }, [initialName, initialDescription])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() })
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onSubmit({ name: '', description: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField 
        label="Pealkiri" 
        required={true}
        error={error}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          placeholder="Pealkiri (Kohustuslik)"
          autoFocus
        />
      </FormField>

      <FormField label="Kirjeldus">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="Kirjeldus"
          rows={4}
        />
      </FormField>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <Button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          variant="outline"
        >
          Tühista
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
        >
          {submitText}
        </Button>
      </div>
    </form>
  )
}
