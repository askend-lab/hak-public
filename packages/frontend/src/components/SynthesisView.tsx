// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import SynthesisPageHeader from "./SynthesisPageHeader";
import SentenceMenu from "./SentenceMenu";
import SentenceSynthesisItem from "./SentenceSynthesisItem";
import { SentenceState } from "@/types/synthesis";
import { SYNTHESIS_STRINGS } from "@/constants/ui-strings";
import { useSynthesisPage } from "@/contexts/SynthesisPageContext";

interface TagMenuItem {
  label: string;
  onClick: (sentenceId: string, tagIndex: number, word: string) => void;
  danger?: boolean;
}

interface SentenceItemProps {
  sentence: SentenceState;
  sentenceIndex: number;
}

function SentenceItem({ sentence, sentenceIndex }: SentenceItemProps) {
  const {
    synthesis,
    dragDrop,
    variants,
    menu,
    taskHandlers,
    isAuthenticated,
    onLogin,
    handleTagMenuOpen,
    handleTagMenuClose,
  } = useSynthesisPage();

  const tagMenuItems: TagMenuItem[] = [
    {
      label: SYNTHESIS_STRINGS.TAG_MENU_VARIANTS,
      onClick: (sid, tidx, w) => variants.handleOpenVariantsFromMenu(sid, tidx, w),
    },
    {
      label: SYNTHESIS_STRINGS.TAG_MENU_EDIT,
      onClick: (sid, tidx) => synthesis.handleEditTag(sid, tidx),
    },
    {
      label: SYNTHESIS_STRINGS.TAG_MENU_DELETE,
      onClick: (sid, tidx) => synthesis.handleDeleteTag(sid, tidx),
      danger: true,
    },
  ];

  const isMenuOpen =
    menu.openMenuId === sentence.id && menu.menuAnchorEl[sentence.id];
  const isTagSelected =
    (variants.isVariantsPanelOpen || variants.showSentencePhoneticPanel) &&
    (variants.selectedSentenceId === sentence.id ||
      variants.sentencePhoneticId === sentence.id);

  return (
    <SentenceSynthesisItem
      key={sentence.id}
      id={sentence.id}
      text={sentence.text}
      tags={sentence.tags || []}
      mode="input"
      draggable={true}
      isDragging={dragDrop.draggedId === sentence.id}
      isDragOver={dragDrop.dragOverId === sentence.id}
      isPlaying={sentence.isPlaying ?? false}
      isLoading={sentence.isLoading ?? false}
      onPlay={synthesis.handlePlay}
      onDragStart={dragDrop.handleDragStart}
      onDragEnd={dragDrop.handleDragEnd}
      onDragOver={dragDrop.handleDragOver}
      onDragLeave={dragDrop.handleDragLeave}
      onDrop={dragDrop.handleDrop}
      onTagMenuOpen={handleTagMenuOpen}
      openTagMenu={synthesis.openTagMenu}
      onTagMenuClose={handleTagMenuClose}
      tagMenuItems={tagMenuItems}
      loadingTagIndex={
        variants.loadingVariantsTag?.sentenceId === sentence.id
          ? variants.loadingVariantsTag.tagIndex
          : null
      }
      selectedTagIndex={isTagSelected ? variants.selectedTagIndex : null}
      isPronunciationPanelOpen={
        variants.isVariantsPanelOpen || variants.showSentencePhoneticPanel
      }
      allTagsSelected={
        variants.showSentencePhoneticPanel &&
        variants.sentencePhoneticId === sentence.id
      }
      editingTag={synthesis.editingTag}
      onEditTagChange={synthesis.handleEditTagChange}
      onEditTagKeyDown={synthesis.handleEditTagKeyDown}
      onEditTagCommit={synthesis.handleEditTagCommit}
      currentInput={sentence.currentInput ?? ""}
      onInputChange={synthesis.handleTextChange}
      onInputKeyDown={(e) => synthesis.handleKeyDown(e, sentence.id)}
      onInputBlur={() => synthesis.handleInputBlur(sentence.id)}
      onClear={synthesis.handleClearSentence}
      sentenceIndex={sentenceIndex}
      onMenuOpenLegacy={menu.handleMenuOpen}
      menuContent={
        isMenuOpen ? (
          <SentenceMenu
            isAuthenticated={isAuthenticated}
            sentenceId={sentence.id}
            sentenceText={sentence.text}
            menuSearchQuery={menu.menuSearchQuery}
            onSearchChange={menu.setMenuSearchQuery}
            isLoadingTasks={menu.isLoadingMenuTasks}
            tasks={menu.menuTasks}
            onAddToTask={taskHandlers.handleAddSentenceToExistingTask}
            onCreateNewTask={taskHandlers.handleCreateNewTaskFromMenu}
            onExplorePhonetic={variants.handleExplorePhonetic}
            onDownload={synthesis.handleDownload}
            onCopyText={synthesis.handleCopyText}
            onRemove={synthesis.handleRemoveSentence}
            onLogin={onLogin}
            onClose={menu.handleMenuClose}
            anchorEl={menu.menuAnchorEl[sentence.id]}
          />
        ) : undefined
      }
    />
  );
}

export default function SynthesisView() {
  const { synthesis, taskHandlers } = useSynthesisPage();

  return (
    <>
      <SynthesisPageHeader
        sentenceCount={synthesis.sentences.filter((s) => s.text.trim()).length}
        isPlayingAll={synthesis.isPlayingAll}
        isLoadingPlayAll={synthesis.isLoadingPlayAll}
        onAddAllClick={taskHandlers.handleAddAllSentencesToTask}
        onPlayAllClick={synthesis.handlePlayAll}
        showDropdown={taskHandlers.showAddToTaskDropdown}
        onDropdownClose={() => taskHandlers.setShowAddToTaskDropdown(false)}
        onSelectTask={taskHandlers.handleSelectTaskFromDropdown}
        onCreateNew={taskHandlers.handleCreateNewFromDropdown}
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
