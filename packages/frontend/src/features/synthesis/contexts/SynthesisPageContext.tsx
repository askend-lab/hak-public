// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import {
  useSynthesis,
  useTaskHandlers,
  useDragAndDrop,
  useVariantsPanel,
  useSentenceMenu,
} from "@/hooks";
import type { ShowNotificationOptions } from "@/contexts/NotificationContext";

type SynthesisHook = ReturnType<typeof useSynthesis>;
type TaskHandlersHook = ReturnType<typeof useTaskHandlers>;
type DragDropHook = ReturnType<typeof useDragAndDrop>;
type VariantsHook = ReturnType<typeof useVariantsPanel>;
type MenuHook = ReturnType<typeof useSentenceMenu>;

export interface SynthesisCoreContextValue {
  synthesis: SynthesisHook;
  taskHandlers: TaskHandlersHook;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export interface SynthesisInteractionContextValue {
  dragDrop: DragDropHook;
  variants: VariantsHook;
  menu: MenuHook;
  handleUseVariant: (variantText: string) => void;
  handleTagMenuOpen: (sentenceId: string, tagIndex: number) => void;
  handleTagMenuClose: () => void;
}

export type SynthesisPageContextValue = SynthesisCoreContextValue & SynthesisInteractionContextValue;

const SynthesisCoreContext = createContext<SynthesisCoreContextValue | null>(null);
const SynthesisInteractionContext = createContext<SynthesisInteractionContextValue | null>(null);

interface SynthesisPageProviderProps {
  children: ReactNode;
  synthesis: SynthesisHook;
  taskHandlers: TaskHandlersHook;
  showNotification: (options: ShowNotificationOptions) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function SynthesisPageProvider({
  children,
  synthesis,
  taskHandlers,
  showNotification,
  isAuthenticated,
  onLogin,
}: SynthesisPageProviderProps) {
  const dragDrop = useDragAndDrop();
  const variants = useVariantsPanel(undefined, undefined, showNotification);
  const menu = useSentenceMenu();

  const handleUseVariant = useCallback((variantText: string): void => {
    synthesis.handleUseVariant(
      variantText,
      variants.selectedSentenceId,
      variants.selectedTagIndex,
    );
    variants.setVariantsCustomPhonetic(variantText);
  }, [synthesis, variants]);

  const handleTagMenuOpen = useCallback((sentenceId: string, tagIndex: number): void => {
    const isOpen =
      synthesis.openTagMenu?.sentenceId === sentenceId &&
      synthesis.openTagMenu?.tagIndex === tagIndex;
    synthesis.setOpenTagMenu(
      isOpen ? null : { sentenceId, tagIndex },
    );
  }, [synthesis]);

  const handleTagMenuClose = useCallback((): void => synthesis.setOpenTagMenu(null), [synthesis]);

  const coreValue = useMemo(() => ({
    synthesis, taskHandlers, isAuthenticated, onLogin,
  }), [synthesis, taskHandlers, isAuthenticated, onLogin]);

  const interactionValue = useMemo(() => ({
    dragDrop, variants, menu, handleUseVariant, handleTagMenuOpen, handleTagMenuClose,
  }), [dragDrop, variants, menu, handleUseVariant, handleTagMenuOpen, handleTagMenuClose]);

  return (
    <SynthesisCoreContext.Provider
      value={coreValue}
    >
      <SynthesisInteractionContext.Provider
        value={interactionValue}
      >
        {children}
      </SynthesisInteractionContext.Provider>
    </SynthesisCoreContext.Provider>
  );
}

export function useSynthesisCore(): SynthesisCoreContextValue {
  const context = useContext(SynthesisCoreContext);
  if (!context) {
    throw new Error("useSynthesisCore must be used within SynthesisPageProvider");
  }
  return context;
}

export function useSynthesisInteraction(): SynthesisInteractionContextValue {
  const context = useContext(SynthesisInteractionContext);
  if (!context) {
    throw new Error("useSynthesisInteraction must be used within SynthesisPageProvider");
  }
  return context;
}

export function useSynthesisPage(): SynthesisPageContextValue {
  return { ...useSynthesisCore(), ...useSynthesisInteraction() };
}
