# US-04: Download Audio as WAV

**Feature:** F01 Speech Synthesis  
**Priority:** High

## User Story

As a **language teacher**  
I want to **download synthesized audio as a WAV file**  
So that **I can use it in teaching materials or share it offline**

## Acceptance Criteria

- [x] **AC-1:** Download option is available in the sentence menu (three-dot menu)
- [x] **AC-2:** Clicking download generates audio if not already cached
- [x] **AC-3:** Download triggers browser file save dialog
- [x] **AC-4:** Downloaded file is in WAV format
- [x] **AC-5:** Filename is based on the sentence text (e.g., "Tere päevast.wav")
- [x] **AC-6:** Download option is disabled when sentence has no text

## UI Behavior

### Access Download

1. Enter text and optionally play it
2. Click the three-dot menu (⋯) on the sentence row
3. Select "Lae alla .wav fail" (Download .wav file)

### Download Flow

**With Cached Audio:**
1. Click download option
2. Audio blob is fetched from cached URL
3. Browser file save dialog appears
4. File downloads as `{text}.wav`

**Without Cached Audio:**
1. Click download option
2. System synthesizes audio (brief wait)
3. Audio is cached
4. Browser file save dialog appears
5. File downloads

### Sentence Menu Structure

```
⋯ Menu
├── Lisa ülesandesse (Add to task) - requires authentication
├── Uuri häälduskuju (Explore phonetic form)
├── Lae alla .wav fail (Download .wav file)
├── Kopeeri tekst (Copy text)
└── Eemalda (Remove)
```

### Menu Item States

| Menu Item | Condition | State |
|-----------|-----------|-------|
| Lisa ülesandesse | Not authenticated | Shows login prompt |
| Lisa ülesandesse | Authenticated, no text | Disabled |
| Lisa ülesandesse | Authenticated, has text | Enabled, shows task list |
| Uuri häälduskuju | No text | Disabled |
| Uuri häälduskuju | Has text | Enabled |
| Lae alla .wav fail | No text | Disabled |
| Lae alla .wav fail | Has text | Enabled |
| Kopeeri tekst | No text | Disabled |
| Kopeeri tekst | Has text | Enabled |
| Eemalda | Always | Enabled |

## File Naming

| Text | Filename |
|------|----------|
| `Tere` | `Tere.wav` |
| `Tere päevast` | `Tere päevast.wav` |
| `Noormees läks kooli` | `Noormees läks kooli.wav` |

## Related Test Cases

- [TC-01: Basic Synthesis Flow](../../02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md)

## Notes

- Download is available for individual sentences only
- For downloading entire task audio, see Task Management features
- WAV format is uncompressed for maximum quality
- "Kopeeri tekst" copies the sentence text to clipboard with success notification
- When not authenticated, "Lisa ülesandesse" triggers login flow instead of showing task list
