import { useSynthesisTextStore } from './textStore';

describe('useSynthesisTextStore', () => {
  beforeEach(() => {
    useSynthesisTextStore.setState({
      text: '',
      phoneticText: '',
    });
  });

  it('should set text', () => {
    useSynthesisTextStore.getState().setText('Hello world');
    expect(useSynthesisTextStore.getState().text).toBe('Hello world');
  });

  it('should set phonetic text', () => {
    useSynthesisTextStore.getState().setPhoneticText('həˈloʊ wɜːrld');
    expect(useSynthesisTextStore.getState().phoneticText).toBe('həˈloʊ wɜːrld');
  });

  it('should reset text to initial state', () => {
    useSynthesisTextStore.setState({
      text: 'Some text',
      phoneticText: 'Some phonetic',
    });
    useSynthesisTextStore.getState().resetText();
    expect(useSynthesisTextStore.getState().text).toBe('');
    expect(useSynthesisTextStore.getState().phoneticText).toBe('');
  });
});
