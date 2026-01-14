# US-10: Edit Phonetic Markers

**Feature:** F03 Sentence Phonetic Panel  
**Priority:** High

## User Story

As a **language specialist**  
I want to **directly edit the phonetic markers in my sentence**  
So that **I have complete control over the pronunciation**

## Acceptance Criteria

- [ ] **AC-1:** Phonetic text is displayed in an editable input field
- [ ] **AC-2:** User can type directly to modify the text
- [ ] **AC-3:** Marker toolbar buttons insert markers at cursor position
- [ ] **AC-4:** Play button previews the current phonetic text
- [ ] **AC-5:** "Rakenda" (Apply) button saves changes to the sentence
- [ ] **AC-6:** Applying changes updates both display text and phonetic form
- [ ] **AC-7:** Audio cache is invalidated after applying changes
- [ ] **AC-8:** Success notification is shown after applying
- [ ] **AC-9:** Guide button opens phonetic marker documentation

## UI Behavior

### Editing Flow

1. User views phonetic form: `N`oor+mees l`äks kooli`
2. User clicks in input field after "kooli"
3. User adds `` ` `` marker: `N`oor+mees l`äks k`ooli`
4. User clicks play to preview
5. User clicks "Rakenda" to apply

### Marker Toolbar

| Button | Inserts | Description |
|--------|---------|-------------|
| ` | `` ` `` | Third pitch accent (before vowel) |
| ´ | `´` | Stress marker (before stressed vowel) |
| ' | `'` | Palatalization (after consonant) |
| + | `+` | Compound word boundary |

### Preview Playback

1. User modifies phonetic text
2. User clicks play button
3. Audio synthesizes from current phonetic text
4. User can hear changes before applying

### Apply Changes

1. User clicks "Rakenda" button
2. Phonetic text is transformed to Vabamorf format
3. Original text (display) is derived by stripping markers
4. Sentence state is updated:
   - `text`: Plain text without markers
   - `tags`: Words without markers
   - `phoneticText`: Full phonetic form
   - `stressedTags`: Phonetic form per word
   - `audioUrl`: Cleared (cache invalidated)
5. Panel closes
6. Success notification appears

### State Changes

**Before Apply:**
```
text: "Noormees läks kooli"
phoneticText: "N<oor_mees l<äks kooli"
```

**After Apply (with edited phonetic `N`oor+mees l`äks k`ooli`):**
```
text: "Noormees läks kooli"  ← Derived from stripped phonetic
phoneticText: "N<oor_mees l<äks k<ooli"  ← Transformed to Vabamorf
audioUrl: undefined  ← Cache cleared
```

## Phonetic Guide Access

- Clicking "siit" (here) link opens the phonetic guide view
- Guide view replaces the entire panel content including the main header
- Guide header contains: back arrow icon, title "Foneetiliste märkide juhend", close button
- Guide displays marker cards with:
  - Symbol icon and marker name (header row)
  - Description text (16px, Medium weight, primary color)
  - Example tags in horizontal row
- Back arrow returns to the edit form view

## Related Test Cases

- [TC-09: Phonetic Panel Operations](../../02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md)

## Notes

- Marker validation is minimal (user has full control)
- Invalid markers may produce unexpected synthesis
- Changes persist until text is modified in main view
