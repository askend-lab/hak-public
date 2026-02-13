# TC-05: Edge Cases

**User Story:** US-01, US-02  
**Feature:** F01 Speech Synthesis  
**Priority:** High  
**Type:** Edge Case

## Description

Verify handling of unusual inputs and boundary conditions.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Backend services running

## Test Cases

### Empty Input

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With empty input, press Enter | Nothing happens (no synthesis, no error) | ☐ |
| 2 | With empty input, observe play button | Button is disabled | ☐ |
| 3 | With empty input, click play | Nothing happens (button disabled) | ☐ |

### Only Whitespace

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type only spaces "   " | Spaces visible in input | ☐ |
| 2 | Press Enter | Nothing happens (whitespace treated as empty) | ☐ |
| 3 | Observe play button | Button remains disabled | ☐ |

### Special Characters Only

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type "!!!" | Text in input | ☐ |
| 2 | Press Enter | Creates tag [!!!], attempts synthesis | ☐ |
| 3 | Observe result | May produce audio or handle gracefully | ☐ |

### Very Long Text

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Paste 500+ character Estonian text | Text displayed in input | ☐ |
| 2 | Press Enter | Many tags created, synthesis starts | ☐ |
| 3 | Wait for completion | Audio plays successfully (may take longer) | ☐ |

### Mixed Language

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "Hello tere world" | Three tags created | ☐ |
| 2 | Press Enter | Synthesis completes | ☐ |
| 3 | Listen | Estonian pronunciation attempted for all words | ☐ |

### Numbers

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "123" | Tag created | ☐ |
| 2 | Press Enter | Synthesis attempted | ☐ |
| 3 | Observe | Numbers may be pronounced | ☐ |

### Estonian Special Characters (õ, ä, ö, ü)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "Üks õun käes" | Correctly displayed with õ, ä, ü | ☐ |
| 2 | Press Enter | Synthesis completes | ☐ |
| 3 | Listen | Correct Estonian pronunciation | ☐ |

### Punctuation

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "Tere! Kuidas läheb?" | Tags include punctuation | ☐ |
| 2 | Press Enter | Synthesis completes | ☐ |
| 3 | Listen | Appropriate pausing at punctuation | ☐ |

### Rapid Key Presses

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type word and press Enter multiple times quickly | Only one synthesis triggered | ☐ |
| 2 | Observe | No duplicate network calls or errors | ☐ |

### Network Error

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Stop backend services or disconnect network | Services unavailable | ☐ |
| 2 | Try to synthesize | Loading state appears | ☐ |
| 3 | Wait | Loading stops, button returns to play icon | ☐ |
| 4 | Restart services and retry | Synthesis works | ☐ |

### Browser Back/Forward

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter text and synthesize | Audio plays | ☐ |
| 2 | Navigate away and back | Session state may be restored from localStorage | ☐ |

## Notes

- Edge cases should fail gracefully (no crashes)
- Error messages should be user-friendly (Estonian)
- Very long text may have performance implications
- Session persistence uses localStorage for playlist entries
