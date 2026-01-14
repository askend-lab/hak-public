# US-04: Download Audio as WAV

**Feature:** F01 Speech Synthesis  
**Priority:** High

## User Story

As a **language teacher**  
I want to **download synthesized audio as a WAV file**  
So that **I can use it in teaching materials or share it offline**

## Acceptance Criteria

- [ ] **AC-1:** Download option is available in the sentence menu (three-dot menu)
- [ ] **AC-2:** Clicking download generates audio if not already cached
- [ ] **AC-3:** Download triggers browser file save dialog
- [ ] **AC-4:** Downloaded file is in WAV format
- [ ] **AC-5:** Filename is based on the sentence text (e.g., "Tere päevast.wav")
- [ ] **AC-6:** Download option is disabled when sentence has no text

## UI Behavior

### Access Download

1. Enter text and optionally play it
2. Click the three-dot menu (⋯) on the sentence row
3. Select "Lae alla .wav fail" (Download .wav file)

### Download Flow

**With Cached Audio:**
1. Click download option
2. Browser file save dialog appears
3. File downloads as `{text}.wav`

**Without Cached Audio:**
1. Click download option
2. System synthesizes audio (brief wait)
3. Audio is cached
4. Browser file save dialog appears
5. File downloads

### Menu Structure

```
⋯ Menu
├── Lisa ülesandesse (Add to task)
├── Uuri foneetilist kuju (Explore phonetic form)
├── Lae alla .wav fail (Download .wav file)
└── Eemalda (Remove)
```

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
