# US-006: Select pronunciation variant

**Feature:** F-002
**Status:** [x] ⚠️ DEPRECATED - Merged into US-005 AC-4
**Implementation:** Functionality fully covered in US-005 (View pronunciation variants) - variant selection is an integral part of viewing variants, not a separate feature

## User Story

As a **language learner**  
I want to **select a specific pronunciation variant for a word**  
So that **the synthesis uses my chosen pronunciation**

## Deprecation Notice

This user story has been **merged into US-005 AC-4** as variant selection is an integral part of the pronunciation variants feature, not a separate workflow.

## Original Acceptance Criteria (Now in US-005)

[x] **AC-1:** Variant selection interface
→ **Covered by US-005 AC-4:** "WHEN I select a specific variant (click 'Kasuta' button) THEN the selected variant's phonetic form replaces the word..."
GIVEN the pronunciation variants panel is displayed
WHEN I click on a specific variant
THEN that variant is marked as selected

[x] **AC-2:** Selection persistence
→ **Fully implemented:** Selected variants are persisted in `sentence.stressedTags` and `sentence.phoneticText` (page.tsx:912-921)
GIVEN I have selected a pronunciation variant
WHEN I re-synthesize the same text
THEN the previously selected variant is used
_Status:_ ✅ **IMPLEMENTED** - The selected phonetic form is stored and used for all future synthesis of that sentence until changed

[x] **AC-3:** Preview selected variant
→ **Covered by US-005 AC-3:** Each variant has a play button for audio preview before selection
GIVEN a variant is selected
WHEN I click the preview button
THEN I hear the word pronounced with that specific variant
_Status:_ ✅ **IMPLEMENTED** - Each variant in the list has its own play button (PronunciationVariants.tsx:71-116)

## Screenshot

![Select Pronunciation Variant](../screenshots/US-006-select-pronunciation-variant.png)

## Notes

**Why deprecated:** During implementation, variant selection became tightly coupled with viewing variants - they're part of the same user interaction flow. Separating them into different user stories creates artificial boundaries that don't match the actual UX.

**Migration:** All functionality described in this user story is now documented in:
- US-005 AC-4 (Variant selection)
- US-005 AC-3 (Preview variants before selection)

**Implementation details:**
- Selected variants persist across synthesis operations via `sentence.stressedTags` state
- The original word remains visible in tags, while the phonetic variant is stored separately
- Audio cache is invalidated when a variant is selected to force re-synthesis

