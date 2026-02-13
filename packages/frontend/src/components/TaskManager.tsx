// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { useState, useEffect, useRef } from "react";
import { TaskSummary } from "@/types/task";
import { MoreIcon } from "./ui/Icons";
import { formatDate } from "@/utils/formatDate";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";

interface TaskRowProps {
  task: TaskSummary;
  isExpanded: boolean;
  onToggleExpand: (taskId: string, e: React.MouseEvent) => void;
  onViewTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onShareTask: (taskId: string) => void;
  openMenuId: string | null;
  onMenuOpen: (taskId: string) => void;
  onMenuClose: () => void;
}

function TaskRow({
  task,
  isExpanded,
  onToggleExpand,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onShareTask,
  openMenuId,
  onMenuOpen,
  onMenuClose,
}: TaskRowProps) {
  const descriptionRef = useRef<HTMLSpanElement>(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const isMenuOpen = openMenuId === task.id;
  const { anchorRef, menuRef, menuStyle } = useDropdownPosition({
    isOpen: isMenuOpen,
  });

  useEffect(() => {
    // Check if the description is truncated
    const element = descriptionRef.current;
    if (element && task.description) {
      // Compare scrollHeight with clientHeight to detect overflow
      setNeedsExpansion(element.scrollHeight > element.clientHeight);
    }
  }, [task.description]);

  return (
    <div className={`task-row-simple ${isExpanded ? "expanded" : ""}`}>
      <div
        className="task-row-content"
        onClick={() => onViewTask(task.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewTask(task.id);
          }
        }}
      >
        <div className="task-row-info">
          <span className={`task-row-name ${isExpanded ? "expanded" : ""}`}>
            {task.name}
          </span>
          <div className="task-row-description-wrapper">
            <span
              ref={descriptionRef}
              className={`task-row-description ${isExpanded ? "expanded" : ""}`}
            >
              {task.description}
            </span>
            {task.description && needsExpansion && (
              <button
                className="task-show-more"
                onClick={(e) => onToggleExpand(task.id, e)}
              >
                {isExpanded ? "Näita vähem" : "Näita rohkem"}
              </button>
            )}
          </div>
        </div>
        <div className="task-row-meta">
          <span className="task-row-count">
            [{task.entryCount}] {task.entryCount === 1 ? "lauset" : "lauset"}
          </span>
          <span className="task-row-date">
            Loodud {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      <div className="task-row-actions">
        <div className="task-manager__menu-container">
          <button
            ref={anchorRef}
            className="task-manager__menu-button"
            aria-label="Rohkem valikuid"
            aria-expanded={isMenuOpen}
            onClick={() => onMenuOpen(task.id)}
          >
            <MoreIcon size="2xl" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="task-manager__menu-backdrop"
                onClick={onMenuClose}
              />
              <div
                ref={menuRef}
                className={`task-manager__dropdown-menu${menuStyle ? " task-manager__dropdown-menu--fixed" : ""}`}
                style={menuStyle}
              >
                <button
                  className="task-manager__menu-item"
                  onClick={() => {
                    onEditTask(task.id);
                    onMenuClose();
                  }}
                >
                  <div className="task-manager__menu-item-content">Muuda</div>
                </button>
                <button
                  className="task-manager__menu-item"
                  onClick={() => {
                    onShareTask(task.id);
                    onMenuClose();
                  }}
                >
                  <div className="task-manager__menu-item-content">Jaga</div>
                </button>
                <button
                  className="task-manager__menu-item task-manager__menu-item--danger"
                  onClick={() => {
                    onDeleteTask(task.id);
                    onMenuClose();
                  }}
                >
                  <div className="task-manager__menu-item-content">Kustuta</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskManagerProps {
  tasks: TaskSummary[];
  onEditTask: (taskId: string) => void;
  onViewTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onShareTask: (taskId: string) => void;
}

export default function TaskManager({
  tasks,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onShareTask,
}: TaskManagerProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const handleShare = (taskId: string) => {
    onShareTask(taskId);
  };

  const handleMenuOpen = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  const toggleExpanded = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onViewTask
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <div className="task-manager-simple">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          isExpanded={expandedTasks.has(task.id)}
          onToggleExpand={toggleExpanded}
          onViewTask={onViewTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onShareTask={handleShare}
          openMenuId={openMenuId}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        />
      ))}
    </div>
  );
}
