# US-08: Create Custom Phonetic Variant

**Feature:** F02 Pronunciation Variants  
**Priority:** High

## User Story

As a **language specialist**  
I want to **create my own phonetic variant using markers**  
So that **I can synthesize specific pronunciations not in the standard list**

## Acceptance Criteria

- [x] **AC-1:** "Loo oma variant" (Create custom variant) link is visible in variants panel
- [x] **AC-2:** Clicking the link expands a custom variant input form
- [x] **AC-3:** Input field allows entering text with phonetic markers
- [x] **AC-4:** Marker guide box provides buttons for inserting common markers
- [x] **AC-5:** Phonetic guide link ("siit") opens detailed marker documentation
- [x] **AC-6:** Custom variant can be previewed with play button
- [x] **AC-7:** Custom variant can be applied with "Helinda" button
- [x] **AC-8:** Clear button (X) in input field resets the custom input
- [x] **AC-9:** Form can be collapsed with "Eemalda loodud variant" link

## UI Behavior

### Expanding Custom Form

1. User clicks "Loo oma variant" link
2. Form expands with title and description
3. Input field appears with placeholder "Kirjuta oma hääldusmärkidega variant"
4. Marker guide box appears below input
5. Link changes to "Eemalda loodud variant" (Remove custom variant)

### Custom Form Layout

```
┌─────────────────────────────────────┐
│ Loo oma variant                     │ ← Title
│                                     │
│ Sisesta oma tekst hääldusmärkidega  │
│ ja kuula tulemust.                  │ ← Description
│                                     │
│ ┌─────────────────────────────[X]┐  │
│ │ k`ool'i                        │  │ ← Input with clear button
│ └────────────────────────────────┘  │
│                    [▶]  [Helinda]   │ ← Play and Apply buttons
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Hääldusmärgid                   │ │
│ │ Kasuta märke häälduse täpsus... │ │
│ │ [ ` ] [ ´ ] [ ' ] [ + ]         │ │ ← Marker buttons
│ │ Juhised: siit                   │ │ ← Guide link
│ └─────────────────────────────────┘ │
│                                     │
│ [Eemalda loodud variant]            │ ← Collapse link
└─────────────────────────────────────┘
```

### Marker Guide Box

| Button | Marker | Name | Description |
|--------|--------|------|-------------|
| ` | `` ` `` | kolmas välde | Third pitch accent |
| ´ | `´` | ebareeglipärase rõhu märk | Irregular stress marker |
| ' | `'` | peenendus | Softening marker |
| + | `+` | liitsõnapiir | Compound word boundary |

### Marker Insertion

1. User positions cursor in input field
2. User clicks marker button (e.g., `` ` ``)
3. Marker is inserted at cursor position
4. Cursor moves after the marker
5. Focus returns to input field

### Phonetic Guide

Clicking "siit" (here) link opens the phonetic guide view:
- Guide view replaces the entire panel content including the main header
- Guide header contains: back arrow icon, title "Hääldusmärkide juhend", close button
- Guide displays marker cards with symbol, name, description, and examples
- Back arrow returns to the variants list view

### Button States

| Button | State | Condition |
|--------|-------|-----------|
| Play (▶) | Disabled | Input is empty |
| Play (▶) | Enabled | Input has text |
| Helinda | Disabled | Input is empty |
| Helinda | Enabled | Input has text |

## Transformation

When "Helinda" is clicked:
1. UI markers are transformed to Vabamorf format
2. `` ` `` → `<` (third pitch accent)
3. `´` → `?` (stress marker)
4. `'` → `]` (palatalization)
5. `+` → `_` (compound boundary)
6. Transformed text applied as custom phonetic form

## Related Test Cases

- [TC-08: Custom Variant Creation](../../02-TEST-CASES/F02-pronunciation-variants/TC-08-custom-variant.md)

## Notes

- Custom variants are not saved permanently
- Duplicate consecutive markers are normalized
- Invalid marker combinations may produce unexpected audio
- Guide view has back navigation to return to variants
- The apply button is labeled "Helinda" (not "Kasuta" like standard variants)
