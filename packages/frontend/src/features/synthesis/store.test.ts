import { useSynthesisStore } from './store';

describe('useSynthesisStore', () => {
  beforeEach(() => {
    useSynthesisStore.setState({
      text: '',
      phoneticText: '',
      isLoading: false,
      error: null,
      result: null,
      audioElement: null,
      isPlaying: false,
    });
  });

  it('should set text', () => {
    useSynthesisStore.getState().setText('Hello');
    expect(useSynthesisStore.getState().text).toBe('Hello');
  });

  it('should set phonetic text', () => {
    useSynthesisStore.getState().setPhoneticText('həˈloʊ');
    expect(useSynthesisStore.getState().phoneticText).toBe('həˈloʊ');
  });

  it('should set loading state', () => {
    useSynthesisStore.getState().setLoading(true);
    expect(useSynthesisStore.getState().isLoading).toBe(true);
  });

  it('should set error', () => {
    useSynthesisStore.getState().setError('Something went wrong');
    expect(useSynthesisStore.getState().error).toBe('Something went wrong');
  });

  it('should set result and update phonetic text', () => {
    const result = { audioUrl: 'test.mp3', phoneticText: 'te`re' };
    useSynthesisStore.getState().setResult(result);
    expect(useSynthesisStore.getState().result).toEqual(result);
    expect(useSynthesisStore.getState().phoneticText).toBe('te`re');
  });

  it('should set result without phonetic text', () => {
    const result = { audioUrl: 'test.mp3' };
    useSynthesisStore.getState().setResult(result);
    expect(useSynthesisStore.getState().phoneticText).toBe('');
  });

  it('should set audio element', () => {
    const audio = new Audio();
    useSynthesisStore.getState().setAudioElement(audio);
    expect(useSynthesisStore.getState().audioElement).toBe(audio);
  });

  it('should set isPlaying', () => {
    useSynthesisStore.getState().setIsPlaying(true);
    expect(useSynthesisStore.getState().isPlaying).toBe(true);
  });

  it('should reset to initial state', () => {
    useSynthesisStore.setState({
      text: 'Hello',
      phoneticText: 'həˈloʊ',
      isLoading: true,
      error: 'Error',
      result: { audioUrl: 'test.mp3' },
      audioElement: new Audio(),
      isPlaying: true,
    });
    
    useSynthesisStore.getState().reset();
    
    const state = useSynthesisStore.getState();
    expect(state.text).toBe('');
    expect(state.phoneticText).toBe('');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.result).toBeNull();
    expect(state.audioElement).toBeNull();
    expect(state.isPlaying).toBe(false);
  });
});
