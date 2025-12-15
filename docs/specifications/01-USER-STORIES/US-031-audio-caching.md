# US-031: Audio performance optimization (caching)

**Feature:** F-001  
**Status:** [✅] Implemented in Prototype  
**Priority:** High (Performance)

## User Story

As a **language learner**  
I want **synthesized audio to load quickly when revisiting the same text**  
So that **I can practice efficiently without waiting for re-synthesis**

## Acceptance Criteria

[✅] **AC-1:** Audio generated once per unique text  
GIVEN I have synthesized audio for a text  
WHEN I play the same text again  
THEN the cached audio plays immediately (<100ms)  
_Verified by:_ Prototype - audio caching in SentenceState

[✅] **AC-2:** Cache validation on text change  
GIVEN I have cached audio for a text  
WHEN I modify the text or phonetic markers  
THEN the cache is automatically invalidated  
_Verified by:_ Prototype - cache cleared on text changes

[✅] **AC-3:** Cache stores phonetic text  
GIVEN audio has been synthesized  
WHEN caching the audio  
THEN both audio blob and phonetic text are cached together  
_Verified by:_ Prototype - audioUrl + phoneticText in state

[✅] **AC-4:** Automatic retry on cache corruption  
GIVEN cached audio fails to play  
WHEN playback error is detected  
THEN system invalidates cache and regenerates audio once  
_Verified by:_ Prototype - retry mechanism in playSingleSentence

[✅] **AC-5:** Memory cleanup on unmount  
GIVEN audio URLs have been created  
WHEN component unmounts or entries are deleted  
THEN blob URLs are revoked to free memory  
_Verified by:_ Prototype - URL.revokeObjectURL() calls

[✅] **AC-6:** Cache used for download  
GIVEN I want to download audio  
WHEN cached audio exists  
THEN download uses cached version without re-synthesis  
_Verified by:_ Prototype - handleDownload checks audioUrl first

## Technical Implementation

**State Structure:**
```typescript
interface SentenceState {
  id: string;
  text: string;
  phoneticText?: string;  // Cached phonetic form from Vabamorf
  audioUrl?: string;      // Cached audio blob URL
  // ... other properties
}
```

**Cache Validation:**
```typescript
// Use cache if text matches and audio exists
if (sentence.audioUrl && sentence.phoneticText && sentence.text === text) {
  playFromCache();
} else {
  regenerateAndCache();
}
```

**Cache Invalidation:**
```typescript
// Clear cache when text changes
setSentences(prev =>
  prev.map(s => s.id === id
    ? { ...s, text: newText, phoneticText: undefined, audioUrl: undefined }
    : s
  )
);
```

**Retry on Error:**
```typescript
audio.onerror = () => {
  if (retryCount === 0 && sentence.audioUrl) {
    // Invalidate cache and retry once
    invalidateCache(id);
    setTimeout(() => playSingleSentence(id, abortSignal, 1), 100);
  } else {
    console.error('Audio playback failed after retry');
  }
};
```

## Screenshot

_See Synthesis View with instant playback on repeat_

## Notes

**Reference prototype:** EKI2 - audio caching in page.tsx and playSingleSentence  
**Performance impact:** ~95% reduction in synthesis time for repeated text  
**Edge cases:**
- Cache corruption (handled with retry)
- Browser memory limits (URLs cleaned up)
- Multiple instances of same text (each cached separately)
- Session persistence (cache lost on page reload - intentional)

## Benefits

- **Faster practice:** Immediate playback for repeated texts
- **Reduced API load:** Fewer calls to Vabamorf and Merlin services
- **Better UX:** No loading spinner on cache hits
- **Cost savings:** Reduced synthesis API usage

## Future Enhancements

- localStorage persistence for cross-session caching
- Cache size limits and LRU eviction
- Preemptive caching for common phrases
- Compression for cached audio blobs
