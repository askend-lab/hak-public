# US-05: View Pronunciation Variants

**Feature:** F02 Pronunciation Variants  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **view alternative pronunciation variants for a word**  
So that **I can understand different ways the word can be pronounced**

## Acceptance Criteria

- [ ] **AC-1:** Clicking "Uuri variandid" from tag menu initiates variant loading
- [ ] **AC-2:** During loading, word tag shows inline spinner replacing chevron
- [ ] **AC-3:** If variants found, panel slides in from the right side of the screen
- [ ] **AC-4:** Variants are fetched from `/api/variants` endpoint with 10-second timeout
- [ ] **AC-5:** Each variant displays its phonetic form (with UI-friendly markers)
- [ ] **AC-6:** Each variant shows descriptive tags (e.g., "kolmas välde", "palatalisatsioon")
- [ ] **AC-7:** If no variants found, toast notification shows warning message
- [ ] **AC-8:** If request times out (10s), toast notification shows timeout error
- [ ] **AC-9:** Panel can be closed with X button
- [ ] **AC-10:** Currently selected variant (if any) is highlighted
- [ ] **AC-11:** Panel header shows the selected word

## UI Behavior

### Opening the Panel

1. User has text with word tags displayed
2. User clicks on a word tag, opens dropdown menu
3. User selects "Uuri variandid" from the menu
4. Menu closes, word tag's chevron is replaced with a small spinner
5. System fetches variants from `/api/variants` (max 10 seconds)
6. **If variants found:** Spinner stops, panel slides in from right with variants list
7. **If no variants:** Spinner stops, toast notification appears: "Variante ei leitud"
8. **If timeout/error:** Spinner stops, toast notification appears with error message

### Variant Display

Each variant item shows:
- Phonetic text with UI markers (e.g., `k`ooli`)
- Descriptive tags explaining the phonetic features
- Play button to preview
- "Kasuta" (Use) button to apply

### Phonetic Marker Transformation

| Vabamorf Format | UI Display | Meaning |
|-----------------|------------|---------|
| `<` | `` ` `` | Third pitch accent (kolmas välde) |
| `?` | `´` | Irregular stress (ebareeglipärane rõhk) |
| `]` | `'` | Palatalization (palatalisatsioon) |
| `_` | `+` | Compound word boundary (liitsõna piir) |

### Example Variants

For word "kooli":
```
1. kooli
   Tags: [rõhk esimesel silbil]
   
2. k`ooli
   Tags: [kolmas välde]
```

## Visual States

### Word Tag Loading State (Inline Spinner)

When user clicks "Uuri variandid", the chevron in the word tag is replaced with a small spinner:

```
Before click:  [kooli ▼]
During load:   [kooli ◌]  ← Small spinner replaces chevron
After success: [kooli ▼]  ← Chevron restored, panel opens
After error:   [kooli ▼]  ← Chevron restored, toast appears
```

### Panel Structure (Success State)

```
┌─────────────────────────────┐
│ kooli                    [X]│ ← Header with close button
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ kooli                   │ │
│ │ [rõhk esimesel silbil]  │ │
│ │           [▶] [Kasuta]  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ k`ooli                  │ │
│ │ [kolmas välde]          │ │
│ │           [▶] [Kasuta]  │ │
│ └─────────────────────────┘ │
│                             │
│ [Loo oma variant]           │ ← Link to custom variant form
└─────────────────────────────┘
```

### Toast Notifications (Error/Edge Cases)

| Scenario | Type | Color | Title | Description |
|----------|------|-------|-------|-------------|
| No variants found | Warning | Orange | "Variante ei leitud" | "Sõna ei leidu eesti keeles või on valesti kirjutatud." |
| Request timeout | Error | Red | "Päring aegus" | "Variantide laadimine võttis liiga kaua." |
| Network/API error | Error | Red | "Variantide laadimine ebaõnnestus" | "Sõna ei leidu eesti keeles või on valesti kirjutatud." |

## Related Test Cases

- [TC-06: View Variants Panel](../../02-TEST-CASES/F02-pronunciation-variants/TC-06-view-variants.md)

## Technical Notes

### API Behavior

The `/api/variants` endpoint calls the Vabamorf morphological analysis service:

- **Estonian words**: Vabamorf returns pronunciation variants with phonetic markers
- **Non-Estonian/unknown words**: Vabamorf returns a non-200 response; the API gracefully returns `{ word, variants: [] }` instead of an error
- **Network errors**: API returns 500 with error message

### Loading Flow

1. User clicks "Uuri variandid" → inline spinner shown in tag
2. Request sent with 10-second AbortController timeout
3. **Success with variants**: Stop spinner, open panel
4. **Success with empty variants**: Stop spinner, show warning toast (panel NOT opened)
5. **Timeout (AbortError)**: Stop spinner, abort request, show error toast
6. **Network error**: Stop spinner, show error toast

This approach:
- Saves screen space by not opening panel when no variants exist
- Provides clear, non-blocking feedback via toast notifications
- Uses familiar inline loading pattern (spinner in place)

### UI Notes

- Variants are filtered to show only phonetically unique options
- If the word already has a custom variant applied, that form is pre-selected
- Panel remains open while user explores different variants
- Panel only opens when variants are successfully loaded
