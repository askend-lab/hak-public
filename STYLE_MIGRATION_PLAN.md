# Style Migration Plan: EKI → HAK

## Overview

**Goal**: Incrementally merge visual styles from `eki` (prototype) into `hak` (production) without breaking the application at any step.

**Key Insight**: HAK already imports from `vendor/eki-storybook`, but EKI prototype has MORE complete styles (39 vs 12 component files).

---

## Current State Analysis

### EKI (Prototype) - Source of Truth for Visuals

**Design Tokens** (`eki/styles/tokens/`):
| File | Size | Description |
|------|------|-------------|
| `_colors.scss` | 245 lines | Full color system with CSS vars + SCSS aliases |
| `_typography.scss` | 104 lines | Font families, sizes, weights, line-heights |
| `_spacing.scss` | 60 lines | 4px grid system |
| `_borders.scss` | ~50 lines | Border radii, widths |
| `_breakpoints.scss` | ~80 lines | Responsive breakpoints |
| `_opacity.scss` | ~40 lines | Opacity scale |

**Component Styles** (`eki/styles/components/`) - 39 files:

*Base Components:*
- `_panel.scss`, `_paper.scss`

*Core UI:*
- `_modal-base.scss`, `_input.scss`, `_textarea.scss`, `_button.scss`

*Layout:*
- `_page-layouts.scss` (13KB - main layout)
- `_header.scss`, `_footer.scss`

*Audio/Media:*
- `_audio-player.scss`, `_playlist.scss`, `_playlist-audio-player.scss`

*Phonetic/Text:*
- `_stressed-text.scss`, `_synthesis-results.scss` (26KB!)
- `_synthesis-components.scss`, `_sentence-synthesis-item.scss`
- `_pronunciation-variants.scss` (20KB!)
- `_phonetic-guide-modal.scss`, `_sentence-phonetic-panel.scss`

*Task Management:*
- `_task-manager.scss`, `_task-list.scss`, `_task-modal.scss`
- `_task-edit-modal.scss`, `_task-detail.scss`
- `_add-entry-modal.scss`, `_add-to-task-dropdown.scss`
- `_share-task-modal.scss`, `_shared-task.scss`

*User/Auth:*
- `_login-modal.scss`, `_user-profile.scss`

*Feedback/Notification:*
- `_notification.scss`, `_confirm-dialog.scss`
- `_confirmation-modal.scss`, `_feedback-modal.scss`

*Onboarding:*
- `_role-selection.scss`, `_onboarding-wizard.scss`

*App-specific:*
- `_eki-app.scss` (10KB), `_simple-layout.scss` (21KB)

---

### HAK (Production) - Current State

**Design Tokens** (`hak/packages/frontend/src/styles/abstracts/`):
- `_variables.scss` - forwards from vendor/eki-storybook
- `_design-tokens.scss` - spacing, sizing, shadows (70 lines)

**Vendor** (`hak/packages/vendor/eki-storybook/`):
- Has 12 basic component styles (button, modal, input, etc.)
- Missing: all phonetic, task, audio, layout components

**Component Styles** (`hak/packages/frontend/src/styles/components/`) - 28 files:
- Many are smaller/simpler versions of EKI equivalents
- Missing major components from EKI

---

## Migration Strategy

### Principle: "Add, Don't Replace"

Each step ADDS new files without modifying existing ones. Old styles remain until explicitly replaced per-component.

### Phase 1: Foundation (Tokens)
Copy EKI tokens as isolated namespace. No breaking changes.

### Phase 2: Base Components  
Migrate bottom-up: tokens → base → UI → layout → feature components

### Phase 3: Feature Components
Migrate one feature area at a time (audio, tasks, phonetic, etc.)

---

## Commit Checklist

### Phase 1: Foundation (Tokens)

- [ ] **Commit 1**: Add EKI tokens directory
  - Copy `eki/styles/tokens/*` → `hak/packages/frontend/src/styles/eki-tokens/`
  
- [ ] **Commit 2**: Create EKI entry point + import globally
  - Create `src/styles/eki/_index.scss`
  - Update `main.scss` to import EKI tokens

### Phase 2: Base Components

- [ ] **Commit 3**: Add panel component
  - Copy `_panel.scss`

- [ ] **Commit 4**: Add paper component
  - Copy `_paper.scss`

- [ ] **Commit 5**: Replace modal-base
  - Copy `_modal-base.scss`, update imports

- [ ] **Commit 6**: Replace input
  - Copy `_input.scss`, update imports

- [ ] **Commit 7**: Replace textarea
  - Copy `_textarea.scss`, update imports

- [ ] **Commit 8**: Replace button
  - Copy `_button.scss`, update imports

### Phase 3: Layout Components

- [ ] **Commit 9**: Replace header
  - Copy `_header.scss`, update imports

- [ ] **Commit 10**: Replace footer
  - Copy `_footer.scss`, update imports

- [ ] **Commit 11**: Add page-layouts
  - Copy `_page-layouts.scss`

### Phase 4: Feedback/Notification Components

- [ ] **Commit 12**: Add notification
  - Copy `_notification.scss`

