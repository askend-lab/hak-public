# US-005: View pronunciation variants

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `components/PronunciationVariants.tsx` (lines 1-400+), integrated in `app/page.tsx` (lines 886-931: handlers, 1332-1338: component usage)

## User Story

As a **language learner**  
I want to **see alternative pronunciation variants for ambiguous words**  
So that **I can choose the correct pronunciation based on context**

## Acceptance Criteria

[x] **AC-1:** Clickable word display
GIVEN the synthesized text is displayed as tags
WHEN I view the sentence
THEN all words appear as clickable tags (regardless of whether variants exist)
_Verified by:_ All tags have `tag-clickable` class and onClick handler (page.tsx:1194-1195, 1205), handleTagClick opens variants panel (page.tsx:886-896)

[x] **AC-2:** Variants panel opens
GIVEN I click on any word tag
WHEN the click event fires
THEN the PronunciationVariants side panel opens
AND it fetches variants from `/api/variants` endpoint
AND displays all available pronunciation options for that word
_Verified by:_ PronunciationVariants component (PronunciationVariants.tsx:21-400+), opens when isVariantsPanelOpen is true (page.tsx:1334, 895), fetchVariants API call (PronunciationVariants.tsx:47-69)

[x] **AC-3:** Variant details
GIVEN the pronunciation variants panel is open
WHEN I view the variants
THEN each variant shows:
  - Phonetic form (transformed to UI-friendly markers)
  - Description/context tags
  - Individual play button for audio preview
AND I can play any variant by clicking its play button
AND the variant audio is synthesized on-demand using `efm_s` voice model
_Verified by:_ Variant display with phonetic markers (PronunciationVariants.tsx:123-145), play button for each variant (PronunciationVariants.tsx:71-116), synthesis with efm_s (PronunciationVariants.tsx:76-83)

[x] **AC-4:** Variant selection
GIVEN multiple variants are displayed
WHEN I select a specific variant (click "Kasuta" button)
THEN the selected variant's phonetic form replaces the word in the sentence's phonetic representation
AND the original word remains unchanged in the visible tag display
AND the phonetic text is updated in sentence.stressedTags and sentence.phoneticText
AND the audio cache is invalidated to force re-synthesis with the new variant
AND the variants panel closes
_Verified by:_ handleUseVariant updates stressedTags and phoneticText (page.tsx:906-931), keeps original word in tags array (page.tsx:911-912), clears audio cache (page.tsx:923), closes panel (page.tsx:930)

## Screenshot

![Pronunciation Variants](../screenshots/US-005-view-pronunciation-variants.png)

## Additional Features

The implementation includes enhanced functionality beyond the core requirements:

- **UI marker transformation**: Converts between Vabamorf format (API) and user-friendly format (display) using `transformToUI` and `transformToVabamorf` utilities (PronunciationVariants.tsx:4, 156; utils/phoneticMarkers.ts:48-95)

  **Transformation details:**
  - **Vabamorf → UI (for display):**
    - `<` → `` ` `` (kolmas välde / third pitch accent)
    - `?` → `´` (rõhuline silp / stressed syllable)
    - `]` → `'` (palatalisatsioon / palatalization)
    - `_` → `+` (liitsõna piir / compound word boundary)
  - **Other Vabamorf markers omitted from UI:** `~`, `+`, `=`, `[`, `'`, `.` (phoneticMarkers.ts:100-118)
  - **UI → Vabamorf (for synthesis):** Reverse mapping applied when sending to TTS (phoneticMarkers.ts:79-95)
  - **Example:** `m<ee_s` (Vabamorf) ↔ `m`ee+s` (UI display)

- **Visual selection feedback**: Selected tag is highlighted when variants panel is open (page.tsx:1190, 1194)
- **Loading states**: Shows loading spinner while fetching variants or playing audio
- **Custom phonetic preservation**: If a word already has a custom variant selected, it's displayed when reopening the panel (page.tsx:889, 894)

## Related User Stories

- **US-034: Create custom phonetic variant** - Documents the custom variant input, phonetic marker toolbar, and phonetic guide features that are also available in this panel

## Notes

**Reference prototype:** EKI-ui-prototype PronunciationVariants component
**Implementation completeness:** Fully implemented with additional enhancements
**Edge cases:** Words with 3+ variants, rare pronunciation cases, dialect-specific variants
**UI Design:** Side panel overlay design (not modal), allows users to keep context visible while selecting variants

