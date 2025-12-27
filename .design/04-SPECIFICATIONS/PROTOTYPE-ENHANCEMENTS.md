# Prototype Enhancement Features

**Source:** EKI2 Prototype Analysis  
**Date:** 2025-11-15  
**Status:** Implemented in Prototype

---

## Overview

This document captures additional features and implementation details discovered in the working EKI2 prototype that enhance or extend the original specifications. These features should be incorporated into the production specifications.

---

## Additional Features Found in Prototype

### 1. Advanced Audio Playback Controls

**Feature:** Variable playback speed control

**Implementation Details:**
- Speed options: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x
- Persists with audio player component
- Applies to both individual audio and playlist playback

**User Story Reference:** Extends US-002 (Auto-play audio)

**New Acceptance Criteria:**
- AC-NEW-1: User can select playback speed from dropdown
- AC-NEW-2: Selected speed persists during session
- AC-NEW-3: Speed indicator shows current playback rate
- AC-NEW-4: Speed changes apply immediately to playing audio

---

### 2. Phonetic Editing Toolbar

**Feature:** Symbol insertion toolbar for phonetic editing

**Implementation Details:**
- Quick-access buttons for common markers: ` (3rd degree), ´ (stress), ' (palatalization), + (word boundary)
- Inserts symbol at cursor position
- Maintains cursor position after insertion
- Integrated with edit mode in StressedTextDisplay

**User Story Reference:** Extends US-007 (Edit phonetic markers manually)

**New Acceptance Criteria:**
- AC-NEW-1: Toolbar displays when edit mode is activated
- AC-NEW-2: Each marker button shows tooltip with explanation
- AC-NEW-3: Clicking marker inserts it at cursor position
- AC-NEW-4: Cursor repositions after marker insertion
- AC-NEW-5: Link to full phonetic guide available

**Technical Implementation:**
```typescript
// Component: StressedTextDisplay
// Toolbar with symbol buttons
<button onClick={() => insertSymbol('`')} title="Kolmas välde">`</button>
<button onClick={() => insertSymbol('´')} title="Rõhuline silp">´</button>
<button onClick={() => insertSymbol("'")} title="Palatalisatsioon">'</button>
<button onClick={() => insertSymbol('+')} title="Liitsõna piir">+</button>
```

---

### 3. Drag-and-Drop Playlist Reordering

**Feature:** @dnd-kit based drag-and-drop for playlist items

**Implementation Details:**
- Uses `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Visual feedback during drag (opacity change, drop indicators)
- Keyboard navigation support (arrow keys + space)
- Touch device compatible

**User Story Reference:** US-013 (Reorder playlist entries)

**Enhanced Acceptance Criteria:**
- AC-1: Drag handle visible on hover
- AC-2: Item becomes semi-transparent during drag
- AC-3: Drop zones highlight when dragging over
- AC-4: Reorder persists immediately
- AC-5: Keyboard accessible (arrow keys + space to grab/drop)
- AC-6: Touch gestures supported on mobile devices

**Technical Dependencies:**
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

---

### 4. Audio Caching System

**Feature:** Client-side audio caching with cache invalidation

**Implementation Details:**
- Caches generated audio as blob URLs in component state
- Stores alongside phonetic text for validation
- Automatic cache invalidation when text changes
- Retry mechanism for corrupted cache
- URL cleanup on component unmount

**User Story Reference:** Implicit performance optimization

**New User Story:** US-031 - Audio Performance Optimization

**As a** language learner  
**I want** synthesized audio to load quickly when revisiting the same text  
**So that** I can practice efficiently without waiting for re-synthesis

**Acceptance Criteria:**
- AC-1: Audio generated once per unique text
- AC-2: Cached audio plays immediately (<100ms)
- AC-3: Cache invalidates when text is modified
- AC-4: Corrupted cache detected and regenerated automatically
- AC-5: Memory cleaned up when audio no longer needed

**Technical Implementation:**
```typescript
interface SentenceState {
  text: string;
  phoneticText?: string; // Cached phonetic form
  audioUrl?: string;     // Cached audio blob URL
  // ... other properties
}

