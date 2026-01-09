export type SentenceState = {
  id: string;
  text: string;
  tags: string[];
  isPlaying: boolean;
  isLoading: boolean;
  currentInput: string;
  phoneticText?: string | undefined;
  audioUrl?: string | undefined;
  stressedTags?: string[] | undefined;
};

export type EditingTag = {
  sentenceId: string;
  tagIndex: number;
  value: string;
} | null;

export type OpenTagMenu = {
  sentenceId: string;
  tagIndex: number;
} | null;

export function getVoiceModel(text: string): 'efm_s' | 'efm_l' {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length === 1 ? 'efm_s' : 'efm_l';
}

export function convertTextToTags(text: string): string[] {
  return text.trim().split(/\s+/).filter(word => word.length > 0);
}
