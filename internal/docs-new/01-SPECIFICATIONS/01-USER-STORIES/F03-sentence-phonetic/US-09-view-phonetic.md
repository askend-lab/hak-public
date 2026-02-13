# US-09: View Sentence Phonetic Form

**Feature:** F03 Sentence Phonetic Panel  
**Priority:** High

## User Story

As a **language specialist**  
I want to **view the complete phonetic form of my sentence**  
So that **I can see all stress markers and understand the full pronunciation**

## Acceptance Criteria

- [x] **AC-1:** "Uuri häälduskuju" option is available in sentence menu
- [x] **AC-2:** Selecting the option opens the Sentence Phonetic Panel
- [x] **AC-3:** Panel displays the phonetic form with UI-friendly markers in editable textarea
- [x] **AC-4:** If phonetic text not cached, the original sentence text is displayed for editing
- [x] **AC-5:** Panel can be closed with X button
- [x] **AC-6:** Phonetic text is editable in the panel

## UI Behavior

### Accessing the Panel

1. User enters text and optionally synthesizes it
2. User clicks three-dot menu (⋯) on sentence row
3. User selects "Uuri häälduskuju"
4. Menu closes
5. Panel slides in from right

### Panel Content

```
┌─────────────────────────────────────┐
│ Muuda häälduskuju                [X]│
├─────────────────────────────────────┤
│ Sisesta hääldusmärgid, et           │
│ täpsustada lause hääldust.          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ N`oor+mees l`äks k`ooli         │ │ ← Editable textarea
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Hääldusmärgid                   │ │
│ │ Kasuta märke häälduse täpsus... │ │
│ │ [ ` ] [ ´ ] [ ' ] [ + ]         │ │ ← Marker buttons
│ │ Juhised: siit                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│         [▶ Kuula]    [Rakenda]      │
└─────────────────────────────────────┘
```

### Phonetic Text Display

- Uses UI-friendly markers (`` ` ``, `´`, `'`, `+`)
- Transformed from Vabamorf format for readability
- Shows all words in sequence with spaces
- Displayed in multi-line textarea (4 rows default)

### Initial State

If phonetic text exists:
- Textarea shows existing phonetic form in UI format

If no phonetic text cached:
- Textarea shows the original sentence text for editing

## Related Test Cases

- [TC-09: Phonetic Panel Operations](../../02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md)

## Notes

- This panel is for viewing/editing the entire sentence
- For individual word variants, use F02 Pronunciation Variants
- Changes made here affect the entire sentence's synthesis
- Panel title is "Muuda häälduskuju" (Edit pronunciation form)