// Cache validation
if (sentence.audioUrl && sentence.phoneticText && sentence.text === text) {
  // Use cache
} else {
  // Regenerate
}
```

---

### 5. Smart Voice Model Selection

**Feature:** Automatic voice model selection based on input length

**Implementation Details:**
- Single words → `efm_s` (short model, optimized for words)
- Multiple words → `efm_l` (long model, optimized for sentences)
- Automatic detection by word count
- No user configuration required

**User Story Reference:** Extends US-001 (Enter and synthesize text)

**New Acceptance Criteria:**
- AC-NEW-1: System detects word count automatically
- AC-NEW-2: Single words use efm_s voice model
- AC-NEW-3: Sentences use efm_l voice model
- AC-NEW-4: Model selection is transparent to user
- AC-NEW-5: Model choice optimizes audio quality

**Technical Implementation:**
```typescript
function getVoiceModel(text: string): 'efm_s' | 'efm_l' {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length === 1 ? 'efm_s' : 'efm_l';
}
```

---

### 6. Batch Playlist Operations

**Feature:** Add entire playlist to task with one action

**Implementation Details:**
- "Lisa ülesandesse (N)" button on playlist header
- Shows entry count in button label
- Modal allows creating new task or adding to existing
- Preserves entry order when adding to task

**User Story Reference:** Extends US-021 (Add playlist entries to task)

**Enhanced Acceptance Criteria:**
- AC-NEW-1: Button displays current entry count
- AC-NEW-2: Disabled when playlist is empty
- AC-NEW-3: Modal shows preview of entries to be added
- AC-NEW-4: Entry order preserved in task
- AC-NEW-5: Success notification shows count added

---

### 7. Copy from Shared Task

**Feature:** Copy entries from shared task to personal playlist

**Implementation Details:**
- Available on shared task view (unauthenticated access)
- Prompts login if not authenticated
- Stores pending action in localStorage during login
- Executes copy after successful authentication
- Adds entries to synthesis view playlist

**New User Story:** US-032 - Copy Shared Task Entries

**As a** language learner  
**I want** to copy entries from a shared task to my own playlist  
**So that** I can practice with teacher-created materials

**Acceptance Criteria:**
- AC-1: "Kopeeri kõnevooru" button visible on shared tasks
- AC-2: Works without authentication (copies to temp playlist)
- AC-3: If not authenticated, prompts login before copying
- AC-4: Pending copy executes after successful login
- AC-5: Entries appear in synthesis view playlist
- AC-6: Success notification confirms copy
- AC-7: Can then save copied entries to own tasks

---

### 8. Empty State Designs

**Feature:** Contextual empty states with illustrations and CTAs

**Implementation Details:**
- Playlist empty state: icon + message + guidance
- Tasks empty state: "Create first task" CTA
- Task detail empty state: "Add first entry" CTA
- Consistent visual language across empty states

**User Story Reference:** UX enhancement across multiple features

**Design Patterns:**
```typescript
<div className="empty-state">
  <div className="empty-icon">
    <svg>...</svg>  // Contextual icon
  </div>
  <h4 className="empty-title">Descriptive title</h4>
  <p className="empty-description">Helpful guidance text</p>
  <button className="empty-cta">Primary action</button>
</div>
```

---

### 9. Confirmation Dialogs

**Feature:** Confirmation modals for destructive actions

**Implementation Details:**
- Generic ConfirmDialog component
- Used for task deletion
- Shows affected item name
- Clear confirm/cancel options
- Prevents accidental deletions

**User Story Reference:** Extends US-019 (Delete task)

**Enhanced Acceptance Criteria:**
- AC-NEW-1: Confirmation shows task name to be deleted
- AC-NEW-2: Danger button styled distinctly (red)
- AC-NEW-3: Cancel button dismisses without action
- AC-NEW-4: Esc key dismisses dialog
- AC-NEW-5: Click outside dialog cancels action

---

### 10. Play All with Stop Control

**Feature:** Sequential playlist playback with stop/pause control

**Implementation Details:**
- AbortController pattern for stop functionality
- Visual feedback: button shows "Peata" when playing
- Stops all playback when clicked during play
- Cleans up audio resources properly

**User Story Reference:** Extends US-011 (Play all playlist entries sequentially)

**Enhanced Acceptance Criteria:**
- AC-NEW-1: Button toggles between "Kuula kõik" and "Peata"
- AC-NEW-2: Clicking during playback stops immediately
- AC-NEW-3: Currently playing item highlighted
- AC-NEW-4: Playback stops if user navigates away
- AC-NEW-5: Audio resources released after stop

**Technical Implementation:**
```typescript
const [playAllAbortController, setPlayAllAbortController] = useState<AbortController | null>(null);

