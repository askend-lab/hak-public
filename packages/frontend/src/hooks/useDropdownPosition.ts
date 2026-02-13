// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useRef, useState, useEffect, useCallback } from "react";

interface UseDropdownPositionOptions {
  isOpen: boolean;
  anchorEl?: HTMLElement | null;
  contentDeps?: unknown[];
}

interface UseDropdownPositionResult {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  menuStyle: React.CSSProperties;
}

/**
 * Positions a dropdown menu relative to its anchor element,
 * ensuring it stays within the viewport.
 */
export function useDropdownPosition({
  isOpen,
  anchorEl,
}: UseDropdownPositionOptions): UseDropdownPositionResult {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    const anchor = anchorEl ?? anchorRef.current;
    const menu = menuRef.current;
    if (!anchor || !menu || !isOpen) {
      setMenuStyle({});
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = anchorRect.bottom;
    let left = anchorRect.left;

    // Flip up if overflowing bottom
    if (top + menuRect.height > viewportHeight) {
      top = anchorRect.top - menuRect.height;
    }

    // Shift left if overflowing right
    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 8;
    }

    // Clamp
    top = Math.max(4, top);
    left = Math.max(4, left);

    setMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [isOpen, anchorEl]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  return { anchorRef, menuRef, menuStyle };
}
