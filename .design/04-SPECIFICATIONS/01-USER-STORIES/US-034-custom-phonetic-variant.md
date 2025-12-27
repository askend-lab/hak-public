# US-034: Create custom phonetic variant

**Feature:** F-003
**Status:** [x] ✅ Implemented in prototype
**Implementation:** `components/PronunciationVariants.tsx` (lines 33-36: state, 148-200+: custom variant playback, 230-350+: UI with toolbar)

## User Story

As a **language learner or advanced user**
I want to **manually create and test custom phonetic variants for words**
So that **I can experiment with specific pronunciations not provided by the automatic variants**

## Acceptance Criteria

[x] **AC-1:** Custom variant input field
GIVEN the pronunciation variants panel is open for a word
WHEN I scroll to the custom variant section
THEN I see a text input field labeled for custom phonetic input
AND the input field allows me to type phonetic text freely
_Verified by:_ Custom variant input field in PronunciationVariants component (PronunciationVariants.tsx:230-350+), customVariant state (PronunciationVariants.tsx:33)

[x] **AC-2:** Phonetic marker toolbar
GIVEN I am in the custom variant input field
WHEN I need to insert phonetic markers
THEN I see quick-insert buttons for common markers:
  - ` (kolmas välde / third quantity)
  - ´ (rõhuline silp / stressed syllable)
  - ' (palatalisatsioon / palatalization)
  - \+ (liitsõna piir / compound word boundary)
AND clicking a marker button inserts it at my cursor position
_Verified by:_ Phonetic symbol toolbar with insert buttons (PronunciationVariants.tsx:192-228), insertSymbol function maintains cursor position (PronunciationVariants.tsx:88-102)

[x] **AC-3:** Custom variant preview (play)
GIVEN I have entered a custom phonetic variant
WHEN I click the play/preview button
THEN the custom variant is synthesized using the Merlin TTS
AND the phonetic text is transformed from UI format to Vabamorf format before synthesis
AND I hear the audio playback of my custom variant
AND visual feedback shows loading and playing states
_Verified by:_ handlePlayCustomVariant function (PronunciationVariants.tsx:148-200+), transformToVabamorf conversion (PronunciationVariants.tsx:156), synthesis with efm_s model (PronunciationVariants.tsx:158-165), loading/playing states (PronunciationVariants.tsx:34-35, 151-152, 176-177)

[x] **AC-4:** Custom variant selection
GIVEN I have created and tested a custom phonetic variant
WHEN I click "Kasuta" (Use) button for the custom variant
THEN the custom variant replaces the word's phonetic form in the sentence
AND the variants panel closes
AND future synthesis uses my custom phonetic form
_Verified by:_ Custom variant can be selected and applied via onUseVariant callback (PronunciationVariants.tsx:118-121), integrated with handleUseVariant in page.tsx (page.tsx:906-931)

[x] **AC-5:** Phonetic guide access
GIVEN I am creating a custom variant
WHEN I need help with phonetic markers
THEN I can access a phonetic guide/help modal
AND the guide explains all available markers and their usage
_Verified by:_ Phonetic guide button in toolbar (PronunciationVariants.tsx:234-246), guide modal state (PronunciationVariants.tsx:36), PhoneticGuideModal integration

## Screenshot

![Custom Phonetic Variant Input](../screenshots/US-034-custom-phonetic-variant.png)
*Note: Screenshot may not exist yet - this is a newly documented feature*

## Technical Details

**Marker transformation:**
- Input uses user-friendly UI markers (`, ´, ', +) that are easier to type and read
- System converts to Vabamorf format for synthesis using `transformToVabamorf` utility (utils/phoneticMarkers.ts:79-95)
- Conversion ensures correct interpretation by Merlin TTS engine

**Transformation mapping (UI → Vabamorf):**
- `` ` `` → `<` (kolmas välde / third pitch accent)
- `´` → `?` (rõhuline silp / stressed syllable)
- `'` → `]` (palatalisatsioon / palatalization)
- `+` → `_` (liitsõna piir / compound word boundary)

**Example transformation:**
- User types: `m`ee+s` (UI-friendly)
- System converts to: `m<ee_s` (Vabamorf format)
- Merlin TTS receives: `m<ee_s` for correct synthesis

**Cursor position management:**
- When inserting markers via toolbar, cursor position is preserved
- Uses `setTimeout` to restore focus and cursor after insertion (PronunciationVariants.tsx:97-100)

**Synthesis parameters:**
- Uses `efm_s` voice model (short) for single word variants
- Same synthesis endpoint as automatic variants (`/api/synthesize`)

## Notes

**Reference prototype:** Custom variant input in PronunciationVariants component
**User level:** Advanced feature for users familiar with phonetic notation
**Related features:** This complements US-005 (View pronunciation variants) and US-007 (Edit phonetic text)
**Edge cases:**
- Invalid phonetic marker combinations
- Very long custom variants
- Special characters that break synthesis
- Empty custom variant input

## Relationship to Other User Stories

- **Extends US-005**: Adds manual variant creation on top of automatic variants
- **Related to US-007**: Similar editing capability but focused on single-word variants vs full sentences
- **Uses same utilities as US-004**: Shares `transformToUI` and `transformToVabamorf` from phonetic markers module
