import { useSynthesisAudioStore } from './audioStore';

describe('useSynthesisAudioStore', () => {
  beforeEach(() => {
    useSynthesisAudioStore.setState({
      result: null,
      audioElement: null,
      isPlaying: false,
    });
  });

  it('should set result', () => {
    const result = { originalText: 'test', phoneticText: 'test', audioUrl: 'test.mp3', audioHash: 'abc', voiceModel: 'efm_s' as const, cached: false };
    useSynthesisAudioStore.getState().setResult(result);
    expect(useSynthesisAudioStore.getState().result).toStrictEqual(result);
  });

  it('should set audio element', () => {
    const audio = new Audio();
    useSynthesisAudioStore.getState().setAudioElement(audio);
    expect(useSynthesisAudioStore.getState().audioElement).toBe(audio);
  });

  it('should set isPlaying', () => {
    useSynthesisAudioStore.getState().setIsPlaying(true);
    expect(useSynthesisAudioStore.getState().isPlaying).toBe(true);
  });

  it('should reset audio to initial state', () => {
    useSynthesisAudioStore.setState({
      result: { originalText: 'test', phoneticText: 'test', audioUrl: 'test.mp3', audioHash: 'abc', voiceModel: 'efm_s' as const, cached: false },
      audioElement: new Audio(),
      isPlaying: true,
    });
    useSynthesisAudioStore.getState().resetAudio();
    expect(useSynthesisAudioStore.getState().result).toBeNull();
    expect(useSynthesisAudioStore.getState().audioElement).toBeNull();
    expect(useSynthesisAudioStore.getState().isPlaying).toBe(false);
  });
});
