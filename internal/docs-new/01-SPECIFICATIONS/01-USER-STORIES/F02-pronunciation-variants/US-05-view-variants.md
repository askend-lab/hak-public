# US-05: View Pronunciation Variants

**Feature:** F02 Pronunciation Variants  
**Priority:** Critical

## User Story

As a **language learner**  
I want to **view alternative pronunciation variants for a word**  
So that **I can understand different ways the word can be pronounced**

## Acceptance Criteria

- [x] **AC-1:** Clicking "Vali sõna häälduskuju" from tag menu initiates variant loading
- [x] **AC-2:** During loading, word tag shows inline spinner replacing chevron
- [x] **AC-3:** If variants found, panel slides in from the right side of the screen
- [x] **AC-4:** Variants are fetched from `/api/variants` endpoint
- [x] **AC-5:** Each variant displays its phonetic form (with UI-friendly markers)
- [x] **AC-6:** Each variant shows descriptive tags (e.g., "kolmas välde", "peenendus")
- [x] **AC-7:** Each variant shows a pronunciation explanation (e.g., "'O' on pikk")
- [x] **AC-8:** If no variants found, error message shown in panel
- [x] **AC-9:** Panel can be closed with X button
- [x] **AC-10:** Currently selected variant (if any) is highlighted
- [x] **AC-11:** Panel header shows the selected word

## UI Behavior

### Opening the Panel

1. User has text with word tags displayed
2. User clicks on a word tag, opens dropdown menu
3. User selects "Vali sõna häälduskuju" from the menu
4. Menu closes, word tag's chevron is replaced with a small spinner
5. System fetches variants from `/api/variants`
6. **If variants found:** Spinner stops, panel slides in from right with variants list
7. **If error:** Spinner stops, error displayed in panel

### Variant Display

Each variant item shows:
- Phonetic text with UI markers (e.g., `k`ooli`)
- Descriptive tags explaining the phonetic features
- Pronunciation explanation with speaker icon
- Play button to preview
- "Kasuta" (Use) button to apply

### Phonetic Marker Transformation

| Vabamorf Format | UI Display | Meaning |
|-----------------|------------|---------|
| `<` | `` ` `` | Third pitch accent (kolmas välde) |
| `?` | `´` | Irregular stress (ebareeglipärane rõhk) |
| `]` | `'` | Softening (peenendus) |
| `_` | `+` | Compound word boundary (liitsõnapiir) |

### Example Variants

For word "kooli":
```
1. kooli
   Tags: [rõhk esimesel silbil]
   Explanation: Häälda nii, nagu on kirjutatud
   
2. k`ooli
   Tags: [kolmas välde]
   Explanation: "O" on pikk
```

## Visual States

### Word Tag Loading State (Inline Spinner)

When user clicks "Vali sõna häälduskuju", the chevron in the word tag is replaced with a small spinner:

```
Before click:  [kooli ▼]
During load:   [kooli ◌]  ← Small spinner replaces chevron
After success: [kooli ▼]  ← Chevron restored, panel opens
After error:   [kooli ▼]  ← Chevron restored, error in panel
```

### Panel Structure (Success State)

```
┌─────────────────────────────┐
│ kooli                    [X]│ ← Header with close button
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ kooli                   │ │
│ │ [rõhk esimesel silbil]  │ │
│ │ 🔊 Häälda nii, nagu...  │ │
│ │           [▶] [Kasuta]  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ k`ooli                  │ │
│ │ [kolmas välde]          │ │
│ │ 🔊 "O" on pikk          │ │
│ │           [▶] [Kasuta]  │ │
│ └─────────────────────────┘ │
│                             │
│ [Loo oma variant]           │ ← Link to custom variant form
└─────────────────────────────┘
```

## Related Test Cases

- [TC-06: View Variants Panel](../../02-TEST-CASES/F02-pronunciation-variants/TC-06-view-variants.md)

## Technical Notes

### API Behavior

The `/api/variants` endpoint calls the Vabamorf morphological analysis service:

- **Estonian words**: Vabamorf returns pronunciation variants with phonetic markers
- **Non-Estonian/unknown words**: May return empty variants or error
- **Network errors**: API returns error message

### Loading Flow

1. User clicks "Vali sõna häälduskuju" → inline spinner shown in tag
2. Request sent to `/api/variants`
3. **Success with variants**: Stop spinner, open panel
4. **Success with empty variants**: Stop spinner, open panel with empty state
5. **Error**: Stop spinner, show error in panel

### UI Notes

- Variants are filtered to show only phonetically unique options
- If the word already has a custom variant applied, that form is pre-selected
- Panel remains open while user explores different variants
