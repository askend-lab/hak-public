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
| 2 | Wait for audio to complete | Audio finishes, button returns to play | ☐ |
| 3 | Press Enter again | NO new network calls (cached) | ☐ |
| 4 | Observe playback | Audio plays immediately (no loading spinner) | ☐ |

### Cache Invalidation (Text Changed - Add Tag)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With "Tere" cached, type "päevast" and press Space | New tag added [päevast] | ☐ |
| 2 | Press Enter | New network calls made (cache invalidated) | ☐ |
| 3 | Audio plays | New synthesis with full sentence | ☐ |

### Cache Invalidation (Text Changed - Remove Tag)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With [Tere] [päevast] cached | Two tags, audio cached | ☐ |
| 2 | Click [päevast] tag, select "Kustuta sõna" | Tag removed | ☐ |
| 3 | Press Enter | New network calls made (cache invalidated) | ☐ |
| 4 | Audio plays | Single word synthesis | ☐ |

### Cache Invalidation (Tag Edited)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | With [koer] cached | Audio for "koer" cached | ☐ |
| 2 | Click tag, select "Muuda sõna kirjakuju" | Edit mode active | ☐ |
| 3 | Change to "kass" and press Enter | Cache invalidated, new synthesis | ☐ |
| 4 | Network tab | Shows new API calls | ☐ |

### Cache Invalidation (Variant Selected)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Enter "kooli" and synthesize | Audio cached | ☐ |
| 2 | Click on "kooli" tag | Tag menu opens | ☐ |
| 3 | Select "Vali sõna häälduskuju" | Variants panel opens | ☐ |
| 4 | Select different variant | Cache should be invalidated | ☐ |
| 5 | Press Enter | New synthesis with variant pronunciation | ☐ |

### Cache Invalidation (Phonetic Edit)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1 | Synthesize any text | Audio cached | ☐ |
| 2 | Open sentence menu (⋯), select "Uuri häälduskuju" | Phonetic panel opens | ☐ |
| 3 | Edit phonetic text and apply | Cache should be invalidated | ☐ |
| 4 | Press Enter | New synthesis with edited phonetic | ☐ |

## Cache State Verification

Check browser console or React DevTools for sentence state:

**Cached state:**
```javascript
{
  text: "Tere",
  tags: ["Tere"],
  phoneticText: "Tere",      // Cached phonetic
  audioUrl: "blob:...",      // Cached audio URL
}
```

**After invalidation:**
```javascript
{
  text: "Tere päevast",
  tags: ["Tere", "päevast"],
  phoneticText: undefined,   // Cleared
  audioUrl: undefined,       // Cleared
}
```

## Notes

- Cache includes both phonetic text and audio URL
- Any text modification invalidates both phoneticText and audioUrl
- Variant selection updates stressedTags and invalidates audioUrl
- Phonetic edits update phoneticText and invalidate audioUrl
