/**
 * Synthesis hooks - split from useSynthesis.ts for SOLID compliance
 * Original file: 511 lines → split into 3 focused modules
 */
export { useSynthesisState, INITIAL_SENTENCE, ensureSentenceState } from './useSynthesisState';
export type { UseSynthesisStateReturn } from './useSynthesisState';

export { useSynthesisPlayback } from './useSynthesisPlayback';
export type { UseSynthesisPlaybackReturn } from './useSynthesisPlayback';

export { useSynthesisTagEdit } from './useSynthesisTagEdit';
export type { UseSynthesisTagEditReturn } from './useSynthesisTagEdit';
