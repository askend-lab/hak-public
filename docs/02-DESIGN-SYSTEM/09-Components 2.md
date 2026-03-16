# Component Inventory

Complete inventory of all components used by the application, categorized by origin.

---

## EKI Storybook Components

These components are imported from the central EKI Storybook and used as-is via CSS classes. Do not modify their styles directly.

### Button

| Class | Purpose |
|-------|---------|
| `.button` | Base button |
| `.button--primary` | Primary action |
| `.button--secondary` | Secondary action |
| `.button--danger` | Destructive action |
| `.button--icon-only` | Icon-only button (no text) |
| `.button--circular` | Circular icon button |
| `.button--small` | Compact size |
| `.button--large` | Larger size |
| `.button--disabled` | Disabled state |

### Input

| Class | Purpose |
|-------|---------|
| `.input` | Base text input |
| `.input__field` | Input field element |
| `.input-label` | Associated label |
| `.input-helper-text` | Helper text below input |
| `.input--small` | Small variant |
| `.input--medium` | Medium variant |
| `.input--large` | Large variant |

### Textarea

| Class | Purpose |
|-------|---------|
| `.textarea` | Multi-line text input |
| `.textarea-label` | Associated label |
| `.textarea-helper-text` | Helper text below textarea |

### Modal (notification variant)

| Class | Purpose |
|-------|---------|
| `.modal` | Base modal |
| `.modal--small` | Small notification |
| `.modal--outlined` | Outlined variant |

### Avatar

| Class | Purpose |
|-------|---------|
| `.avatar` | User avatar |
| `.avatar__initials` | Initials fallback |

### Other Storybook Components

| Class | Purpose |
|-------|---------|
| `.checkbox-btn` | Checkbox input |
| `.radio-btn` | Radio button |
| `.select` | Dropdown select |

---

## Custom App Components

These components are specific to this application and built on top of the design token system.

### Layout

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| AppHeader | `src/components/AppHeader.tsx` | `_header.scss` | Sticky navigation header with logo, nav tabs, user profile |
| Footer | `src/components/Footer.tsx` | `_footer.scss` | Page footer with contact, links, social media, sponsors |
| PageLayout | via SCSS classes | `_page-layout-base.scss` | Top-level page structure (header/main/footer grid) |
| PageHeader | via SCSS classes | `_page-header-variants.scss` | Page header variants (minimal, full, with-actions) |
| PageContent | via SCSS classes | `_page-content.scss` | Content area with max-width constraint and empty states |
| PageFooter | via SCSS classes | `_page-footer.scss` | Footer layout wrapper (full-width variant) |
| Dashboard | `src/components/Dashboard.tsx` | `_dashboard.scss` | Landing dashboard after role selection |

### Synthesis

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| SynthesisView | `src/features/synthesis/components/SynthesisView.tsx` | `_synthesis-results.scss` | Main synthesis page with text input and results |
| SynthesisPageHeader | `src/features/synthesis/components/SynthesisPageHeader.tsx` | `_page-header-variants.scss` | Header for synthesis page with play-all action |
| SentenceSynthesisItem | `src/features/synthesis/components/SentenceSynthesisItem.tsx` | `_sentence-synthesis-item.scss` | Individual sentence row with play, menu, tags |
| SentencePhoneticPanel | `src/features/synthesis/components/SentencePhoneticPanel.tsx` | `_sentence-phonetic-panel.scss` | Phonetic detail panel for a sentence |
| SentenceMenu | `src/features/synthesis/components/SentenceMenu.tsx` | `_synthesis-components.scss` | Context menu for sentence actions |
| PlayButton | `src/features/synthesis/components/SentenceSynthesis/PlayButton.tsx` | `_button.scss` | Audio play button (uses Storybook button classes) |
| RowMenu | `src/features/synthesis/components/SentenceSynthesis/RowMenu.tsx` | `_synthesis-components.scss` | Row-level dropdown menu |
| TagsInput | `src/features/synthesis/components/SentenceSynthesis/TagsInput.tsx` | `_sentence-synthesis-item.scss` | Tag input for sentence labeling |
| TagsList | `src/features/synthesis/components/SentenceSynthesis/TagsList.tsx` | `_sentence-synthesis-item.scss` | Tag display list |

### Pronunciation Variants

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| PronunciationVariants | `src/features/synthesis/components/PronunciationVariants/PronunciationVariants.tsx` | `_pronunciation-variants.scss` | Sliding panel showing pronunciation variants |
| VariantItem | `src/features/synthesis/components/PronunciationVariants/VariantItem.tsx` | `_pronunciation-variants.scss` | Single variant with play button |
| CustomVariantForm | `src/features/synthesis/components/PronunciationVariants/CustomVariantForm.tsx` | `_pronunciation-variants.scss` | Form for adding custom pronunciation |
| PhoneticGuide | `src/features/synthesis/components/PronunciationVariants/PhoneticGuide.tsx` | `_phonetic-guide-modal.scss` | IPA phonetic guide modal |

