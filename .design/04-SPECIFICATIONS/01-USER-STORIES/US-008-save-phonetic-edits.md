# US-008: Save phonetic text edits

**Feature:** F-002
**Status:** [ ] ⚠️ PARTIALLY IMPLEMENTED - Component has save functionality but not integrated; no long-term persistence
**Implementation:** `components/StressedTextDisplay.tsx` (lines 73-80: save handler) exists but not integrated. Phonetic edits stored in-memory only (page.tsx `sentence.phoneticText`, `sentence.stressedTags`)

## User Story

As a **language teacher**  
I want to **save my phonetic text edits**  
So that **I can reuse the customized pronunciation in future sessions**

## Acceptance Criteria

[ ] **AC-1:** Save confirmation
GIVEN I have edited the phonetic text
WHEN I click the save button
THEN a confirmation message appears
_Status:_ ⚠️ **COMPONENT EXISTS BUT NOT ACCESSIBLE** - StressedTextDisplay has save button (StressedTextDisplay.tsx:153-162) but no confirmation message; component not integrated into app

[ ] **AC-2:** Edit persistence
GIVEN I have saved phonetic edits
WHEN I navigate away and return
THEN my edits are preserved
_Status:_ ❌ **NOT IMPLEMENTED** - No localStorage or database persistence for phonetic edits. In-memory state only (page.tsx sentence state) which is lost on page reload.

[ ] **AC-3:** Reset to original
GIVEN I have saved edits
WHEN I click the reset button
THEN the phonetic text reverts to the original Vabamorf output
_Status:_ ⚠️ **PARTIAL** - StressedTextDisplay has cancel button (StressedTextDisplay.tsx:163-173) that reverts to original in edit session, but no separate "reset" after save. Component not integrated into app.

## Screenshot

![Save Phonetic Edits](../screenshots/US-008-save-phonetic-edits.png)

## Implementation Status

**What exists:**
- ✅ Save button in StressedTextDisplay (StressedTextDisplay.tsx:153-162)
- ✅ Cancel button to revert changes (StressedTextDisplay.tsx:163-173)
- ✅ In-memory persistence during session via `sentence.phoneticText` and `sentence.stressedTags` state
- ✅ Phonetic edits from variant selection persist within session

**What's missing:**
- ❌ StressedTextDisplay component not integrated into app/page.tsx (same as US-007)
- ❌ No save confirmation message/notification
- ❌ No localStorage persistence - edits lost on page reload
- ❌ No database persistence - edits lost across sessions
- ❌ No "reset to original" button (only cancel during edit)

**Current behavior:**
- Selected pronunciation variants (US-005, US-034) ARE saved in-memory during session
- But full sentence phonetic editing (US-007, US-008) is not accessible
- Page reload clears all custom phonetic modifications

**Relationship to other features:**
- Depends on US-007 (Edit phonetic text) being integrated first
- Related to US-004 (View stressed text) - same component
- Tasks (US-015 to US-023) provide persistence mechanism for saving synthesis entries, which could include phonetic forms

## Notes

**Reference prototype:** EKI-ui-prototype phonetic text save functionality
**Implementation gap:** This feature requires both integration (US-007) and persistence layer
**Edge cases:** Session storage limits, concurrent edits, export/import of custom phonetics
**Recommendation:**
1. First integrate StressedTextDisplay component (enables US-004, US-007)
2. Then add localStorage persistence for in-session recovery
3. Leverage Task system for long-term persistence of custom phonetic forms

