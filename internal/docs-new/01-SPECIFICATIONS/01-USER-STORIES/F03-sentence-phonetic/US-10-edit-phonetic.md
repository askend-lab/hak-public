# US-10: Edit Phonetic Markers

**Feature:** F03 Sentence Phonetic Panel  
**Priority:** High

## User Story

As a **language specialist**  
I want to **directly edit the phonetic markers in my sentence**  
So that **I have complete control over the pronunciation**

## Acceptance Criteria

- [x] **AC-1:** Phonetic text is displayed in an editable textarea field
- [x] **AC-2:** User can type directly to modify the text
- [x] **AC-3:** Marker guide box buttons insert markers at cursor position
- [x] **AC-4:** "Kuula" (Listen) button with play icon previews the current phonetic text
- [x] **AC-5:** "Rakenda" (Apply) button saves changes to the sentence
- [x] **AC-6:** Applying changes updates both display text and phonetic form
- [x] **AC-7:** Audio cache is invalidated after applying changes
- [x] **AC-8:** Panel closes after applying changes
- [x] **AC-9:** "siit" link in guide box opens phonetic marker documentation

## UI Behavior

### Editing Flow

1. User views phonetic form: `N`oor+mees l`äks kooli`
2. User clicks in textarea after "kooli"
3. User adds `` ` `` marker: `N`oor+mees l`äks k`ooli`
4. User clicks "Kuula" to preview
5. User clicks "Rakenda" to apply

### Marker Guide Box

Located below the textarea with title "Hääldusmärgid":

| Button | Inserts | Description |
|--------|---------|-------------|
| ` | `` ` `` | kolmas välde |
| ´ | `´` | ebareeglipärase rõhu märk |
| ' | `'` | peenendus |
| + | `+` | liitsõnapiir |

### Preview Playback

1. User modifies phonetic text
2. User clicks "Kuula" button (with play icon)
3. Button shows loading state, then pause icon
4. Audio synthesizes from current phonetic text
5. User can hear changes before applying

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
5. Panel closes automatically

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

### Button States

| Button | Empty Textarea | Has Text |
|--------|----------------|----------|
| Kuula | Disabled | Enabled |
| Rakenda | Disabled | Enabled |

## Phonetic Guide Access

- Clicking "siit" (here) link in the marker guide box opens the phonetic guide view
- Guide view replaces the panel content
- Guide header contains: back arrow icon, title "Hääldusmärkide juhend", close button
- Guide displays marker cards with symbol, name, rule, and examples
- Back arrow returns to the edit form view

## Related Test Cases

- [TC-09: Phonetic Panel Operations](../../02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md)

## Notes

- Marker validation is minimal (user has full control)
- Invalid markers may produce unexpected synthesis
- Changes persist until text is modified in main view
- Closing panel without clicking "Rakenda" discards changes
