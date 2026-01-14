# US-09: View Sentence Phonetic Form

**Feature:** F03 Sentence Phonetic Panel  
**Priority:** High

## User Story

As a **language specialist**  
I want to **view the complete phonetic form of my sentence**  
So that **I can see all stress markers and understand the full pronunciation**

## Acceptance Criteria

- [ ] **AC-1:** "Uuri foneetilist kuju" option is available in sentence menu
- [ ] **AC-2:** Selecting the option opens the Sentence Phonetic Panel
- [ ] **AC-3:** Panel displays the original sentence text
- [ ] **AC-4:** Panel displays the phonetic form with UI-friendly markers
- [ ] **AC-5:** If phonetic text not cached, it is fetched via `/api/analyze`
- [ ] **AC-6:** Panel can be closed with X button
- [ ] **AC-7:** Phonetic text is editable in the panel

## UI Behavior

### Accessing the Panel

1. User enters text and optionally synthesizes it
2. User clicks three-dot menu (⋯) on sentence row
3. User selects "Uuri foneetilist kuju"
4. Menu closes
5. Panel slides in from right

### Panel Content

```
┌─────────────────────────────────────┐
│ Lause foneetiline kuju          [X]│
├─────────────────────────────────────┤
│ Originaaltekst:                     │
│ Noormees läks kooli                 │
│                                     │
│ Foneetiline kuju:                   │
│ ┌─────────────────────────────────┐ │
│ │ N`oor+mees l`äks k`ooli         │ │ ← Editable input
│ └─────────────────────────────────┘ │
│                                     │
│ [ ` ] [ ´ ] [ ' ] [ + ]             │ ← Marker toolbar
│                                     │
│ [Juhend]          [▶]    [Rakenda] │
└─────────────────────────────────────┘
```

### Phonetic Text Display

- Uses UI-friendly markers (`` ` ``, `´`, `'`, `+`)
- Transformed from Vabamorf format for readability
- Shows all words in sequence with spaces

### Loading State

If phonetic text not available:
1. Panel shows loading indicator
2. System calls `/api/analyze` with sentence text
3. Response contains phonetic form
4. Panel updates with phonetic text

## Related Test Cases

- [TC-09: Phonetic Panel Operations](../../02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md)

## Notes

- This panel is for viewing/editing the entire sentence
- For individual word variants, use F02 Pronunciation Variants
- Changes made here affect the entire sentence's synthesis
