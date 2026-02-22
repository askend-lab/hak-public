// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { TaskEntry } from "@/types/task";

interface UseDragAndDropReturn {
  draggedId: string | null;
  dragOverId: string | null;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragEnd: (_e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
}

export function useDragAndDrop(
  setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>,
): UseDragAndDropReturn {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move"; // eslint-disable-line no-param-reassign -- Web DragEvent API
    e.dataTransfer.setData("text/html", id);
  }, []);

  const handleDragEnd = useCallback((_e: React.DragEvent) => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move"; // eslint-disable-line no-param-reassign -- Web DragEvent API
      if (draggedId && draggedId !== id) {
        setDragOverId(id);
      }
    },
    [draggedId],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) {return;}

      setEntries((prev) => {
        const draggedIndex = prev.findIndex((entry) => entry.id === draggedId);
        const targetIndex = prev.findIndex((entry) => entry.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) {return prev;}

        const newEntries = [...prev];
        const [draggedItem] = newEntries.splice(draggedIndex, 1);
        if (draggedItem) {newEntries.splice(targetIndex, 0, draggedItem);}
        return newEntries;
      });

      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId, setEntries],
  );

  return {
    draggedId,
    dragOverId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
