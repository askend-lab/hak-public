// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createContext, useContext, ReactNode } from "react";
import {
  useSynthesis,
  useTaskHandlers,
  useDragAndDrop,
  useVariantsPanel,
  useSentenceMenu,
} from "@/hooks";
import { SentenceState } from "@/types/synthesis";
import { NotificationType } from "@/components/Notification";

type SynthesisHook = ReturnType<typeof useSynthesis>;
type TaskHandlersHook = ReturnType<typeof useTaskHandlers>;
type DragDropHook = ReturnType<typeof useDragAndDrop>;
type VariantsHook = ReturnType<typeof useVariantsPanel>;
type MenuHook = ReturnType<typeof useSentenceMenu>;

export interface SynthesisPageContextValue {
  synthesis: SynthesisHook;
  taskHandlers: TaskHandlersHook;
  dragDrop: DragDropHook;
  variants: VariantsHook;
  menu: MenuHook;
  isAuthenticated: boolean;
  onLogin: () => void;
  handleUseVariant: (variantText: string) => void;
  handleTagMenuOpen: (sentenceId: string, tagIndex: number) => void;
  handleTagMenuClose: () => void;
}

const SynthesisPageContext = createContext<SynthesisPageContextValue | null>(
  null,
);

interface SynthesisPageProviderProps {
  children: ReactNode;
  sentences: SentenceState[];
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>;
  synthesis: SynthesisHook;
  taskHandlers: TaskHandlersHook;
  showNotification: (
    type: NotificationType,
    title: string,
    desc?: string,
  ) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function SynthesisPageProvider({
  children,
  sentences,
  setSentences,
  synthesis,
  taskHandlers,
  showNotification,
  isAuthenticated,
  onLogin,
}: SynthesisPageProviderProps) {
  const dragDrop = useDragAndDrop(setSentences);
  const variants = useVariantsPanel(sentences, setSentences, showNotification);
  const menu = useSentenceMenu();

  const handleUseVariant = (variantText: string) => {
    synthesis.handleUseVariant(
      variantText,
      variants.selectedSentenceId,
      variants.selectedTagIndex,
    );
    variants.setVariantsCustomPhonetic(variantText);
  };

  const handleTagMenuOpen = (sentenceId: string, tagIndex: number) => {
    const isOpen =
      synthesis.openTagMenu?.sentenceId === sentenceId &&
      synthesis.openTagMenu?.tagIndex === tagIndex;
    synthesis.setOpenTagMenu(
      isOpen ? null : { sentenceId, tagIndex },
    );
  };

  const handleTagMenuClose = () => synthesis.setOpenTagMenu(null);

  return (
    <SynthesisPageContext.Provider
      value={{
        synthesis,
        taskHandlers,
        dragDrop,
        variants,
        menu,
        isAuthenticated,
        onLogin,
        handleUseVariant,
        handleTagMenuOpen,
        handleTagMenuClose,
      }}
    >
      {children}
    </SynthesisPageContext.Provider>
  );
}

export function useSynthesisPage(): SynthesisPageContextValue {
  const context = useContext(SynthesisPageContext);
  if (!context) {
    throw new Error(
      "useSynthesisPage must be used within SynthesisPageProvider",
    );
  }
  return context;
}
