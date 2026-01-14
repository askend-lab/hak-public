# UJ-02: Learner Workflow

**Type:** End-to-End User Journey  
**Priority:** Critical  
**Duration:** 5-10 minutes

## Overview

A language learner practices pronunciation by entering words, listening to synthesis, and exploring pronunciation variants.

## Persona

**Sasha** - Estonian language learner  
- Learning Estonian as second language
- Wants to hear correct pronunciation
- Interested in understanding stress patterns

## Journey Map

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Complete    │ ──► │Enter Text   │ ──► │Explore      │ ──► │Practice     │
│ Onboarding  │     │& Listen     │     │Variants     │     │Playlist     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Fresh browser (no previous session) OR click help button
- [ ] Backend services running

## Journey Steps

### Phase 1: Onboarding

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Navigate to application | Role selection page appears | ☐ |
| 2 | Read role options | Three roles visible | ☐ |
| 3 | Click "Õppija" (Learner) | Role selected | ☐ |
| 4 | Complete wizard (or skip) | Main view visible | ☐ |
| 5 | Observe demo sentences | Pre-filled sentences visible | ☐ |

### Phase 2: Try Demo Sentence

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 6 | Press Enter on demo sentence | Audio synthesizes and plays | ☐ |
| 7 | Listen to pronunciation | Correct Estonian pronunciation | ☐ |
| 8 | Press Enter again | Audio replays from cache | ☐ |

### Phase 3: Enter Own Text

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 9 | Click in empty sentence row | Cursor appears | ☐ |
| 10 | Type "mees" | Text visible | ☐ |
| 11 | Press Enter | Audio plays "mees" | ☐ |
| 12 | Clear and type "Mees läks poodi" | New text | ☐ |
| 13 | Press Enter | Sentence plays | ☐ |

### Phase 4: Explore Variants

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 14 | Click on "mees" tag | Variants panel opens | ☐ |
| 15 | Read variant explanations | Tags like "kolmas välde" | ☐ |
| 16 | Click play on first variant | Pronunciation plays | ☐ |
| 17 | Click play on second variant | Different pronunciation | ☐ |
| 18 | Compare the sounds | Hear the difference | ☐ |
| 19 | Select preferred variant | Click "Kasuta" | ☐ |
| 20 | Close panel | Returns to main | ☐ |
| 21 | Press Enter | Sentence with selected variant | ☐ |

### Phase 5: Build Playlist

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 22 | Click "Lisa lause" | New row | ☐ |
| 23 | Enter "Poiss õpib koolis" | Second sentence | ☐ |
| 24 | Press Enter | Audio plays | ☐ |
| 25 | Click "Lisa lause" | Third row | ☐ |
| 26 | Enter "Ta on tubli" | Third sentence | ☐ |
| 27 | Press Enter | Audio plays | ☐ |

### Phase 6: Sequential Practice

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 28 | Click "Mängi kõik (3)" | Sequential playback starts | ☐ |
| 29 | Listen to all sentences | Play in order | ☐ |
| 30 | Observe visual indicators | Current sentence highlighted | ☐ |
| 31 | Click "Peata" (optional) | Playback stops | ☐ |

### Phase 7: Explore Phonetic Form (Advanced)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 32 | Click ⋯ menu on a sentence | Menu opens | ☐ |
| 33 | Select "Uuri foneetilist kuju" | Phonetic panel opens | ☐ |
| 34 | View phonetic markers | See stress/pitch markers | ☐ |
| 35 | Close panel | Return to main view | ☐ |

## Success Criteria

- [ ] Successfully completed or skipped onboarding
- [ ] Entered and heard own text
- [ ] Explored and compared pronunciation variants
- [ ] Built playlist with multiple sentences
- [ ] Used "Play All" for sequential practice

## Features Covered

| Feature | User Stories |
|---------|-------------|
| F01 Speech Synthesis | US-01, US-02, US-03 |
| F02 Pronunciation Variants | US-05, US-06, US-07 |
| F03 Sentence Phonetic | US-09 |
| F04 Playlist | US-11, US-13 |
| F08 Onboarding | US-25, US-26 |

## Notes

- No authentication required for basic learning
- Learner can save to task if they login later
- Focus is on exploration and listening