### Tasks

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| TasksView | `src/features/tasks/components/TasksView.tsx` | `_task-list.scss` | Task list page with create action |
| TaskManager | `src/features/tasks/components/TaskManager.tsx` | `_task-manager.scss` | Task management sidebar/panel |
| TaskDetailView | `src/features/tasks/components/TaskDetailView/TaskDetailView.tsx` | `_task-detail.scss` | Task detail two-column layout |
| TaskDetailHeader | `src/features/tasks/components/TaskDetailView/TaskDetailHeader.tsx` | `_task-detail.scss` | Task detail page header |
| TaskDetailEmpty | `src/features/tasks/components/TaskDetailView/TaskDetailEmpty.tsx` | `_page-content.scss` | Empty state for task with no entries |
| TaskEditModal | `src/features/tasks/components/TaskEditModal.tsx` | `_task-edit-modal.scss` | Modal for editing task name/description |
| AddEntryModal | `src/features/tasks/components/AddEntryModal.tsx` | `_add-entry-modal.scss` | Modal for adding entries to a task |
| AddToTaskDropdown | `src/features/tasks/components/AddToTaskDropdown.tsx` | `_add-to-task-dropdown.scss` | Dropdown for adding sentences to tasks |

### Sharing

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| ShareTaskModal | `src/features/sharing/components/ShareTaskModal.tsx` | `_share-task-modal.scss` | Modal for sharing tasks via link |
| SharedTaskPage | `src/features/sharing/pages/SharedTaskPage.tsx` | `_shared-task.scss` | Public shared task view page |

### Onboarding

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| RoleSelectionPage | `src/features/onboarding/components/RoleSelectionPage.tsx` | `_role-selection.scss` | Initial role selection (teacher/student/other) |
| OnboardingWizard | `src/features/onboarding/components/OnboardingWizard.tsx` | `_onboarding-wizard.scss` | Step-by-step onboarding tooltip wizard |
| WizardTooltip | `src/features/onboarding/components/WizardTooltip.tsx` | `_onboarding-wizard.scss` | Individual onboarding tooltip step |

### Authentication

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| LoginModal | `src/features/auth/components/LoginModal.tsx` | `_login-modal.scss` | Login dialog with TARA auth |
| AuthCallbackPage | `src/features/auth/pages/AuthCallbackPage.tsx` | — | Auth callback redirect handler |

### General UI

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| BaseModal | `src/components/BaseModal.tsx` | `_modal-base.scss` | Reusable modal dialog base |
| ConfirmationModal | `src/components/ConfirmationModal.tsx` | `_confirmation-modal.scss` | Confirm/cancel dialog |
| Notification | `src/components/Notification.tsx` | `_notification.scss` | Toast notification |
| NotificationContainer | `src/components/NotificationContainer.tsx` | `_notification.scss` | Notification stack container |
| CookieConsent | `src/components/CookieConsent.tsx` | `_cookie-consent.scss` | Cookie consent banner |
| BuildInfo | `src/components/BuildInfo.tsx` | `_build-info.scss` | Build version info display |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | — | React error boundary fallback |
| UserProfile | `src/components/UserProfile.tsx` | `_user-profile.scss` | User profile dropdown (extends avatar) |
| SpecsPage | `src/components/SpecsPage.tsx` | `_specs-page.scss` | Specifications page |

### UI Primitives

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| Icons | `src/components/ui/Icons.tsx` | `_icons.scss` | SVG icon components |
| Icon | `src/components/ui/Icon.tsx` | `_icons.scss` | Single icon wrapper |
| PlayAllButton | `src/components/ui/PlayAllButton.tsx` | `_button.scss` | Play all audio button (uses Storybook button) |
| MarkerTooltip | `src/components/ui/MarkerTooltip.tsx` | `_marker-tooltip.scss` | Phonetic marker tooltip |
| MarkersGuideBox | `src/components/ui/MarkersGuideBox.tsx` | `_markers-guide-box.scss` | Markers legend/guide |
| PageLoadingState | `src/components/ui/PageLoadingState.tsx` | — | Full-page loading spinner |

### Pages

| Component | File | SCSS | Description |
|-----------|------|------|-------------|
| NotFoundPage | `src/pages/NotFoundPage.tsx` | `_page-content.scss` | 404 error page |
| PrivacyPage | `src/pages/PrivacyPage.tsx` | `_content-page.scss` | Privacy policy page |
| AccessibilityPage | `src/pages/AccessibilityPage.tsx` | `_content-page.scss` | Accessibility statement page |

---

## Base SCSS Components (no dedicated TSX)

These SCSS files define reusable style patterns consumed by multiple components:

| SCSS File | Purpose | Used By |
|-----------|---------|---------|
| `_panel.scss` | Sliding drawer panel base | PronunciationVariants, SentencePhoneticPanel |
| `_paper.scss` | Dropdown/popover surface | AddToTaskDropdown, UserProfile |
| `_stressed-text.scss` | Phonetic stress highlighting | SentencePhoneticPanel, PronunciationVariants |
| `_eki-app.scss` | Global app-level styles | App root |
