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
| 1 | With empty input, press Enter | Nothing happens (no synthesis) | ☐ |
| 2 | With empty input, click play | Nothing happens (no synthesis) | ☐ |

### Only Whitespace

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type only spaces "   " | Spaces visible in input | ☐ |
| 2 | Press Enter | Nothing happens (whitespace ignored) | ☐ |

### Special Characters Only

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Type "!!!" | Text in input | ☐ |
| 2 | Press Enter | Creates tag, attempts synthesis | ☐ |
| 3 | Observe result | May produce empty audio or error | ☐ |

### Very Long Text

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Paste 500+ character Estonian text | Text displayed as tags | ☐ |
| 2 | Press Enter | Synthesis starts (may take longer) | ☐ |
| 3 | Wait for completion | Audio plays successfully | ☐ |

### Mixed Language

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "Hello tere world" | Three tags created | ☐ |
| 2 | Press Enter | Synthesis completes | ☐ |
| 3 | Listen | Estonian pronunciation attempted for all | ☐ |

### Numbers

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "123" | Tag created | ☐ |
| 2 | Press Enter | Synthesis attempted | ☐ |
| 3 | Observe | May pronounce as Estonian numbers | ☐ |

### Estonian Special Characters

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

### Network Error

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Stop backend services | Services unavailable | ☐ |
| 2 | Try to synthesize | Loading state appears | ☐ |
| 3 | Wait | Error notification or loading stops | ☐ |
| 4 | Restart services and retry | Synthesis works | ☐ |

## Notes

- Edge cases should fail gracefully (no crashes)
- Error messages should be user-friendly (Estonian)
- Very long text may have performance implications