const handlePlayAll = async () => {
  if (isPlayingAll) {
    playAllAbortController?.abort(); // Stop
    return;
  }
  
  const abortController = new AbortController();
  setPlayAllAbortController(abortController);
  
  for (const sentence of sentences) {
    if (abortController.signal.aborted) break;
    await playSingleSentence(sentence.id, abortController.signal);
  }
};
```

---

### 11. Phonetic Marker Transformation

**Feature:** User-friendly marker display and editing

**Implementation Details:**
- Vabamorf output uses: `<`, `?`, `]`, `_`, `~`, `+`
- UI transforms to readable versions:
  - `<` → `` ` `` (backtick for 3rd degree)
  - `?` → `´` (acute for stress)
  - `]` → `'` (apostrophe for palatalization)
  - `_` → `+` (plus for word boundary)
- Bidirectional transformation (UI ↔ Vabamorf)
- Utility functions: `transformToUI()`, `transformToVabamorf()`

**User Story Reference:** Extends US-005 (Edit phonetic markers manually)

**Technical Implementation:**
```typescript
// utils/phoneticMarkers.ts
export function transformToUI(vabamorfText: string): string {
  return vabamorfText
    .replace(/</g, '`')
    .replace(/\?/g, '´')
    .replace(/\]/g, "'")
    .replace(/_/g, '+');
}

