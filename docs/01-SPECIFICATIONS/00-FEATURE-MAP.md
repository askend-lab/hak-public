# Feature Map - EKI Hääldusabiline

**Version:** 2.0 (Fresh from Prototype)  
**Last Updated:** 2026-01-08

## Overview

This document provides a complete inventory of features implemented in the EKI Hääldusabiline (Pronunciation Helper) prototype. Each feature links to its user stories and test cases.

---

## F01: Speech Synthesis (Kõnesüntees)

**Description:** User inputs Estonian text and receives synthesized audio with correct pronunciation. The system uses Vabamorf for morphological analysis and Merlin TTS for speech synthesis.

**Components:** `app/page.tsx`, `/api/analyze`, `/api/synthesize`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-01](01-USER-STORIES/F01-speech-synthesis/US-01-text-input.md) | Enter text with tag-based input | Critical |
| [US-02](01-USER-STORIES/F01-speech-synthesis/US-02-synthesize-audio.md) | Synthesize and play audio | Critical |
| [US-03](01-USER-STORIES/F01-speech-synthesis/US-03-playback-control.md) | Control audio playback | Critical |
| [US-04](01-USER-STORIES/F01-speech-synthesis/US-04-download-audio.md) | Download audio as WAV | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-01](02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md) | Basic synthesis flow | Happy Path |
| [TC-02](02-TEST-CASES/F01-speech-synthesis/TC-02-input-behaviors.md) | Input behaviors | Functional |
| [TC-03](02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md) | Audio playback states | Functional |
| [TC-04](02-TEST-CASES/F01-speech-synthesis/TC-04-caching.md) | Audio caching | Functional |
| [TC-05](02-TEST-CASES/F01-speech-synthesis/TC-05-edge-cases.md) | Edge cases | Edge Case |

---

## F02: Pronunciation Variants (Häälduse variandid)

**Description:** Users can click on words to view alternative pronunciation variants, preview each variant's audio, select a variant to apply, or create custom phonetic variants.

**Components:** `PronunciationVariants.tsx`, `/api/variants`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-05](01-USER-STORIES/F02-pronunciation-variants/US-05-view-variants.md) | View pronunciation variants | Critical |
| [US-06](01-USER-STORIES/F02-pronunciation-variants/US-06-preview-variant.md) | Preview variant audio | Critical |
| [US-07](01-USER-STORIES/F02-pronunciation-variants/US-07-select-variant.md) | Select and apply variant | Critical |
| [US-08](01-USER-STORIES/F02-pronunciation-variants/US-08-custom-variant.md) | Create custom phonetic variant | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-06](02-TEST-CASES/F02-pronunciation-variants/TC-06-view-variants.md) | View variants panel | Happy Path |
| [TC-07](02-TEST-CASES/F02-pronunciation-variants/TC-07-preview-select.md) | Preview and select variant | Functional |
| [TC-08](02-TEST-CASES/F02-pronunciation-variants/TC-08-custom-variant.md) | Custom variant creation | Functional |

---

## F03: Sentence Phonetic Panel (Lause foneetiline kuju)

**Description:** Users can explore and directly edit the phonetic form of an entire sentence, using phonetic markers to fine-tune pronunciation.

**Components:** `SentencePhoneticPanel.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-09](01-USER-STORIES/F03-sentence-phonetic/US-09-view-phonetic.md) | View sentence phonetic form | High |
| [US-10](01-USER-STORIES/F03-sentence-phonetic/US-10-edit-phonetic.md) | Edit phonetic markers | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-09](02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md) | Phonetic panel operations | Functional |

---

## F04: Playlist Management (Esitusloend)

**Description:** Users can create and manage multiple sentences as a playlist, reorder them via drag-and-drop, and play all sequentially.

**Components:** `app/page.tsx` (sentences state), `SentenceSynthesisItem.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-11](01-USER-STORIES/F04-playlist/US-11-add-sentences.md) | Add multiple sentences | High |
| [US-12](01-USER-STORIES/F04-playlist/US-12-reorder-sentences.md) | Reorder sentences | High |
| [US-13](01-USER-STORIES/F04-playlist/US-13-play-all.md) | Play all sequentially | High |
| [US-14](01-USER-STORIES/F04-playlist/US-14-manage-sentences.md) | Manage sentences (duplicate, delete, clear) | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-10](02-TEST-CASES/F04-playlist/TC-10-playlist-management.md) | Playlist operations | Functional |
| [TC-11](02-TEST-CASES/F04-playlist/TC-11-play-all.md) | Sequential playback | Functional |

---

## F05: Task Management (Ülesannete haldamine)

**Description:** Authenticated users can create, view, edit, and delete tasks containing speech synthesis entries. Tasks persist in localStorage.

