import { useState } from 'react'
import { ExtendedModal } from '../ui'
import { StandardizedTaskForm } from './StandardizedTaskForm'
import { useUserId } from '../../hooks/useUserId'
import { createTask } from '../../services/tasks'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StandardizedCreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const userId = useUserId()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: { name: string; description: string }) => {
    // Handle cancel action
    if (!data.name) {
      onClose()
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await createTask(userId, {
        name: data.name,
        description: data.description || undefined,
      })

      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.error ?? 'Viga ülesande loomisel')
      }
    } catch {
      setError('Võrgu viga')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ExtendedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Lisa ülesanne"
      size="md"
    >
      <StandardizedTaskForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        submitText="Lisa ülesanne"
      />
    </ExtendedModal>
  )
}