export function transformToVabamorf(uiText: string): string {
  return uiText
    .replace(/`/g, '<')
    .replace(/´/g, '?')
    .replace(/'/g, ']')
    .replace(/\+/g, '_');
}
```

---

### 12. localStorage Persistence Architecture

**Feature:** User-scoped data persistence

**Implementation Details:**
- Keys scoped by userId: `eki_user_tasks_{userId}`
- Separate storage for baseline tasks and user tasks
- Deleted tasks tracking: `eki_deleted_tasks_{userId}`
- Baseline task additions: `eki_baseline_additions_{userId}`
- Pending actions stored during authentication flow
- Playlist entries: `eki_playlist_entries`

**Storage Schema:**
```
eki_user                           // Current authenticated user
eki_user_tasks_{userId}            // User-created tasks (JSON array)
eki_deleted_tasks_{userId}         // Deleted baseline task IDs
eki_baseline_additions_{userId}    // Extra entries added to baseline tasks
eki_playlist_entries               // Temporary playlist from copy action
eki_edit_entry                     // Entry being edited
eki_pending_action                 // Action to execute after login
eki_pending_playlist               // Playlist to restore after login
```

---

### 13. Baseline Tasks System

**Feature:** Pre-loaded shared tasks for all users

**Implementation Details:**
- Tasks loaded from `public/mock-tasks.json`
- Available to all users with their userId
- Can be viewed, played, and entries added
- Can be "deleted" (hidden via tracking)
- Cannot modify task metadata
- Useful for demo and onboarding

**New User Story:** US-033 - Baseline Tasks Access

**As a** new user  
**I want** to see example tasks when I first log in  
**So that** I understand how to use the application

**Acceptance Criteria:**
- AC-1: Baseline tasks visible to all authenticated users
- AC-2: Baseline tasks marked distinctly (e.g., "Näidis" tag)
- AC-3: Can play and listen to baseline task entries
- AC-4: Can add entries to baseline tasks
- AC-5: Can hide baseline tasks (soft delete)
- AC-6: Cannot edit baseline task name/description
- AC-7: Can copy baseline tasks to create own versions

---

### 14. Retry Mechanism for Audio Playback

**Feature:** Automatic retry on audio playback failure

**Implementation Details:**
- Detects audio playback errors
- Invalidates cached audio on error
- Retries synthesis once automatically
- Prevents infinite retry loops (max 1 retry)
- User-transparent recovery

**Technical Implementation:**
```typescript
audio.onerror = () => {
  if (retryCount === 0 && sentence.audioUrl) {
    // Invalidate cache and retry once
    setSentences(prev =>
      prev.map(s => s.id === id 
        ? { ...s, audioUrl: undefined, phoneticText: undefined } 
        : s
      )
    );
    setTimeout(async () => {
      await playSingleSentence(id, abortSignal, 1);
    }, 100);
  } else {
    // Give up after retry
    console.error('Audio playback failed after retry');
  }
};
```

---

### 15. Context-Based Architecture

**Feature:** React Context for cross-cutting concerns

**Implementation Details:**
- **AuthContext:** User authentication state
  - User object
  - Login/logout functions
  - showLoginModal state
  - isAuthenticated computed property
- **NotificationContext:** Toast notifications
  - showNotification(type, message, duration)
  - Auto-dismiss after duration
  - Queue management for multiple notifications

**Technical Dependencies:**
```tsx
// contexts/AuthContext.tsx
<AuthProvider>
  {children}
</AuthProvider>

// contexts/NotificationContext.tsx
<NotificationProvider>
  {children}
</NotificationProvider>
```

---

## Component Library (22 Components)

### Core Components
1. **TextInput** - Main text entry with keyboard shortcuts
2. **AudioPlayer** - Playback controls with speed adjustment
3. **StressedTextDisplay** - Phonetic text with edit mode
4. **PronunciationVariants** - Variant selection modal

### Playlist Components
5. **Playlist** - Container with drag-drop support
6. **PlaylistItem** - Individual entry with controls
7. **PlaylistAudioPlayer** - Audio controls for playlist

### Task Management
8. **TaskManager** - Task list view
9. **TaskDetailView** - Single task with entries
10. **TaskCreationModal** - Create/add to task modal
11. **TaskEditModal** - Edit task metadata
12. **ShareTaskModal** - Share link generation
13. **AddEntryModal** - Add entry to existing task

### Authentication
14. **LoginModal** - eID authentication interface
15. **UserProfile** - User dropdown menu

### Modals & Dialogs
16. **FeedbackModal** - Feedback submission
17. **PhoneticGuideModal** - Phonetic markers reference
18. **ConfirmDialog** - Generic confirmation
19. **ConfirmationModal** - Specific confirmation variant

### System Components
20. **Notification** - Single toast notification
21. **NotificationContainer** - Notification manager
22. **Footer** - Application footer

---

## Technical Stack Additions

### Dependencies (from package.json)

**Drag and Drop:**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Development Tools:**
```json
{
  "vitest": "^2.x",
  "storybook": "^8.x",
  "@storybook/react": "^8.x"
}
```

**Styling:**
- SCSS modules for component styles
- EKI Design System tokens
- Tailwind CSS (configured but secondary)

---

## Design Patterns Implemented

### 1. Optimistic UI Updates
- Immediate UI feedback before API completion
- Rollback on error
- Loading states during async operations

### 2. Keyboard Shortcuts
- Ctrl+Enter: Submit synthesis
- Enter: Add word and synthesize
- Space: Add word as tag
- Backspace: Remove last tag
- Esc: Close modals

### 3. Progressive Enhancement
- Works without authentication (limited features)
- localStorage fallback for persistence
- Graceful degradation on API failures

### 4. Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast visuals
- Touch-friendly targets (44px min)

---

## Performance Optimizations

1. **Audio Caching:** Reduces redundant synthesis
2. **Lazy Modal Loading:** Modals render only when opened
3. **Debounced Actions:** Prevents rapid-fire API calls
4. **Memoized Components:** Reduces unnecessary re-renders
5. **AbortController:** Cancels in-flight requests on unmount

---

## Error Handling Patterns

### 1. API Errors
- Retry mechanism for transient failures
- User-friendly error messages
- Fallback to cached data when available

### 2. Validation
- Client-side validation before API calls
- Isikukood checksum validation
- Empty input prevention
- Max length checks

### 3. Recovery
- Clear corrupted localStorage
- Reset to initial state option
- Graceful fallback on missing data

---

## Next Steps for Production

### High Priority
1. Integrate real eID authentication service
2. Implement backend persistence (replace localStorage)
3. Add email service for feedback
4. Deploy pronunciation variants API
5. Add analytics and usage tracking

### Medium Priority
6. Internationalization (support other UI languages)
7. Advanced audio controls (pitch adjustment)
8. Export tasks as downloadable files
9. Import tasks from files
10. Collaborative task editing

### Low Priority
11. Dark mode theme
12. Custom voice model selection
13. Advanced phonetic analysis tools
14. Integration with external learning platforms

---

**Document Status:** Complete  
**Last Updated:** 2025-11-15  
**Reviewed By:** Development Team
