# US-007: Edit phonetic text manually

**Feature:** F-002
**Status:** [ ] ⚠️ NOT ACCESSIBLE - Component exists but not integrated
**Implementation:** `components/StressedTextDisplay.tsx` (lines 36-86: edit mode, 179-250: edit UI) exists with full functionality but is NOT imported or used in `app/page.tsx`

## User Story

As a **language teacher**  
I want to **manually edit the phonetic text with stress markers**  
So that **I can correct or customize the pronunciation for specific teaching purposes**

## Acceptance Criteria

[ ] **AC-1:** Edit mode activation
GIVEN the phonetic text is displayed
WHEN I click the edit button
THEN the phonetic text becomes editable
_Status:_ ⚠️ **COMPONENT READY BUT NOT ACCESSIBLE** - Edit mode exists in StressedTextDisplay (StressedTextDisplay.tsx:67-71), but component is not used in the app

[ ] **AC-2:** Phonetic marker insertion
GIVEN the edit mode is active
WHEN I use the phonetic marker buttons (`, ´, ', +)
THEN the selected marker is inserted at cursor position
_Status:_ ⚠️ **COMPONENT READY BUT NOT ACCESSIBLE** - Symbol toolbar exists (StressedTextDisplay.tsx:192-228), insertSymbol function maintains cursor position (StressedTextDisplay.tsx:88-102), but component is not used in the app

[ ] **AC-3:** Validation on save
GIVEN I have edited the phonetic text
WHEN I click save
THEN the system validates the phonetic notation syntax
_Status:_ ❌ **NOT IMPLEMENTED** - No validation logic exists; the save function (StressedTextDisplay.tsx:73-80) only transforms markers and calls the callback without validation

[ ] **AC-4:** Re-synthesis with edits
GIVEN the edited phonetic text is saved
WHEN I trigger synthesis
THEN the audio uses the manually edited phonetic form
_Status:_ ⚠️ **COMPONENT READY BUT NOT ACCESSIBLE** - Save handler transforms UI markers to Vabamorf format and passes to onPhoneticTextChange callback (StressedTextDisplay.tsx:73-80), but component is not integrated with synthesis flow

## Screenshot

![Edit Phonetic Text](../screenshots/US-007-edit-phonetic-text.png)

## Implementation Gap

**What exists:**
- ✅ `StressedTextDisplay.tsx` component with full edit functionality:
  - Edit/Cancel/Save buttons (lines 67-86, 137-176)
  - Editable textarea for phonetic text (lines 183-190)
  - Phonetic symbol toolbar with quick-insert buttons (`, ´, ', +) (lines 192-228)
  - Phonetic guide modal integration (lines 234-246, 309-312)
  - Marker transformation (UI ↔ Vabamorf) on save (lines 76-78)
  - Cursor position preservation when inserting symbols (lines 88-102)

**What's missing:**
- ❌ Component is not imported or used in `app/page.tsx`
- ❌ No phonetic validation logic (AC-3)
- ❌ No integration with the synthesis workflow
- ❌ Users cannot access this functionality

**Current workaround:**
- Users can achieve similar results using **US-034 (Custom phonetic variant)** for individual words
- But there's no way to edit the full sentence phonetic form

**Related to US-004:**
- Both US-004 and US-007 depend on the same `StressedTextDisplay` component
- Both are blocked by the same integration issue

## Notes

**Reference prototype:** EKI-ui-prototype phonetic text editor
**Implementation status:** Component fully built but not integrated into app
**Edge cases:** Invalid phonetic markers, conflicting stress patterns, undo/redo functionality
**Recommendation:**
1. Integrate `StressedTextDisplay` component into the synthesis page to enable both US-004 (view stressed text) and US-007 (edit phonetic text)
2. Add validation logic for phonetic notation syntax before saving
3. Connect the edit save handler to the synthesis flow

