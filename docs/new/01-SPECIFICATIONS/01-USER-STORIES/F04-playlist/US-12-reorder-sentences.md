# US-12: Reorder Sentences

**Feature:** F04 Playlist Management  
**Priority:** High

## User Story

As a **language learner**  
I want to **reorder my sentences via drag-and-drop**  
So that **I can organize them in my preferred sequence**

## Acceptance Criteria

- [x] **AC-1:** Each sentence row has a drag handle on the left
- [x] **AC-2:** Dragging a sentence shows visual feedback (opacity change)
- [x] **AC-3:** Drop target shows indicator when dragging over
- [x] **AC-4:** Dropping reorders the sentence list
- [x] **AC-5:** Order is maintained in memory and persisted to localStorage
- [x] **AC-6:** Drag handle visible only for non-readonly mode sentences

## UI Behavior

### Drag Handle

- Located on the left side of each sentence row
- Visual: Six dots grip icon (⋮⋮)
- Cursor changes to "grab" on hover
- Only visible when sentence is in input mode (not readonly)

### Drag States

| State | Visual |
|-------|--------|
| Normal | Standard opacity |
| Dragging | Reduced opacity (0.5) on dragged item |
| Drag Over | Highlight/indicator on target position |

### Drag and Drop Flow

1. User hovers over drag handle → cursor becomes "grab"
2. User clicks and holds → cursor becomes "grabbing"
3. User drags sentence → dragged row shows reduced opacity
4. User drags over another row → drop indicator appears
5. User releases → sentences reorder
6. All visual states reset
7. New order saved to localStorage

### Example Reorder

**Before:**
```
1. Tere päevast
2. Kuidas läheb
3. Aitäh
```

**User drags "Aitäh" above "Kuidas läheb":**
```
1. Tere päevast
2. Aitäh           ← Moved up
3. Kuidas läheb    ← Moved down
```

### Order After "Play All"

When using "Mängi kõik", sentences play in their current visual order.

## Related Test Cases

- [TC-10: Playlist Management](../../02-TEST-CASES/F04-playlist/TC-10-playlist-management.md)

## Notes

- Drag and drop uses HTML5 drag events
- Uses setDragImage for custom drag preview
- Order persists to localStorage automatically
