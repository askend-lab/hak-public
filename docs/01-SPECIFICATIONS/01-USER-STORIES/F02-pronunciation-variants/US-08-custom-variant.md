# US-08: Create Custom Phonetic Variant

**Feature:** F02 Pronunciation Variants  
**Priority:** High

## User Story

As a **language specialist**  
I want to **create my own phonetic variant using markers**  
So that **I can synthesize specific pronunciations not in the standard list**

## Acceptance Criteria

- [ ] **AC-1:** "Loo oma variant" (Create custom variant) link is visible in variants panel
- [ ] **AC-2:** Clicking the link expands a custom variant input form
- [ ] **AC-3:** Input field allows entering text with phonetic markers
- [ ] **AC-4:** Marker toolbar provides buttons for inserting common markers
- [ ] **AC-5:** Phonetic guide link opens detailed marker documentation
- [ ] **AC-6:** Custom variant can be previewed with play button
- [ ] **AC-7:** Custom variant can be applied with "Kasuta" button
- [ ] **AC-8:** Clear button (X) resets the custom input
- [ ] **AC-9:** Form can be collapsed back to just the link

## UI Behavior

### Expanding Custom Form

1. User clicks "Loo oma variant" link
2. Form expands below the link
3. Input field appears with placeholder
4. Marker toolbar appears below input
5. Link changes to "Eemalda loodud variant" (Remove custom variant)

### Custom Form Layout

```
┌─────────────────────────────────────┐
│ Loo oma variant                     │
│                                     │
│ Sisesta oma foneetiline tekst...    │
│ ┌─────────────────────────────[X]┐  │
│ │ k`ool'i                        │  │
│ └────────────────────────────────┘  │
│                                     │
│ [ ` ] [ ´ ] [ ' ] [ + ]             │ ← Marker toolbar
│                                     │
│ Juhised: siit                       │ ← Guide link
│                                     │
│                    [▶]    [Kasuta]  │
│                                     │
│ [Eemalda loodud variant]            │
└─────────────────────────────────────┘
```

### Marker Toolbar

| Button | Marker | Name | Usage |
|--------|--------|------|-------|
| ` | `` ` `` | Kolmas välde | Before vowel for third pitch accent |
| ´ | `´` | Rõhuline silp | Before stressed vowel (non-first syllable) |
| ' | `'` | Palatalisatsioon | After consonant (d, l, n, s, t) |
| + | `+` | Liitsõna piir | Between compound word parts |

### Marker Insertion

1. User positions cursor in input field
2. User clicks marker button (e.g., `` ` ``)
3. Marker is inserted at cursor position
4. Cursor moves after the marker

### Phonetic Guide

Clicking "siit" (here) link opens the phonetic guide view:
- Guide view replaces the entire panel content including the main header
- Guide header contains: back arrow icon, title "Foneetiliste märkide juhend", close button
- Guide displays marker cards with:
  - Symbol icon and marker name (header row)
  - Description text (16px, Medium weight, primary color)
  - Example tags in horizontal row
- Back arrow returns to the variants list view

## Transformation

When "Kasuta" is clicked:
1. UI markers are transformed to Vabamorf format
2. `` ` `` → `<` (third pitch accent)
3. `´` → `?` (stress marker)
4. `'` → `]` (palatalization)
5. `+` → `_` (compound boundary)

## Related Test Cases

- [TC-08: Custom Variant Creation](../../02-TEST-CASES/F02-pronunciation-variants/TC-08-custom-variant.md)

## Notes

- Custom variants are not saved permanently
- Duplicate consecutive markers are normalized (e.g., `''` → `'`)
- Invalid marker combinations may produce unexpected audio
- Guide view replaces variant list temporarily, with back button
