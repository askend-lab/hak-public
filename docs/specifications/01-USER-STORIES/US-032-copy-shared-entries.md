# US-032: Copy shared task entries to playlist

**Feature:** F-006  
**Status:** [✅] Implemented in Prototype  
**Priority:** High

## User Story

As a **language learner**  
I want to **copy entries from a shared task to my own playlist**  
So that **I can practice with teacher-created materials and save them to my own tasks**

## User Story

**Context:** When a teacher shares a task link, students need to access the content and optionally copy it to their personal collection for further practice.

## Acceptance Criteria

[✅] **AC-1:** Copy button visible on shared tasks  
GIVEN I am viewing a shared task via link  
WHEN the task detail page loads  
THEN I see a "Kopeeri kõnevooru" (Copy to Playlist) button  
_Verified by:_ Prototype - TaskDetailView shows copy button

[✅] **AC-2:** Copy works without authentication  
GIVEN I am not logged in  
WHEN I click "Kopeeri kõnevooru"  
THEN entries are copied to a temporary playlist in synthesis view  
_Verified by:_ Prototype - stores in localStorage eki_playlist_entries

[✅] **AC-3:** Login prompt if trying to save  
GIVEN I have copied entries to playlist (unauthenticated)  
WHEN I try to save playlist to task  
THEN login modal appears  
_Verified by:_ Prototype - showLoginModal triggered

[✅] **AC-4:** Pending action executes after login  
GIVEN I initiated copy while unauthenticated  
WHEN I successfully log in  
THEN the copy action completes automatically  
_Verified by:_ Prototype - pending action storage and execution

[✅] **AC-5:** Entries appear in synthesis view  
GIVEN I have copied entries from shared task  
WHEN I navigate to synthesis view  
THEN all copied entries appear in the playlist panel  
_Verified by:_ Prototype - loads from localStorage on mount

[✅] **AC-6:** Success notification shown  
GIVEN copy action completed  
WHEN entries are loaded  
THEN success notification displays entry count copied  
_Verified by:_ Prototype - NotificationContext integration

[✅] **AC-7:** Can save copied entries to own tasks  
GIVEN copied entries are in my playlist  
WHEN I click "Lisa ülesandesse"  
THEN I can create new task or add to existing task  
_Verified by:_ Prototype - full task creation flow available

[✅] **AC-8:** Audio preserved in copied entries  
GIVEN shared task has synthesized audio  
WHEN I copy entries  
THEN audio URLs are included (if available)  
_Verified by:_ Prototype - audioUrl copied in TaskEntry structure

## Flow Diagram

```
User receives shared link
  ↓
Opens link (unauthenticated)
  ↓
Views task entries (read-only)
  ↓
Clicks "Kopeeri kõnevooru"
  ↓
Entries copied to localStorage
  ↓
Success notification shown
  ↓
[Option A] Continue without login
  ├─ Entries in temp playlist
  └─ Can play and practice
  
[Option B] Save to own tasks
  ├─ Login modal appears
  ├─ User authenticates
  ├─ Playlist restored after login
  └─ Can save to personal tasks
```

## Technical Implementation

**localStorage Keys:**
```typescript
'eki_playlist_entries'      // Temporary playlist from copy action
'eki_pending_action'        // Action to execute after login
'eki_pending_playlist'      // Playlist data during login flow
```

**Copy Function:**
```typescript
const handleCopyToPlaylist = (taskEntries: TaskEntry[]) => {
  // Store entries in localStorage
  localStorage.setItem('eki_playlist_entries', JSON.stringify(taskEntries));
  
  // Navigate to synthesis view
  router.push('/');
  
  // Show success notification
  showNotification('success', `${taskEntries.length} lausungit kopeeritud kõnevooru!`);
};
```

**Load on Mount:**
```typescript
useEffect(() => {
  const storedPlaylist = localStorage.getItem('eki_playlist_entries');
  if (storedPlaylist) {
    const entries = JSON.parse(storedPlaylist);
    setSentences(transformEntriesToSentences(entries));
    localStorage.removeItem('eki_playlist_entries'); // Clear after loading
  }
}, []);
```

## Screenshot

_See Shared Task Detail View with "Kopeeri kõnevooru" button_

## Notes

**Reference prototype:** EKI2 - TaskDetailView copy functionality and playlist loading  
**Edge cases:**
- Empty shared task (copy button disabled)
- Large task with many entries (shows loading state)
- Corrupted localStorage data (handled with try-catch)
- Multiple copies (previous playlist cleared on new copy)

## Security Considerations

- Shared task access via token (no authentication required)
- Read-only access to shared content
- Copied entries are user's own data (can modify/delete)
- No direct modification of original shared task

## User Experience Notes

- **Seamless workflow:** Copy → Practice → Save
- **No friction:** Works without login for immediate access
- **Progressive enhancement:** Login only required for persistence
- **Clear feedback:** Notifications at each step

## Related User Stories

- US-023: Access shared task via link
- US-009: Add entry to playlist
- US-021: Add playlist entries to task
- US-028: Redirect to login for protected features
