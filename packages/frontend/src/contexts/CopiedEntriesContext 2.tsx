// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createContext, useContext, useState, useCallback, useRef, useMemo, ReactNode } from "react";

interface RawEntry {
  id?: string;
  text: string;
  stressedText?: string;
  audioUrl?: string | null;
}

interface CopiedEntriesContextValue {
  copiedEntries: RawEntry[] | null;
  setCopiedEntries: (entries: RawEntry[]) => void;
  consumeCopiedEntries: () => RawEntry[] | null;
  hasCopiedEntries: boolean;
}

const CopiedEntriesContext = createContext<CopiedEntriesContextValue | undefined>(
  undefined,
);

export function CopiedEntriesProvider({ children }: { children: ReactNode }) {
  const [copiedEntries, setEntries] = useState<RawEntry[] | null>(null);
  const entriesRef = useRef(copiedEntries);
  entriesRef.current = copiedEntries;

  const setCopiedEntries = useCallback((entries: RawEntry[]) => {
    setEntries(entries);
  }, []);

  const consumeCopiedEntries = useCallback((): RawEntry[] | null => {
    const entries = entriesRef.current;
    if (entries) {
      setEntries(null);
    }
    return entries;
  }, []);

  const hasCopiedEntries = copiedEntries !== null && copiedEntries.length > 0;

  const value = useMemo(
    () => ({ copiedEntries, setCopiedEntries, consumeCopiedEntries, hasCopiedEntries }),
    [copiedEntries, setCopiedEntries, consumeCopiedEntries, hasCopiedEntries],
  );

  return (
    <CopiedEntriesContext.Provider value={value}>
      {children}
    </CopiedEntriesContext.Provider>
  );
}

export function useCopiedEntries(): CopiedEntriesContextValue {
  const context = useContext(CopiedEntriesContext);
  if (!context) {
    throw new Error("useCopiedEntries must be used within CopiedEntriesProvider");
  }
  return context;
}