- [ ] **Commit 13**: Replace confirm-dialog
  - Copy `_confirm-dialog.scss`, update imports

- [ ] **Commit 14**: Add confirmation-modal
  - Copy `_confirmation-modal.scss`

- [ ] **Commit 15**: Replace feedback-modal
  - Copy `_feedback-modal.scss`, update imports

### Phase 5: Audio Components

- [ ] **Commit 16**: Add audio-player
  - Copy `_audio-player.scss`

- [ ] **Commit 17**: Add playlist
  - Copy `_playlist.scss`

- [ ] **Commit 18**: Add playlist-audio-player
  - Copy `_playlist-audio-player.scss`

### Phase 6: Phonetic/Text Components

- [ ] **Commit 19**: Add stressed-text
  - Copy `_stressed-text.scss`

- [ ] **Commit 20**: Add synthesis-results
  - Copy `_synthesis-results.scss`

- [ ] **Commit 21**: Add synthesis-components
  - Copy `_synthesis-components.scss`

- [ ] **Commit 22**: Add sentence-synthesis-item
  - Copy `_sentence-synthesis-item.scss`

- [ ] **Commit 23**: Add pronunciation-variants
  - Copy `_pronunciation-variants.scss`

- [ ] **Commit 24**: Replace phonetic-guide-modal
  - Copy `_phonetic-guide-modal.scss`, update imports

- [ ] **Commit 25**: Add sentence-phonetic-panel
  - Copy `_sentence-phonetic-panel.scss`

### Phase 7: Task Management Components

- [ ] **Commit 26**: Add task-manager
  - Copy `_task-manager.scss`

- [ ] **Commit 27**: Add task-list
  - Copy `_task-list.scss`

- [ ] **Commit 28**: Add task-modal
  - Copy `_task-modal.scss`

- [ ] **Commit 29**: Add task-edit-modal
  - Copy `_task-edit-modal.scss`

- [ ] **Commit 30**: Add task-detail
  - Copy `_task-detail.scss`

- [ ] **Commit 31**: Add add-entry-modal
  - Copy `_add-entry-modal.scss`

- [ ] **Commit 32**: Add add-to-task-dropdown
  - Copy `_add-to-task-dropdown.scss`

- [ ] **Commit 33**: Replace share-task-modal
  - Copy `_share-task-modal.scss`, update imports

- [ ] **Commit 34**: Add shared-task
  - Copy `_shared-task.scss`

### Phase 8: User/Auth Components

- [ ] **Commit 35**: Add login-modal
  - Copy `_login-modal.scss`

- [ ] **Commit 36**: Replace user-profile
  - Copy `_user-profile.scss`, update imports

### Phase 9: Onboarding Components

- [ ] **Commit 37**: Add role-selection
  - Copy `_role-selection.scss`

- [ ] **Commit 38**: Add onboarding-wizard
  - Copy `_onboarding-wizard.scss`

### Phase 10: App-Level Styles

- [ ] **Commit 39**: Add eki-app styles
  - Copy `_eki-app.scss`

- [ ] **Commit 40**: Add simple-layout
  - Copy `_simple-layout.scss`

- [ ] **Commit 41**: Add base reset
  - Copy `base/_reset.scss`

---

**Total: 41 commits**

---

## React Component Mapping

| EKI Component | HAK Component | Action |
|---------------|---------------|--------|
| `AudioPlayer.tsx` | `synthesis/AudioPlayer.tsx` | Update classNames |
| `TextInput.tsx` | `synthesis/TextInput.tsx` | Update classNames |
| `StressedTextDisplay.tsx` | `synthesis/StressedText.tsx` | Update classNames |
| `PronunciationVariants.tsx` | `synthesis/VariantsPanel.tsx` | Major update |
| `SentenceSynthesisItem.tsx` | `synthesis/SentenceRow.tsx` | Major update |
| `PhoneticGuideModal.tsx` | `synthesis/PhoneticGuideModal.tsx` | Update classNames |
| `TaskDetailView.tsx` | `tasks/TaskDetailView.tsx` | Update classNames |
| `TaskManager.tsx` | - | NEW component needed |
| `Playlist.tsx` | - | NEW component needed |
| `PlaylistItem.tsx` | - | NEW component needed |
| `Footer.tsx` | `layout/Footer.tsx` | Update classNames |
| `Header` (in pages) | `layout/Header.tsx` | Update classNames |
| `LoginModal.tsx` | `auth/LoginModal.tsx` | Update classNames |
| `UserProfile.tsx` | `ui/UserAvatar.tsx` | Compare/merge |

---

## Verification Checklist (Per Step)

- [ ] `pnpm test` passes (170+ tests)
- [ ] `pnpm start` - app loads without console errors
- [ ] Visual spot check on localhost:5180
- [ ] Git commit with descriptive message

---

## Estimated Effort

- **Steps 1-3**: ~30 minutes (foundation)
- **Steps 4-42**: ~15-30 minutes each (39 components)
- **Total**: ~15-25 hours of work

---

## Next Action

Awaiting approval to begin Step 1: Add EKI Tokens as Namespace.
