// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState } from "@/types/synthesis";

function reorderItems(prev: SentenceState[], dragId: string, targetId: string): SentenceState[] {
  const di = prev.findIndex((s) => s.id === dragId);
  const ti = prev.findIndex((s) => s.id === targetId);
  if (di === -1 || ti === -1) {return prev;}
  const next = [...prev];
  const [item] = next.splice(di, 1);
  if (item) {next.splice(ti, 0, item);}
  return next;
}

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

      setSentences((prev) => reorderItems(prev, draggedId, targetId));

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
