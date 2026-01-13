# TC-04: Audio Caching

**User Story:** US-03  
**Feature:** F01 Speech Synthesis  
**Priority:** High  
**Type:** Functional

## Description

Verify that audio is cached correctly and cache invalidation works.

## Pre-conditions

- [ ] Application loaded at `/`
- [ ] Network tab open in browser DevTools

## Test Steps

### Cache Hit (Same Text)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "Tere" and press Enter | Network shows /api/analyze and /api/synthesize calls | ☐ |
| 2 | Wait for audio to complete | Audio finishes | ☐ |
| 3 | Press Enter again | NO new network calls (cached) | ☐ |
| 4 | Observe playback | Audio plays immediately (no loading) | ☐ |

### Cache Invalidation (Text Changed)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With "Tere" cached, add " päevast" | Text now "Tere päevast" | ☐ |
| 2 | Press Enter | New network calls made (cache invalidated) | ☐ |
| 3 | Audio plays | New synthesis with full sentence | ☐ |

### Cache Invalidation (Variant Selected)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "kooli" and synthesize | Audio cached | ☐ |
| 2 | Click on "kooli" tag | Variants panel opens | ☐ |
| 3 | Select different variant | Cache should be invalidated | ☐ |
| 4 | Press Enter | New synthesis with variant pronunciation | ☐ |

### Cache Invalidation (Phonetic Edit)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Synthesize any text | Audio cached | ☐ |
| 2 | Open "Uuri foneetilist kuju" | Phonetic panel opens | ☐ |
| 3 | Edit phonetic text and apply | Cache should be invalidated | ☐ |
| 4 | Press Enter | New synthesis with edited phonetic | ☐ |

## Cache State Verification

Check browser console or React DevTools for sentence state:

```javascript
{
  text: "Tere",
  phoneticText: "Tere",      // Cached phonetic
  audioUrl: "blob:...",       // Cached audio blob URL
}
```

After invalidation:
```javascript
{
  text: "Tere päevast",
  phoneticText: undefined,   // Cleared
  audioUrl: undefined,        // Cleared
}
```

## Notes

- Cache includes both phonetic text and audio blob URL
- Any text modification invalidates both
- Variant/phonetic changes invalidate audio only (phonetic may persist)
