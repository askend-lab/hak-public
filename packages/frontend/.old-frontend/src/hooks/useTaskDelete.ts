import { useState, useCallback } from 'react'
import { deleteTask } from '../services/tasks'
import { useUserId } from './useUserId'

interface UseTaskDeleteReturn {
  deleteConfirmTaskId: string | null
  isDeleting: boolean
  requestDelete: (taskId: string) => void
  confirmDelete: () => Promise<boolean>
  cancelDelete: () => void
}

export function useTaskDelete(onSuccess?: () => void): UseTaskDeleteReturn {
  const userId = useUserId()
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const requestDelete = useCallback((taskId: string) => {
    setDeleteConfirmTaskId(taskId)
  }, [])

  const confirmDelete = useCallback(async (): Promise<boolean> => {
    if (!deleteConfirmTaskId) return false
    setIsDeleting(true)
    try {
      const response = await deleteTask(userId, deleteConfirmTaskId)
      if (response.success) {
        setDeleteConfirmTaskId(null)
        onSuccess?.()
        return true
      }
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [deleteConfirmTaskId, userId, onSuccess])

  const cancelDelete = useCallback(() => {
    setDeleteConfirmTaskId(null)
  }, [])

  return {
    deleteConfirmTaskId,
    isDeleting,
    requestDelete,
    confirmDelete,
    cancelDelete,
  }
}
