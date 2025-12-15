# US-013: Reorder sentences

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `app/page.tsx` (lines 647-701: drag handlers, lines 1171-1185: drag handle and attributes)

## User Story

As a **language learner**
I want to **change the order of my sentences**
So that **I can organize phrases in my preferred learning sequence**

## Acceptance Criteria

[x] **AC-1:** Drag handle visibility
GIVEN I have multiple sentence rows
WHEN I view the sentences section
THEN each sentence row displays a drag handle button (six-dot icon) on the left side
_Verified by:_ Drag handle button rendered for each sentence (page.tsx:1178-1185)

[x] **AC-2:** Drag and drop reordering
GIVEN I grab a sentence by its drag handle
WHEN I drag it to a new position and release
THEN the sentence moves to the new position in the list
AND the sentences array is reordered accordingly
_Verified by:_ handleDrop updates sentence order (page.tsx:677-701), draggable attribute on rows (page.tsx:1171)

[x] **AC-3:** Visual feedback during drag
GIVEN I am dragging a sentence
WHEN the drag is in progress
THEN the dragged sentence appears semi-transparent (opacity 0.5)
AND the drop target sentence shows a visual indicator ('drag-over' class)
_Verified by:_ Opacity change on dragStart (page.tsx:654), dragOverId state highlights target (page.tsx:664-670), CSS class applied (page.tsx:1170)

[x] **AC-4:** Order maintained during session
GIVEN I have reordered my sentences
WHEN I continue using the app without refreshing
THEN the new order is maintained throughout the session
_Verified by:_ Sentences array state persists in-memory during session

[ ] **AC-5:** Order persistence across sessions
GIVEN I have reordered my sentences
WHEN I refresh the page or return later
THEN the new order is preserved
_Status:_ ❌ **NOT IMPLEMENTED** - No localStorage or database persistence; order is lost on reload

## Screenshot

![Reorder Sentences](../screenshots/US-013-reorder-playlist.png)

## Technical Implementation

**Native HTML5 Drag-and-Drop API:**
- **onDragStart:** Captures dragged sentence ID, reduces opacity for visual feedback (page.tsx:647-656)
- **onDragEnd:** Resets opacity and clears drag state (page.tsx:658-662)
- **onDragOver:** Identifies drop target, shows visual indicator (page.tsx:664-671)
- **onDragLeave:** Clears drop target indicator when leaving (page.tsx:673-675)
- **onDrop:** Reorders sentences array by moving dragged item to target position (page.tsx:677-701)

**Reordering logic:**
1. Finds indices of dragged and target sentences
2. Removes dragged sentence from array
3. Inserts it at target position
4. Updates state with new array

## Notes

**Implementation choice:** Uses native HTML5 drag-and-drop instead of a library for simplicity
**Session persistence:** Order maintained in-memory but not persisted to storage
**Accessibility limitations:** No keyboard-based reordering (HTML5 API limitation)
**Touch support:** Limited on touch devices (native HTML5 limitation)
**Playback:** Reordering is allowed during playback without restrictions
**Edge cases:** Touch devices may have limited drag support, no keyboard accessibility, order lost on page reload
