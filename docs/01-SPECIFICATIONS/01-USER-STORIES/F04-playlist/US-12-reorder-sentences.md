# US-12: Reorder Sentences

**Feature:** F04 Playlist Management  
**Priority:** High

## User Story

As a **language learner**  
I want to **reorder my sentences via drag-and-drop**  
So that **I can organize them in my preferred sequence**

## Acceptance Criteria

- [ ] **AC-1:** Each sentence row has a drag handle on the left
- [ ] **AC-2:** Dragging a sentence shows visual feedback (opacity change)
- [ ] **AC-3:** Drop target shows indicator when dragging over
- [ ] **AC-4:** Dropping reorders the sentence list
- [ ] **AC-5:** Order is maintained in memory (not persisted until saved to task)
- [ ] **AC-6:** Drag and drop works on both desktop and touch devices

## UI Behavior

### Drag Handle

- Located on the left side of each sentence row
- Cursor changes to "grab" on hover
- Visual: Six dots or grip lines icon

### Drag States

| State | Visual |
|-------|--------|
| Normal | Standard opacity |
| Dragging | Reduced opacity on dragged item |
| Drag Over | Highlight on target position |

### Drag and Drop Flow

1. User hovers over drag handle → cursor becomes "grab"
2. User clicks and holds → cursor becomes "grabbing"
3. User drags sentence → dragged row shows reduced opacity
4. User drags over another row → drop indicator appears
5. User releases → sentences reorder
6. All visual states reset

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
- On mobile, may need touch-specific handling
- Order persists in session but not between page reloads (unless saved to task)
