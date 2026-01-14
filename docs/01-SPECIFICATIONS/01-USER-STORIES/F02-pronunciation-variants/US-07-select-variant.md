# US-07: Select and Apply Variant

**Feature:** F02 Pronunciation Variants  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **select a pronunciation variant to apply to my sentence**  
So that **the synthesized audio uses my chosen pronunciation**

## Acceptance Criteria

- [ ] **AC-1:** Each variant has a "Kasuta" (Use) button
- [ ] **AC-2:** Clicking "Kasuta" applies the variant's phonetic form to the sentence
- [ ] **AC-3:** The original word in the tag display remains unchanged
- [ ] **AC-4:** The phonetic form (stressedTags) is updated with the variant
- [ ] **AC-5:** Audio cache is invalidated to force re-synthesis
- [ ] **AC-6:** Selected variant is highlighted in the panel
- [ ] **AC-7:** Panel remains open after selection (for further exploration)
- [ ] **AC-8:** Next synthesis uses the selected variant's phonetic form

## UI Behavior

### Selection Flow

1. User views variants for word "kooli"
2. User clicks "Kasuta" on variant `k`ooli`
3. Variant item shows selected state (highlighted)
4. Tag in main view remains "kooli" (display unchanged)
5. Internal phonetic form updated to `k<ooli` (Vabamorf format)
6. Audio cache cleared
7. Panel stays open

### State After Selection

**Before:**
```
Sentence: [Noormees] [läks] [kooli]
Phonetic: N<oor_mees l<äks kooli
```

**After selecting `k`ooli` variant:**
```
Sentence: [Noormees] [läks] [kooli]  ← Display unchanged
Phonetic: N<oor_mees l<äks k<ooli   ← Phonetic updated
```

### Subsequent Synthesis

1. User closes panel or presses Enter
2. Synthesis uses updated phonetic text
3. Audio plays with selected variant pronunciation

### Panel Updates

- Selected variant shows visual highlight
- Custom phonetic input (if shown) updates to match selection
- "Kasuta" button may change to "Valitud" (Selected) state

## Data Flow

```
User selects variant
        ↓
Update stressedTags[index] with variant text
        ↓
Rebuild phoneticText from stressedTags
        ↓
Clear audioUrl cache
        ↓
Next play uses new phoneticText
```

## Related Test Cases

- [TC-07: Preview and Select Variant](../../02-TEST-CASES/F02-pronunciation-variants/TC-07-preview-select.md)

## Notes

- Selection persists until text is modified
- Modifying the word tag resets its phonetic form
- Multiple words can have different variants applied
