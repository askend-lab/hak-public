import { useState, useCallback } from 'react'
import { updateTask } from '../services/tasks'
import { useUserId } from './useUserId'
import type { Task } from '../services/tasks'

interface UseTaskEditReturn {
  editingTask: Task | null
  editName: string
  editDescription: string
  isEditing: boolean
  editError: string | null
  setEditName: (name: string) => void
  setEditDescription: (description: string) => void
  startEdit: (task: Task) => void
  saveEdit: () => Promise<boolean>
  cancelEdit: () => void
}

export function useTaskEdit(onSuccess?: () => void): UseTaskEditReturn {
  const userId = useUserId()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const startEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setEditName(task.name)
    setEditDescription(task.description ?? '')
    setEditError(null)
  }, [])

  const saveEdit = useCallback(async (): Promise<boolean> => {
    if (!editingTask) return false
    if (!editName.trim()) {
      setEditError('Ülesande nimi on kohustuslik')
      return false
    }
    setIsEditing(true)
    try {
      const response = await updateTask(userId, editingTask.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      })
      if (response.success) {
        setEditingTask(null)
        onSuccess?.()
        return true
      }
      return false
    } finally {
      setIsEditing(false)
    }
  }, [editingTask, editName, editDescription, userId, onSuccess])

  const cancelEdit = useCallback(() => {
    setEditingTask(null)
    setEditError(null)
  }, [])

  return {
    editingTask,
    editName,
    editDescription,
    isEditing,
    editError,
    setEditName,
    setEditDescription,
    startEdit,
    saveEdit,
    cancelEdit,
  }
}
