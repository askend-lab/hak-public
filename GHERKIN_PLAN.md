# Gherkin Test Plan

## Working Instructions

1. **Branch:** Work in single branch, commit after each US
2. **Communication:** Use `report-progress-v2` to inform, no questions
3. **Problems:** Try 3 times, then commit working state, mark as BLOCKED, move to next task
4. **Progress:** Mark checkboxes as done while working through the plan
5. **TDD:** Write red test first, then implement, then green

---

**Current coverage:** 21/34 User Stories (62%)
**Goal:** 34/34 User Stories (100%)

---

## Phase 1: Core Synthesis Features
*Basic audio synthesis functionality*

### US-002: Auto-play synthesized audio
- [x] ~~DEPRECATED - Merged into US-001~~

### US-006: Select pronunciation variant
- [x] ~~DEPRECATED - Merged into US-005~~

### US-007: Edit phonetic text manually
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Edit mode activation
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Phonetic marker insertion
- [x] 🔴 Write red test: AC-3
- [ ] AC-3: Validation on save ⚠️ BLOCKED - component not integrated
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Re-synthesis with edits
- [ ] 📦 COMMIT: US-007 complete

### US-008: Save phonetic text edits
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Save confirmation
- [x] 🔴 Write red test: AC-2
- [ ] AC-2: Edit persistence ⚠️ BLOCKED - no localStorage persistence
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Reset to original
- [ ] 📦 COMMIT: US-008 complete

### US-014: Edit sentence inline
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Always-editable sentences
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Add words via Space key
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Edit existing words via Backspace
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Automatic cache invalidation on edit
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Phonetic customization
- [ ] 📦 COMMIT: US-014 complete

### US-034: Create custom phonetic variant
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Custom variant input field
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Phonetic marker toolbar
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Custom variant preview (play)
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Custom variant selection
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Phonetic guide access
- [ ] 📦 COMMIT: US-034 complete

## Phase 2: Task Management
*Create and manage tasks*

### US-015: Create new task
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Create task button
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Task creation form
- [x] 🔴 Write red test: AC-3
- [ ] AC-3: Task saved ⚠️ BLOCKED - React controlled input issue in tests
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Required fields validation
- [ ] 📦 COMMIT: US-015 complete

### US-016: View task list
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Tasks page navigation
- [x] 🔴 Write red test: AC-2
- [ ] AC-2: Task card information ⚠️ BLOCKED - needs SimpleStore seeding
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Empty state
- [x] 🔴 Write red test: AC-4
- [ ] AC-4: Task sorting ⚠️ BLOCKED - needs SimpleStore seeding
- [ ] 📦 COMMIT: US-016 complete

### US-017: View task details
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Task detail navigation
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Task information display
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Entries list display
- [x] 🔴 Write red test: AC-4
- [ ] AC-4: Play all entries option ⚠️ BLOCKED - needs task detail route
- [ ] 📦 COMMIT: US-017 complete

### US-018: Edit task metadata
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Edit button display
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Edit form display
- [x] 🔴 Write red test: AC-3
- [ ] AC-3: Save changes ⚠️ BLOCKED - needs task detail route
- [x] 🔴 Write red test: AC-4
- [ ] AC-4: Cancel editing ⚠️ BLOCKED
- [x] 🔴 Write red test: AC-5
- [ ] AC-5: Validation ⚠️ BLOCKED
- [ ] 📦 COMMIT: US-018 complete

### US-019: Delete task
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Delete button display
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Confirmation dialog
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Confirm deletion
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Cancel deletion
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Redirect after deletion
- [ ] 📦 COMMIT: US-019 complete

### US-020: Add synthesis entries to task
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Add to task button display
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Task selection dialog
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Add to existing task
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Create new task option
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Success notification
- [ ] 📦 COMMIT: US-020 complete

### US-021: Add playlist entries to task
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Add playlist to task button
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Task selection dialog
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Add all entries to task
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Preserve entry order
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Success notification
- [ ] 📦 COMMIT: US-021 complete

### US-033: Baseline tasks access
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Baseline tasks visible to all users
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Baseline tasks marked distinctly
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Can play baseline task entries
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Can add entries to baseline tasks
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Can hide baseline tasks
- [x] 🔴 Write red test: AC-6
- [x] AC-6: Cannot edit baseline task metadata
- [x] 🔴 Write red test: AC-7
- [x] AC-7: Can copy baseline tasks
- [x] 🔴 Write red test: AC-8
- [x] AC-8: Baseline tasks persist across sessions
- [ ] 📦 COMMIT: US-033 complete

## Phase 3: Sharing
*Publish and access features*

### US-022: Generate shareable link for task
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Share button display
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Generate unique link
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Display share link
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Copy link to clipboard
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Link persistence
- [ ] 📦 COMMIT: US-022 complete

### US-023: Access shared task via link
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Open shared link
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Read-only view
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Play audio entries
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Copy to my tasks
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Access without authentication
- [ ] 📦 COMMIT: US-023 complete

### US-032: Copy shared task entries to playlist
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Copy button visible on shared tasks
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Copy works without authentication
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Login prompt if trying to save
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Pending action executes after login
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Entries appear in synthesis view
- [x] 🔴 Write red test: AC-6
- [x] AC-6: Success notification shown
- [x] 🔴 Write red test: AC-7
- [x] AC-7: Can save copied entries to own tasks
- [x] 🔴 Write red test: AC-8
- [x] AC-8: Audio preserved in copied entries
- [ ] 📦 COMMIT: US-032 complete

## Phase 4: Auth & Profile
*Additional auth features*

### US-026: View user profile
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Profile access
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Profile information display
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Task statistics
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Recent activity
- [ ] 📦 COMMIT: US-026 complete

### US-028: Redirect to login for protected features
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Protected route access attempt
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Informative message
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Return to intended page
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Disabled protected actions
- [ ] 📦 COMMIT: US-028 complete

## Phase 5: Infrastructure & UX
*Technical and UX improvements*

### US-030: Display and dismiss notifications
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Notification display
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Notification types (success/error)
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Notification content (colors)
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Dismiss notification
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Auto-dismiss
- [x] 🔴 Write red test: AC-6
- [x] AC-6: Multiple notifications
- [ ] 📦 COMMIT: US-030 complete

### US-031: Audio performance optimization (caching)
- [x] 🔴 Write red test: AC-1
- [x] AC-1: Audio generated once per unique text
- [x] 🔴 Write red test: AC-2
- [x] AC-2: Cache validation on text change
- [x] 🔴 Write red test: AC-3
- [x] AC-3: Cache stores phonetic text
- [x] 🔴 Write red test: AC-4
- [x] AC-4: Automatic retry on cache corruption
- [x] 🔴 Write red test: AC-5
- [x] AC-5: Memory cleanup on unmount
- [x] 🔴 Write red test: AC-6
- [x] AC-6: Cache used for download
- [ ] 📦 COMMIT: US-031 complete

---

## Already Written (13 User Stories) ✅

- [x] US-001: Enter and synthesize text
- [x] US-003: Download audio
- [x] US-004: View stressed text
- [x] US-005: View pronunciation variants
- [x] US-009: Add to playlist
- [x] US-010: Play playlist entry
- [x] US-011: Play all entries
- [x] US-012: Delete playlist entry
- [x] US-013: Reorder playlist
- [x] US-024: View phonetic guide
- [x] US-025: Login via eID
- [x] US-027: Logout
- [x] US-029: Submit feedback
