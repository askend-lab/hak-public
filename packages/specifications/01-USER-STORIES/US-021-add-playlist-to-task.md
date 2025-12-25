# US-021: Add playlist entries to task

**Feature:** F-005  
**Status:** [x] ✅ Implemented in prototype  
**Implementation:** `Playlist.tsx`, `TaskCreationModal.tsx`

## User Story

As a **language teacher**  
I want to **add entire playlist to a task**  
So that **I can save curated pronunciation sequences as exercises**

## Acceptance Criteria

[x] **AC-1:** Add playlist to task button  
GIVEN I have entries in my playlist  
WHEN I view the playlist  
THEN I see an "Add all to task" button  
_Verified by:_ "Lisa ülesandesse" button adds all playlist entries to new/existing task

[x] **AC-2:** Task selection dialog  
GIVEN I click "Add all to task"  
WHEN the button is clicked  
THEN I see a dialog listing my existing tasks  
_Verified by:_ "Lisa ülesandesse" button adds all playlist entries to new/existing task

[x] **AC-3:** Add all entries to task  
GIVEN I select a task from the list  
WHEN I confirm the selection  
THEN all playlist entries are added to the selected task  
_Verified by:_ "Lisa ülesandesse" button adds all playlist entries to new/existing task

[x] **AC-4:** Preserve entry order  
GIVEN playlist entries have a specific order  
WHEN they are added to a task  
THEN the order is preserved in the task  
_Verified by:_ "Lisa ülesandesse" button adds all playlist entries to new/existing task

[x] **AC-5:** Success notification  
GIVEN I have added playlist to a task  
WHEN the operation completes  
THEN I see a notification showing how many entries were added  
_Verified by:_ "Lisa ülesandesse" button adds all playlist entries to new/existing task

## Screenshot

![Add Playlist to Task](../screenshots/US-021-add-playlist-to-task.png)

## Notes

**Reference prototype:** EKI-ui-prototype batch add functionality  
**Edge cases:** Empty playlist, very large playlists (>100 entries), duplicate entries

