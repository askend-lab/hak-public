// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect } from "react";

const DEFAULT_TITLE = "HAK — Eesti keele õppeplatvorm";

/**
 * Sets the document title, restoring the default on unmount.
 * Pass `undefined` to keep the default title.
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ?? DEFAULT_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
