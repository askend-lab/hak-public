// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import SynthesisPageHeader from "./SynthesisPageHeader";
import SentenceMenu from "./SentenceMenu";
import SentenceSynthesisItem from "./SentenceSynthesisItem";
import { SentenceState } from "@/types/synthesis";
import { SYNTHESIS_STRINGS } from "@/config/ui-strings";
import { useSynthesisPage, useSynthesisCore } from "@/features/synthesis/contexts/SynthesisPageContext";

interface TagMenuItem {
  label: string;
  onClick: (sentenceId: string, tagIndex: number, word: string) => void;
  danger?: boolean;
}

interface SentenceItemProps {
  sentence: SentenceState;
  sentenceIndex: number;
}

function buildTagMenuItems(synthesis: ReturnType<typeof useSynthesisPage>["synthesis"], variants: ReturnType<typeof useSynthesisPage>["variants"]): TagMenuItem[] {
  return [
    { label: SYNTHESIS_STRINGS.TAG_MENU_VARIANTS, onClick: (sid, tidx, w) => { void variants.handleOpenVariantsFromMenu(sid, tidx, w); } },
    { label: SYNTHESIS_STRINGS.TAG_MENU_EDIT, onClick: (sid, tidx) => synthesis.handleEditTag(sid, tidx) },
    { label: SYNTHESIS_STRINGS.TAG_MENU_DELETE, onClick: (sid, tidx) => synthesis.handleDeleteTag(sid, tidx), danger: true },
  ];
}

function SentenceMenuContent({ sentence, menu, taskHandlers, synthesis, variants, isAuthenticated, onLogin }: {
  sentence: SentenceState; menu: ReturnType<typeof useSynthesisPage>["menu"]; taskHandlers: ReturnType<typeof useSynthesisPage>["taskHandlers"];
  synthesis: ReturnType<typeof useSynthesisPage>["synthesis"]; variants: ReturnType<typeof useSynthesisPage>["variants"];
  isAuthenticated: boolean; onLogin: () => void;
}) {
  const isOpen = menu.openMenuId === sentence.id && menu.menuAnchorEl[sentence.id];
  if (!isOpen) {return undefined;}
  return (
    <SentenceMenu isAuthenticated={isAuthenticated} sentenceId={sentence.id} sentenceText={sentence.text}
      menuSearchQuery={menu.menuSearchQuery} onSearchChange={menu.setMenuSearchQuery} isLoadingTasks={menu.isLoadingMenuTasks} tasks={menu.menuTasks}
      onAddToTask={(...args: Parameters<typeof taskHandlers.entries.handleAddSentenceToExistingTask>) => { void taskHandlers.entries.handleAddSentenceToExistingTask(...args); }}
      onCreateNewTask={(...args: Parameters<typeof taskHandlers.crud.handleCreateNewTaskFromMenu>) => { void taskHandlers.crud.handleCreateNewTaskFromMenu(...args); }}
      onExplorePhonetic={(...args: Parameters<typeof variants.handleExplorePhonetic>) => { void variants.handleExplorePhonetic(...args); }}
      onDownload={(...args: Parameters<typeof synthesis.handleDownload>) => { void synthesis.handleDownload(...args); }}
      onCopyText={(...args: Parameters<typeof synthesis.handleCopyText>) => { void synthesis.handleCopyText(...args); }}
      onRemove={synthesis.handleRemoveSentence} onLogin={onLogin} onClose={menu.handleMenuClose} anchorEl={menu.menuAnchorEl[sentence.id]} />
  );
}

function computeSentenceProps(sentence: SentenceState, variants: ReturnType<typeof useSynthesisPage>["variants"]) {
  const panelOpen = variants.isVariantsPanelOpen || variants.showSentencePhoneticPanel;
  const isTagSelected = panelOpen && (variants.selectedSentenceId === sentence.id || variants.sentencePhoneticId === sentence.id);
  const loadingIdx = variants.loadingVariantsTag?.sentenceId === sentence.id ? variants.loadingVariantsTag.tagIndex : null;
  const allTagsSelected = variants.showSentencePhoneticPanel && variants.sentencePhoneticId === sentence.id;
  return { panelOpen, isTagSelected, loadingIdx, allTagsSelected };
}

