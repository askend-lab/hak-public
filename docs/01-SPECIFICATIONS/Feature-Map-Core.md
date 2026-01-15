# Feature Map - Core Features

**Features F01-F04:** Speech synthesis, variants, phonetics, and playlist

---

## F01: Speech Synthesis (Kõnesüntees)

**Description:** User inputs Estonian text and receives synthesized audio with correct pronunciation. The system uses Vabamorf for morphological analysis and Merlin TTS for speech synthesis.

**Components:** `app/page.tsx`, `/api/analyze`, `/api/synthesize`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-01](01-USER-STORIES/F01-speech-synthesis/US-01-text-input.md) | Enter text with tag-based input | Critical |
| [US-02](01-USER-STORIES/F01-speech-synthesis/US-02-synthesize-audio.md) | Synthesize and play audio | Critical |
| [US-03](01-USER-STORIES/F01-speech-synthesis/US-03-playback-control.md) | Control audio playback | Critical |
| [US-04](01-USER-STORIES/F01-speech-synthesis/US-04-download-audio.md) | Download audio as WAV | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-01](02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md) | Basic synthesis flow | Happy Path |
| [TC-02](02-TEST-CASES/F01-speech-synthesis/TC-02-input-behaviors.md) | Input behaviors | Functional |
| [TC-03](02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md) | Audio playback states | Functional |
| [TC-04](02-TEST-CASES/F01-speech-synthesis/TC-04-caching.md) | Audio caching | Functional |
| [TC-05](02-TEST-CASES/F01-speech-synthesis/TC-05-edge-cases.md) | Edge cases | Edge Case |

---

## F02: Pronunciation Variants (Häälduse variandid)

**Description:** Users can click on words to view alternative pronunciation variants, preview each variant's audio, select a variant to apply, or create custom phonetic variants.

**Components:** `PronunciationVariants.tsx`, `/api/variants`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-05](01-USER-STORIES/F02-pronunciation-variants/US-05-view-variants.md) | View pronunciation variants | Critical |
| [US-06](01-USER-STORIES/F02-pronunciation-variants/US-06-preview-variant.md) | Preview variant audio | Critical |
| [US-07](01-USER-STORIES/F02-pronunciation-variants/US-07-select-variant.md) | Select and apply variant | Critical |
| [US-08](01-USER-STORIES/F02-pronunciation-variants/US-08-custom-variant.md) | Create custom phonetic variant | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-06](02-TEST-CASES/F02-pronunciation-variants/TC-06-view-variants.md) | View variants panel | Happy Path |
| [TC-07](02-TEST-CASES/F02-pronunciation-variants/TC-07-preview-select.md) | Preview and select variant | Functional |
| [TC-08](02-TEST-CASES/F02-pronunciation-variants/TC-08-custom-variant.md) | Custom variant creation | Functional |

---

## F03: Sentence Phonetic Panel (Lause foneetiline kuju)

**Description:** Users can explore and directly edit the phonetic form of an entire sentence, using phonetic markers to fine-tune pronunciation.

**Components:** `SentencePhoneticPanel.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-09](01-USER-STORIES/F03-sentence-phonetic/US-09-view-phonetic.md) | View sentence phonetic form | High |
| [US-10](01-USER-STORIES/F03-sentence-phonetic/US-10-edit-phonetic.md) | Edit phonetic markers | High |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-09](02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md) | Phonetic panel operations | Functional |

---

## F04: Playlist Management (Esitusloend)

**Description:** Users can create and manage multiple sentences as a playlist, reorder them via drag-and-drop, and play all sequentially.

**Components:** `app/page.tsx` (sentences state), `SentenceSynthesisItem.tsx`

### User Stories

| ID | Title | Priority |
|----|-------|----------|
| [US-11](01-USER-STORIES/F04-playlist/US-11-add-sentences.md) | Add multiple sentences | High |
| [US-12](01-USER-STORIES/F04-playlist/US-12-reorder-sentences.md) | Reorder sentences | High |
| [US-13](01-USER-STORIES/F04-playlist/US-13-play-all.md) | Play all sequentially | High |
| [US-14](01-USER-STORIES/F04-playlist/US-14-manage-sentences.md) | Manage sentences (duplicate, delete, clear) | Medium |

### Test Cases

| ID | Title | Type |
|----|-------|------|
| [TC-10](02-TEST-CASES/F04-playlist/TC-10-playlist-management.md) | Playlist operations | Functional |
| [TC-11](02-TEST-CASES/F04-playlist/TC-11-play-all.md) | Sequential playback | Functional |

---

**See also:**
- [Feature Map Index](./Feature-Map-Index.md)
- [User Management Features](./Feature-Map-UserManagement.md)
