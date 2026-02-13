# TC-06: View Variants Panel

**User Story:** US-05  
**Feature:** F02 Pronunciation Variants  
**Priority:** Critical  
**Type:** Happy Path

## Description

Verify that clicking "Vali sõna häälduskuju" from tag menu shows inline loading spinner, opens panel with variants on success, or shows error on failure.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Text entered and synthesized: "Noormees läks kooli"
- [ ] Tags visible: [Noormees] [läks] [kooli]

## Test Steps

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Click on "kooli" tag | Dropdown menu opens with options | ☐ |
| 2 | Verify menu options | "Vali sõna häälduskuju", "Muuda sõna kirjakuju", "Kustuta sõna" visible | ☐ |
| 3 | Click "Vali sõna häälduskuju" | Menu closes, chevron replaced with spinner | ☐ |
| 4 | Observe loading | Small spinner visible in tag (replaces chevron) | ☐ |
| 5 | Wait for response | Spinner stops, panel slides in from right | ☐ |
| 6 | Verify header | Shows "kooli" as the word with X close button | ☐ |
| 7 | Verify variants list | Multiple pronunciation variants displayed | ☐ |
| 8 | Verify variant format | Each shows phonetic form with UI markers (e.g., k`ooli) | ☐ |
| 9 | Verify tags | Descriptive tags (e.g., "kolmas välde") shown | ☐ |
| 10 | Verify explanation | Each variant has speaker icon with explanation | ☐ |
| 11 | Verify buttons | Each variant has play and "Kasuta" buttons | ☐ |
| 12 | Click X button | Panel closes | ☐ |

## Variant Display Verification

For word "kooli", expect variants like:
- `kooli` with tag "rõhk esimesel silbil" and explanation
- `k`ooli` with tag "kolmas välde" and explanation "'O' on pikk"

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
| 13 | Click on any word tag, then "Vali sõna häälduskuju" | Tag dropdown menu closes | ☐ |
| 14 | Observe tag immediately | Chevron replaced with small rotating spinner | ☐ |
| 15 | Wait for response | Spinner stops, chevron restored | ☐ |

### Error Handling

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 16 | Enter non-Estonian word (e.g., "hello") in text input | Word appears as tag | ☐ |
| 17 | Click on "hello" tag, then "Vali sõna häälduskuju" | Spinner shows in tag | ☐ |
| 18 | Wait for response | Spinner stops, panel opens with error or empty state | ☐ |

### Other Edge Cases

- [ ] Word with single variant: Panel opens with single variant
- [ ] Word with many variants: All displayed in panel (scrollable if needed)
- [ ] Duplicate phonetic variants: Filtered to show only unique variants

## Notes

- Variants come from `/api/variants` endpoint
- Duplicate phonetic forms are filtered out
- Custom phonetic form shown as selected if previously applied
