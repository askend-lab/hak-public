# US-024: View phonetic symbols reference guide

**Feature:** F-007  
**Status:** [x] ✅ Implemented in prototype  
**Implementation:** `PhoneticGuideModal.tsx`

## User Story

As a **language learner**  
I want to **view an explanation of phonetic markers**  
So that **I can understand the stress and pronunciation symbols**

## Acceptance Criteria

[x] **AC-1:** Help icon display  
GIVEN I am viewing stressed text with phonetic markers  
WHEN the page loads  
THEN I see a help icon or "?" button near the phonetic text  
_Verified by:_ PhoneticGuideModal with comprehensive marker explanations

[x] **AC-2:** Open phonetic guide  
GIVEN I see the help icon  
WHEN I click on it  
THEN a modal or panel opens showing the phonetic symbols guide  
_Verified by:_ PhoneticGuideModal with comprehensive marker explanations

[x] **AC-3:** Symbol explanations  
GIVEN the phonetic guide is open  
WHEN I view the content  
THEN I see explanations for: `<` (3rd degree length), `?` (stress), `]` (palatalization), and other markers  
_Verified by:_ PhoneticGuideModal with comprehensive marker explanations

[x] **AC-4:** Examples provided  
GIVEN the phonetic guide is displayed  
WHEN I read through it  
THEN each symbol has example words showing its usage  
_Verified by:_ PhoneticGuideModal with comprehensive marker explanations

[x] **AC-5:** Close guide  
GIVEN the phonetic guide is open  
WHEN I click close or outside the modal  
THEN the guide closes and I return to the main view  
_Verified by:_ PhoneticGuideModal with comprehensive marker explanations

## Screenshot

![Phonetic Symbols Guide](../screenshots/US-024-view-phonetic-guide.png)

## Notes

**Reference prototype:** EKI-ui-prototype phonetic help modal  
**Edge cases:** Mobile view layout, printable version, multilingual support

