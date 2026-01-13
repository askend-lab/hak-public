# TC-06: View Variants Panel

**User Story:** US-05  
**Feature:** F02 Pronunciation Variants  
**Priority:** Critical  
**Type:** Happy Path

## Description

Verify that clicking "Uuri variandid" from tag menu shows inline loading spinner, opens panel with variants on success, or shows toast notification on failure.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Text entered and synthesized: "Noormees läks kooli"
- [ ] Tags visible: [Noormees] [läks] [kooli]

## Test Steps

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click on "kooli" tag | Dropdown menu opens with options | ☐ |
| 2 | Click "Uuri variandid" | Menu closes, chevron replaced with spinner | ☐ |
| 3 | Observe loading | Small spinner visible in tag (replaces chevron) | ☐ |
| 4 | Wait for response | Spinner stops, panel slides in from right | ☐ |
| 5 | Verify header | Shows "kooli" as the word | ☐ |
| 6 | Verify variants list | Multiple pronunciation variants displayed | ☐ |
| 7 | Verify variant format | Each shows phonetic form with UI markers | ☐ |
| 8 | Verify tags | Descriptive tags (e.g., "kolmas välde") shown | ☐ |
| 9 | Verify buttons | Each variant has play and "Kasuta" buttons | ☐ |
| 10 | Click X button | Panel closes | ☐ |

## Variant Display Verification

For word "kooli", expect variants like:
- `kooli` with tag "rõhk esimesel silbil"
- `k`ooli` with tag "kolmas välde"

## UI Markers Displayed

| Vabamorf | UI | Meaning |
|----------|-----|---------|
| `<` | `` ` `` | Third pitch accent |
| `?` | `´` | Irregular stress |
| `]` | `'` | Palatalization |
| `_` | `+` | Compound boundary |

## Edge Cases

### Inline Loading Spinner Verification

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 11 | Click on any word tag, then "Uuri variandid" | Tag dropdown menu closes | ☐ |
| 12 | Observe tag immediately | Chevron replaced with small rotating spinner | ☐ |
| 13 | Wait for response | Spinner stops, chevron restored | ☐ |
| 14 | Verify spinner size | Spinner is approximately same size as chevron (12x12px) | ☐ |

### No Variants Found (Toast Notification)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 15 | Enter non-Estonian word (e.g., "hello") in text input | Word appears as tag | ☐ |
| 16 | Click on "hello" tag, then "Uuri variandid" | Spinner shows in tag | ☐ |
| 17 | Wait for response | Spinner stops, panel does NOT open | ☐ |
| 18 | Observe toast notification | Warning toast appears in top-right | ☐ |
| 19 | Verify toast color | Toast has orange/warning styling (not red/error) | ☐ |
| 20 | Verify toast title | Shows "Variante ei leitud" | ☐ |
| 21 | Verify toast description | Shows "Sõna ei leidu eesti keeles või on valesti kirjutatud." | ☐ |
| 22 | Verify toast auto-dismiss | Toast disappears after ~4 seconds | ☐ |
| 23 | Repeat with misspelled word (e.g., "koooli") | Same toast notification behavior | ☐ |

### Timeout Behavior (10 seconds)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 24 | Simulate slow network or block API | Request takes >10 seconds | ☐ |
| 25 | Observe behavior at 10s | Spinner stops, request aborted | ☐ |
| 26 | Verify error toast | Shows "Päring aegus" with red/error styling | ☐ |

### Other Edge Cases

- [ ] Word with single variant: Panel opens with single variant
- [ ] Word with many variants: All displayed in panel (scrollable if needed)
- [ ] Non-Estonian text (French, German, etc.): Toast notification, no panel

## Notes

- Variants come from `/api/variants` endpoint
- Duplicate phonetic forms are filtered out
- Custom phonetic form shown if previously applied

## Technical Implementation

### Loading Flow

1. User clicks "Uuri variandid" from tag dropdown menu
2. `loadingVariantsTag` state set → spinner shown in tag
3. Fetch request sent to `/api/variants` with 10s AbortController timeout
4. Response handling:
   - **Variants found**: Open panel, stop spinner
   - **Empty variants**: Show warning toast, stop spinner, NO panel
   - **Timeout**: Abort request, show error toast, stop spinner
   - **Network error**: Show error toast, stop spinner

### API Response Mapping

| Scenario | Vabamorf Response | API Response | UI Result |
|----------|-------------------|--------------|-----------|
| Estonian word (e.g., "kooli") | 200 with variants | `{ word, variants: [...] }` | Panel opens with variants |
| Non-Estonian word (e.g., "hello") | Non-200 (word not found) | `{ word, variants: [] }` | Warning toast notification |
| Misspelled word (e.g., "koooli") | Non-200 (word not found) | `{ word, variants: [] }` | Warning toast notification |
| Timeout (>10s) | N/A | AbortError | Error toast notification |
| Network/service error | Connection failure | 500 error | Error toast notification |