function SentenceItem({ sentence, sentenceIndex }: SentenceItemProps) {
  const ctx = useSynthesisPage();
  const { synthesis, dragDrop, variants, menu, handleTagMenuOpen, handleTagMenuClose } = ctx;
  const tagMenuItems = buildTagMenuItems(synthesis, variants);
  const cp = computeSentenceProps(sentence, variants);

  return (
    <SentenceSynthesisItem id={sentence.id} text={sentence.text} tags={sentence.tags || []} mode="input" draggable={true}
      isDragging={dragDrop.draggedId === sentence.id} isDragOver={dragDrop.dragOverId === sentence.id}
      isPlaying={sentence.isPlaying ?? false} isLoading={sentence.isLoading ?? false}
      onPlay={(...args: Parameters<typeof synthesis.handlePlay>) => { void synthesis.handlePlay(...args); }}
      onDragStart={dragDrop.handleDragStart} onDragEnd={dragDrop.handleDragEnd} onDragOver={dragDrop.handleDragOver}
      onDragLeave={dragDrop.handleDragLeave} onDrop={dragDrop.handleDrop}
      onTagMenuOpen={handleTagMenuOpen} openTagMenu={synthesis.openTagMenu} onTagMenuClose={handleTagMenuClose} tagMenuItems={tagMenuItems}
      loadingTagIndex={cp.loadingIdx} selectedTagIndex={cp.isTagSelected ? variants.selectedTagIndex : null}
      isPronunciationPanelOpen={cp.panelOpen} allTagsSelected={cp.allTagsSelected}
      editingTag={synthesis.editingTag} onEditTagChange={synthesis.handleEditTagChange} onEditTagKeyDown={synthesis.handleEditTagKeyDown} onEditTagCommit={synthesis.handleEditTagCommit}
      currentInput={sentence.currentInput ?? ""} onInputChange={synthesis.handleTextChange}
      onInputKeyDown={(e) => synthesis.handleKeyDown(e, sentence.id)} onInputBlur={() => synthesis.handleInputBlur(sentence.id)}
      onClear={synthesis.handleClearSentence} sentenceIndex={sentenceIndex}
      onMenuOpenLegacy={(...args: Parameters<typeof menu.handleMenuOpen>) => { void menu.handleMenuOpen(...args); }}
      menuContent={<SentenceMenuContent sentence={sentence} menu={menu} taskHandlers={ctx.taskHandlers} synthesis={synthesis}
        variants={variants} isAuthenticated={ctx.isAuthenticated} onLogin={ctx.onLogin} />}
    />
  );
}

export default function SynthesisView() {
  const { synthesis, taskHandlers } = useSynthesisCore();

  return (
    <>
      <SynthesisPageHeader
        sentenceCount={synthesis.sentences.filter((s) => s.text.trim()).length}
        isPlayingAll={synthesis.isPlayingAll}
        isLoadingPlayAll={synthesis.isLoadingPlayAll}
        onAddAllClick={(...args: Parameters<typeof taskHandlers.entries.handleAddAllSentencesToTask>) => { void taskHandlers.entries.handleAddAllSentencesToTask(...args); }}
        onPlayAllClick={() => { void synthesis.handlePlayAll(); }}
        showDropdown={taskHandlers.modals.showAddToTaskDropdown}
        onDropdownClose={() => taskHandlers.modals.setShowAddToTaskDropdown(false)}
        onSelectTask={(...args: Parameters<typeof taskHandlers.entries.handleSelectTaskFromDropdown>) => { void taskHandlers.entries.handleSelectTaskFromDropdown(...args); }}
        onCreateNew={() => { void taskHandlers.entries.handleCreateNewFromDropdown(); }}
      />
      <div className="page-content">
        <div className="sentences-section">
          {synthesis.sentences.map((s, i) => (
            <SentenceItem key={s.id} sentence={s} sentenceIndex={i} />
          ))}
          <div className="add-sentence-button-wrapper">
            <button
              className="button button--secondary"
              onClick={synthesis.handleAddSentence}
              data-onboarding-target="add-sentence-button"
            >
              {SYNTHESIS_STRINGS.ADD_SENTENCE}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
