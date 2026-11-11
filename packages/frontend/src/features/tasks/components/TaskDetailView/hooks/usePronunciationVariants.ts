// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { useDataService } from "@/contexts/DataServiceContext";
import { convertTextToTags } from "@/types/synthesis";
import { logger } from "@hak/shared";

function buildVariantUpdate(entry: TaskEntry, tagIndex: number, variantText: string): { newStressedText: string; updatedEntry: TaskEntry } | null {
  const displayWords = convertTextToTags(entry.text);
  if (tagIndex < 0 || tagIndex >= displayWords.length) {return null;}
  const stressedWords = convertTextToTags(entry.stressedText || entry.text);
  stressedWords[tagIndex] = variantText;
  const newStressedText = stressedWords.join(" ");
  return { newStressedText, updatedEntry: { ...entry, stressedText: newStressedText, audioUrl: null, audioBlob: null } };
}

const mapEntry = (id: string, updated: TaskEntry) => (e: TaskEntry) => e.id === id ? updated : e;

interface VariantsDeps {
  entries: TaskEntry[];
  setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>;
  task: Task | null;
  userId: string | undefined;
}

interface UsePronunciationVariantsReturn {
  variantsWord: string | null;
  variantsCustomPhonetic: string | null;
  isVariantsPanelOpen: boolean;
  selectedEntryId: string | null;
  selectedTagIndex: number | null;
  handleTagClick: (entryId: string, tagIndex: number, word: string) => void;
  handleCloseVariants: () => void;
  handleUseVariant: (variantText: string) => Promise<void>;
}

function useVariantsState(entries: TaskEntry[]) {
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [tagIdx, setTagIdx] = useState<number | null>(null);

  const open = useCallback((eId: string, tIdx: number, word: string) => {
    const entry = entries.find((e) => e.id === eId);
    const stressed = entry?.stressedText ? convertTextToTags(entry.stressedText) : undefined;
    setEntryId(eId); setTagIdx(tIdx); setVariantsWord(word);
    setVariantsCustomPhonetic(stressed?.[tIdx] || null); setIsOpen(true);
  }, [entries]);

  const close = useCallback(() => {
    setIsOpen(false); setVariantsWord(null); setVariantsCustomPhonetic(null); setEntryId(null); setTagIdx(null);
  }, []);

  return { variantsWord, variantsCustomPhonetic, isOpen, entryId, tagIdx, open, close };
}

interface PersistOpts { ds: ReturnType<typeof useDataService>; task: Task; entryId: string; text: string; stressed: string }
async function persistVariant(opts: PersistOpts): Promise<void> {
  await opts.ds.updateTaskEntry(opts.task.id, opts.entryId, { text: opts.text, stressedText: opts.stressed });
}

export function usePronunciationVariants(deps: VariantsDeps): UsePronunciationVariantsReturn {
  const { entries, setEntries, task, userId } = deps;
  const dataService = useDataService();
  const vs = useVariantsState(entries);

  const applyVariant = useCallback(async (eid: string, tagIdx: number, variantText: string) => {
    const entry = entries.find((e) => e.id === eid);
    const update = entry ? buildVariantUpdate(entry, tagIdx, variantText) : null;
    if (!entry || !update) {return;}
    setEntries((prev) => prev.map(mapEntry(eid, update.updatedEntry)));
    try { if (userId && task) { await persistVariant({ ds: dataService, task, entryId: eid, text: entry.text, stressed: update.newStressedText }); } }
    catch { setEntries((prev) => prev.map(mapEntry(eid, entry))); logger.error("Viga: variandi salvestamine ebaõnnestus"); }
  }, [entries, setEntries, userId, task, dataService]);

  const handleUseVariant = useCallback(async (variantText: string) => {
    if (vs.entryId !== null && vs.tagIdx !== null) { await applyVariant(vs.entryId, vs.tagIdx, variantText); }
    vs.close();
  }, [vs.entryId, vs.tagIdx, vs.close, applyVariant]);

  return {
    variantsWord: vs.variantsWord, variantsCustomPhonetic: vs.variantsCustomPhonetic,
    isVariantsPanelOpen: vs.isOpen, selectedEntryId: vs.entryId, selectedTagIndex: vs.tagIdx,
    handleTagClick: vs.open, handleCloseVariants: vs.close, handleUseVariant,
  };
}
