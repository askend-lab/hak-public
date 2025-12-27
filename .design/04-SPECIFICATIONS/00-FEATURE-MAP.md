# Feature Map - EKI Pronunciation Learning Platform

**Status:** ✅ All features implemented in prototype  
**Last Updated:** 2025-11-17

## Features

[x] ### F-001: Speech Synthesis (Kõnesüntees) ✅ **IMPLEMENTED**
    User inputs Estonian text and receives synthesized audio with correct pronunciation. System automatically adds stress markers and generates natural-sounding speech. Uses Vabamorf for analysis and Merlin TTS for synthesis.

[x] [US-001: Enter and synthesize text](01-USER-STORIES/US-001-enter-synthesize-text.md) ✅

[x] [US-002: Auto-play synthesized audio](01-USER-STORIES/US-002-autoplay-audio.md) ✅

[x] [US-003: Download synthesized audio](01-USER-STORIES/US-003-download-audio.md) ✅

---

[x] ### F-002: Stressed Text Display (Rõhutatud teksti kuvamine) ✅ **IMPLEMENTED**
    Display phonetic transcription with stress markers. Phonetic markers: `` ` `` (3rd pitch accent), `´` (stress), `'` (palatalization), `+` (compound boundary). Fully editable with toolbar support.

[x] [US-004: View stressed text with phonetic markers](01-USER-STORIES/US-004-view-stressed-text.md) ✅

[x] [US-005: Edit phonetic markers manually](01-USER-STORIES/US-005-edit-phonetic-markers.md) ✅

---

[x] ### F-003: Pronunciation Variants (Häälduse variandid) ✅ **IMPLEMENTED**
    Users select individual words to see alternative pronunciation variants in modal dialog. They can choose different stress patterns and hear how each variant sounds, then apply to synthesis.

[x] [US-006: Select word and view pronunciation variants](01-USER-STORIES/US-006-select-word-variants.md) ✅

[x] [US-007: Choose variant and replace in text](01-USER-STORIES/US-007-choose-variant.md) ✅

[x] [US-008: Synthesize and play modified pronunciation](01-USER-STORIES/US-008-play-modified-pronunciation.md) ✅

---

[x] ### F-004: Playlist Management (Esitusloendi haldamine) ✅ **IMPLEMENTED**
    Users create and manage playlists of synthesized speech entries. Full support for add, delete, reorder (drag-and-drop with @dnd-kit), edit entries, and sequential playback.

[x] [US-009: Add entry to playlist](01-USER-STORIES/US-009-add-to-playlist.md) ✅

[x] [US-010: Play individual playlist entry](01-USER-STORIES/US-010-play-playlist-entry.md) ✅

[x] [US-011: Play all playlist entries sequentially](01-USER-STORIES/US-011-play-all-entries.md) ✅

[x] [US-012: Delete entry from playlist](01-USER-STORIES/US-012-delete-playlist-entry.md) ✅

[x] [US-013: Reorder playlist entries](01-USER-STORIES/US-013-reorder-playlist.md) ✅

[x] [US-014: Edit playlist entry](01-USER-STORIES/US-014-edit-playlist-entry.md) ✅

---

[x] ### F-005: Task Management (Ülesannete haldamine) ✅ **IMPLEMENTED**
    Authenticated users create, edit, delete, and view tasks containing speech sequences. Tasks persist in localStorage, support multiple entries, drag-reorder, metadata editing, and confirmation dialogs.

[x] [US-015: Create new task](01-USER-STORIES/US-015-create-task.md) ✅

[x] [US-016: View list of all tasks](01-USER-STORIES/US-016-view-task-list.md) ✅

[x] [US-017: View task details with entries](01-USER-STORIES/US-017-view-task-details.md) ✅

[x] [US-018: Edit task metadata](01-USER-STORIES/US-018-edit-task.md) ✅

[x] [US-019: Delete task](01-USER-STORIES/US-019-delete-task.md) ✅

[x] [US-020: Add synthesis entries to task](01-USER-STORIES/US-020-add-synthesis-to-task.md) ✅

[x] [US-021: Add playlist entries to task](01-USER-STORIES/US-021-add-playlist-to-task.md) ✅

---

[x] ### F-006: Task Sharing (Ülesande jagamine) ✅ **IMPLEMENTED**
    Users share tasks via unique links with share tokens. Read-only access for unauthenticated users, copy-to-playlist functionality, ShareTaskModal with clipboard support.

[x] [US-022: Generate shareable link for task](01-USER-STORIES/US-022-generate-share-link.md) ✅

[x] [US-023: Access shared task via link](01-USER-STORIES/US-023-access-shared-task.md) ✅

---

[x] ### F-007: Phonetic Guide (Foneetilise juhendi kuvamine) ✅ **IMPLEMENTED**
    Display help modal explaining phonetic markers and symbols. PhoneticGuideModal component with comprehensive reference guide.

[x] [US-024: View phonetic symbols reference guide](01-USER-STORIES/US-024-view-phonetic-guide.md) ✅

---

[x] ### F-008: Authentication (Autentimine) ✅ **IMPLEMENTED**
    User authentication via Estonian eID (isikukood). LoginModal with Smart-ID/Mobiil-ID/ID-kaart tabs, validation, mock user database, localStorage persistence, UserProfile component, AuthContext.

[x] [US-025: Login with eID](01-USER-STORIES/US-025-login-eid.md) ✅

[x] [US-026: View user profile](01-USER-STORIES/US-026-view-profile.md) ✅

[x] [US-027: Logout from system](01-USER-STORIES/US-027-logout.md) ✅

[x] [US-028: Redirect to login for protected features](01-USER-STORIES/US-028-auth-redirect.md) ✅

---

[x] ### F-009: Feedback System (Tagasiside süsteem) ✅ **IMPLEMENTED**
    Users submit feedback through FeedbackModal with message textarea and email input. Currently simulated (no backend email service).

[x] [US-029: Submit feedback](01-USER-STORIES/US-029-submit-feedback.md) ✅

---

[x] ### F-010: Notifications (Teadete süsteem) ✅ **IMPLEMENTED**
    Global notification system via NotificationContext. Toast-style notifications with success/error/info/warning types, auto-dismiss, NotificationContainer component.

[x] [US-030: Display and dismiss notifications](01-USER-STORIES/US-030-notifications.md) ✅

