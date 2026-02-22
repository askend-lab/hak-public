// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState } from "@/types/synthesis";

export function useDragAndDrop(
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>,
): {
  draggedId: string | null;
  dragOverId: string | null;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
} {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move"; // eslint-disable-line no-param-reassign -- Web DragEvent API
    e.dataTransfer.setData("text/html", id);
  }, []);

  const handleDragEnd = useCallback(() => {
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

      setSentences((prev) => {
        const draggedIndex = prev.findIndex((s) => s.id === draggedId);
        const targetIndex = prev.findIndex((s) => s.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) {return prev;}

        const newSentences = [...prev];
        const [draggedItem] = newSentences.splice(draggedIndex, 1);
        if (draggedItem) {newSentences.splice(targetIndex, 0, draggedItem);}
        return newSentences;
      });

      setDraggedId(null);
      setDragOverId(null);
    },
    [draggedId, setSentences],
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
