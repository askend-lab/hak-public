// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";

const MENU_GAP = 4; // px gap between anchor and menu
const VIEWPORT_PADDING = 8; // px minimum distance from viewport edges
const ESTIMATED_MENU_WIDTH = 250; // px estimated width before menu is measured

interface DropdownPosition {
  top: number;
  left: number;
}

interface UseDropdownPositionOptions {
  /** Whether the dropdown is currently open */
  isOpen: boolean;
  /** Alignment of the dropdown relative to the anchor. Default: 'right' */
  alignment?: "right" | "left";
  /** Dependencies that may change the menu size (e.g. loading state, item count) */
  contentDeps?: unknown[];
  /** External anchor element (alternative to using the returned anchorRef) */
  anchorEl?: HTMLElement | null;
}

/**
 * Hook for viewport-aware dropdown positioning.
 * Returns refs for anchor and menu elements, plus calculated position.
 *
 * The dropdown is positioned with `position: fixed` relative to the viewport.
 * It prefers opening below the anchor, but flips above when there isn't enough
 * room below. Left/right edges are also clamped to stay within the viewport.
 *
 * Listens to scroll and resize events to keep position updated.
 */
export function useDropdownPosition({
  isOpen,
  alignment = "right",
  contentDeps = [],
  anchorEl,
}: UseDropdownPositionOptions) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  // Use external anchorEl if provided, otherwise use the ref
  const getAnchorElement = useCallback(
    () => anchorEl ?? anchorRef.current,
    [anchorEl],
  );

  const recalcPosition = useCallback(() => {
    const anchor = getAnchorElement();
    if (!anchor || !menuRef.current) return;
    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const menuHeight = menuRect.height;
    const menuWidth = menuRect.width;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Preferred: below the anchor
    let top = anchorRect.bottom + MENU_GAP;

    // Horizontal alignment
    let left =
      alignment === "right"
        ? anchorRect.right - menuWidth // align right edges
        : anchorRect.left; // align left edges

    // If menu overflows bottom, flip above the anchor
    if (top + menuHeight > vh - VIEWPORT_PADDING) {
      const aboveTop = anchorRect.top - MENU_GAP - menuHeight;
      if (aboveTop >= VIEWPORT_PADDING) {
        top = aboveTop;
      } else {
        // Not enough room above either - clamp to viewport bottom
        top = Math.max(VIEWPORT_PADDING, vh - menuHeight - VIEWPORT_PADDING);
      }
    }

    // Ensure left/right stay within viewport
    left = Math.max(VIEWPORT_PADDING, left);
    if (left + menuWidth > vw - VIEWPORT_PADDING) {
      left = vw - menuWidth - VIEWPORT_PADDING;
    }

    setPosition({ top, left });
  }, [alignment, getAnchorElement]);

  // Set initial position from anchor (before menu is measured)
  useLayoutEffect(() => {
    const anchor = getAnchorElement();
    if (isOpen && anchor) {
      const rect = anchor.getBoundingClientRect();
      setPosition({
        top: rect.bottom + MENU_GAP,
        left:
          alignment === "right"
            ? Math.max(VIEWPORT_PADDING, rect.right - ESTIMATED_MENU_WIDTH)
            : Math.max(VIEWPORT_PADDING, rect.left),
      });
    } else if (!isOpen) {
      setPosition(null);
    }
  }, [isOpen, alignment, getAnchorElement]);

  // Adjust position after menu renders and when content changes
  const contentKey = useMemo(() => JSON.stringify(contentDeps), [contentDeps]);
  useEffect(() => {
    if (!isOpen) return;
    recalcPosition();
  }, [isOpen, recalcPosition, contentKey]);

  // Keep position updated on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = (): void => recalcPosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, recalcPosition]);

  return {
    anchorRef,
    menuRef,
    position,
    menuStyle: position ? { top: position.top, left: position.left } : undefined,
  };
}
