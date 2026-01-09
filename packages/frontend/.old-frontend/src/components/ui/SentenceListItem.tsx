import React from 'react'

import { PlayButton } from './PlayButton'

interface SentenceListItemProps {
  children: React.ReactNode
  onPlay: () => void
  isPlaying?: boolean
  isLoading?: boolean
  isActive?: boolean
  isLast?: boolean
  index: number
  onDragStart?: (index: number) => void
  onDragOver?: (index: number) => void
  onDragEnd?: () => void
  onDrop?: (index: number) => void
  isDragging?: boolean | undefined
  isDragOver?: boolean | undefined
  actions?: React.ReactNode
}

const DRAG_DOTS_COUNT = 6

export function SentenceListItem({
  children,
  onPlay,
  isPlaying = false,
  isLoading = false,
  isActive = true,
  isLast = false,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  actions,
}: SentenceListItemProps) {
  const rowClasses = [
    'sentence-list-item',
    !isLast && 'sentence-list-item--bordered',
    isDragging && 'sentence-list-item--dragging',
    isDragOver && 'sentence-list-item--drag-over',
  ].filter(Boolean).join(' ')

  const rowRef = React.useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    onDragOver?.(index)
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    onDrop?.(index)
  }

  const handleDragStartFromHandle = (e: React.DragEvent): void => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', String(index))
    if (rowRef.current) {
      e.dataTransfer.setDragImage(rowRef.current, 20, rowRef.current.offsetHeight / 2)
      setTimeout(() => {
        if (rowRef.current) rowRef.current.style.opacity = '0.5'
      }, 0)
    }
    onDragStart?.(index)
  }

  const handleDragEndWithOpacity = (): void => {
    if (rowRef.current) rowRef.current.style.opacity = '1'
    onDragEnd?.()
  }

  return (
    <div
      ref={rowRef}
      className={rowClasses}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="sentence-list-item__drag"
        draggable
        onDragStart={handleDragStartFromHandle}
        onDragEnd={handleDragEndWithOpacity}
      >
        {Array.from({ length: DRAG_DOTS_COUNT }).map((_, i) => (
          <div key={i} className="sentence-list-item__dot" />
        ))}
      </div>
      {children}
      <PlayButton
        onClick={onPlay}
        isPlaying={isPlaying}
        isLoading={isLoading}
        isActive={isActive}
      />
      {actions}
    </div>
  )
}