**Components:** `TaskManager.tsx`, `TaskDetailView.tsx`, `TaskCreationModal.tsx`, `TaskEditModal.tsx`, `DataService.ts`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-15](01-USER-STORIES/F05-task-management/US-15-create-task.md) | Create new task | Critical |
| [US-16](01-USER-STORIES/F05-task-management/US-16-view-tasks.md) | View task list | Critical |
| [US-17](01-USER-STORIES/F05-task-management/US-17-edit-task.md) | Edit task metadata | High |
| [US-18](01-USER-STORIES/F05-task-management/US-18-delete-task.md) | Delete task | High |
| [US-19](01-USER-STORIES/F05-task-management/US-19-add-to-task.md) | Add sentences to task | Critical |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-12](02-TEST-CASES/F05-task-management/TC-12-create-task.md) | Create task | Happy Path |
| [TC-13](02-TEST-CASES/F05-task-management/TC-13-task-crud.md) | Task CRUD operations | Functional |
| [TC-14](02-TEST-CASES/F05-task-management/TC-14-add-entries.md) | Add entries to task | Functional |

---

## F06: Task Sharing (Ülesande jagamine)

**Description:** Users can share tasks via unique links. Recipients can view shared tasks read-only and copy entries to their playlist.

**Components:** `ShareTaskModal.tsx`, `DataService.ts`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-20](01-USER-STORIES/F06-task-sharing/US-20-share-task.md) | Generate shareable link | High |
| [US-21](01-USER-STORIES/F06-task-sharing/US-21-access-shared.md) | Access shared task | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-15](02-TEST-CASES/F06-task-sharing/TC-15-share-task.md) | Share and access task | Functional |

---

## F07: Authentication (Autentimine)

**Description:** User authentication via Estonian eID (isikukood). Supports Smart-ID, Mobiil-ID, and ID-kaart authentication methods.

**Components:** `LoginModal.tsx`, `AuthContext.tsx`, `UserProfile.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-22](01-USER-STORIES/F07-authentication/US-22-login.md) | Login with eID | Critical |
| [US-23](01-USER-STORIES/F07-authentication/US-23-profile.md) | View user profile | Medium |
| [US-24](01-USER-STORIES/F07-authentication/US-24-logout.md) | Logout | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-16](02-TEST-CASES/F07-authentication/TC-16-authentication.md) | Authentication flow | Functional |

---

## F08: Onboarding (Tutvustus)

**Description:** First-time users select their role (learner, teacher, specialist) and receive guided onboarding with tooltips.

**Components:** `RoleSelectionPage.tsx`, `OnboardingWizard.tsx`, `OnboardingContext.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-25](01-USER-STORIES/F08-onboarding/US-25-role-selection.md) | Select user role | High |
| [US-26](01-USER-STORIES/F08-onboarding/US-26-wizard.md) | Complete onboarding wizard | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-17](02-TEST-CASES/F08-onboarding/TC-17-onboarding.md) | Onboarding flow | Functional |

---

## F09: Feedback (Tagasiside)

**Description:** Users can submit feedback about the application through a modal form in the footer.

**Components:** `FeedbackModal.tsx`, `Footer.tsx`, `/api/feedback`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-27](01-USER-STORIES/F09-feedback/US-27-submit-feedback.md) | Submit feedback | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-18](02-TEST-CASES/F09-feedback/TC-18-feedback.md) | Feedback submission | Functional |

---

## F10: Notifications (Teated)

**Description:** Global notification system displaying success, error, info, and warning messages with auto-dismiss and optional action buttons.

**Components:** `NotificationContext.tsx`, `NotificationContainer.tsx`, `Notification.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-28](01-USER-STORIES/F10-notifications/US-28-notifications.md) | Display and dismiss notifications | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-19](02-TEST-CASES/F10-notifications/TC-19-notifications.md) | Notification display | Functional |

---

## User Journeys

End-to-end workflows that span multiple features:

| ID | Title | Description |
|----|-------|-------------|
| [UJ-01](03-USER-JOURNEYS/UJ-01-teacher-workflow.md) | Teacher Workflow | Create task, add sentences, share with students |
| [UJ-02](03-USER-JOURNEYS/UJ-02-learner-workflow.md) | Learner Workflow | Enter text, explore variants, practice pronunciation |
| [UJ-03](03-USER-JOURNEYS/UJ-03-shared-task-flow.md) | Shared Task Flow | Access shared task, copy to playlist, practice |

---

## Test Data

| Document | Description |
|----------|-------------|
| [Estonian Phrases](04-TEST-DATA/estonian-phrases.md) | Curated test phrases for synthesis testing |

---

## Summary

| Category | Count |
|----------|-------|
| Features | 10 |
| User Stories | 28 |
| Test Cases | 19 |
| User Journeys | 3 |
