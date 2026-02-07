import { useCallback, useRef } from "react";
import { convertTextToTags } from "@/types/synthesis";
import { useSentenceState } from "./useSentenceState";
import { useAudioPlayer } from "./useAudioPlayer";
import { useSynthesisAPI } from "./useSynthesisAPI";

export function useSynthesisOrchestrator(): ReturnType<
  typeof useSentenceState
> & {
  currentAudio: HTMLAudioElement | null;
  playSingleSentence: (
    id: string,
    abortSignal?: AbortSignal,
    retryCount?: number,
  ) => Promise<boolean>;
  synthesizeAndPlay: (id: string) => Promise<void>;
  synthesizeWithText: (id: string, text: string) => Promise<void>;
} {
  const sentenceState = useSentenceState();
  const { sentences, updateSentence, getSentence } = sentenceState;
  const sentencesRef = useRef(sentences);
  sentencesRef.current = sentences;

  const audioPlayer = useAudioPlayer();
  const { currentAudio, stopCurrentAudio, playAudio, playWithAbort } =
    audioPlayer;

  const synthesisAPI = useSynthesisAPI();

  const playSingleSentence = useCallback(
    async (
      id: string,
      abortSignal?: AbortSignal,
      retryCount = 0,
    ): Promise<boolean> => {
      const sentence = getSentence(id);
      if (!sentence?.text.trim()) return false;

      let audioUrl = sentence.audioUrl;

      if (!audioUrl) {
        try {
          if (abortSignal?.aborted) return false;
          const result = await synthesisAPI.synthesizeWithCache(
            sentence.text,
            sentence.phoneticText,
            null,
          );
          audioUrl = result.audioUrl;
          if (abortSignal?.aborted) return false;
          updateSentence(id, { audioUrl: result.audioUrl });
        } catch (error) {
          console.error("Failed to synthesize audio:", error);
          return false;
        }
      }

      if (abortSignal?.aborted) return false;

      if (abortSignal) {
        return playWithAbort(audioUrl, abortSignal, {
          onStart: () => updateSentence(id, { isPlaying: true }),
          onEnded: () => updateSentence(id, { isPlaying: false }),
          onError: () => {
            updateSentence(id, { isPlaying: false });
            if (retryCount === 0 && sentence.audioUrl) {
              updateSentence(id, {
                audioUrl: undefined,
                phoneticText: undefined,
              });
              setTimeout(async () => {
                await playSingleSentence(id, abortSignal, 1);
              }, 100);
            }
          },
        });
      }

      return playAudio(audioUrl, {
        onLoadStart: () => updateSentence(id, { isPlaying: true }),
        onEnded: () => updateSentence(id, { isPlaying: false }),
        onError: () => {
          updateSentence(id, { isPlaying: false });
          if (retryCount === 0 && sentence.audioUrl) {
            updateSentence(id, {
              audioUrl: undefined,
              phoneticText: undefined,
            });
            setTimeout(async () => {
              await playSingleSentence(id, abortSignal, 1);
            }, 100);
          }
        },
      });
    },
    [getSentence, updateSentence, synthesisAPI, playAudio, playWithAbort],
  );

  const synthesizeAndPlay = useCallback(
    async (id: string) => {
      const sentence = sentencesRef.current.find((s) => s.id === id);
      if (!sentence?.text.trim()) return;

      stopCurrentAudio();
      const tags = convertTextToTags(sentence.text);

      if (sentence.audioUrl && sentence.phoneticText) {
        try {
          updateSentence(id, { tags, isPlaying: false });
          await playAudio(sentence.audioUrl, {
            onLoadComplete: () =>
              updateSentence(id, { isLoading: false, isPlaying: true }),
            onEnded: () => updateSentence(id, { isPlaying: false }),
            onError: () => {
              updateSentence(id, {
                isLoading: false,
                isPlaying: false,
                audioUrl: undefined,
                phoneticText: undefined,
              });
              setTimeout(() => synthesizeAndPlay(id), 100);
            },
          });
          return;
        } catch {
          updateSentence(id, { audioUrl: undefined, phoneticText: undefined });
        }
      }

      updateSentence(id, { tags, isLoading: true, isPlaying: false });

      try {
        const result = await synthesisAPI.synthesizeText(
          sentence.text,
          sentence.phoneticText || undefined,
        );

        await playAudio(result.audioUrl, {
          onLoadComplete: () => {
            const updates: Record<string, unknown> = {
              isLoading: false,
              isPlaying: true,
              phoneticText: result.phoneticText,
              audioUrl: result.audioUrl,
            };

            if (
              result.stressedTags &&
              result.stressedTags.length === tags.length
            ) {
              updates.stressedTags = result.stressedTags;
            }

            updateSentence(id, updates);
          },
          onEnded: () => updateSentence(id, { isPlaying: false }),
          onError: () =>
            updateSentence(id, { isLoading: false, isPlaying: false }),
        });
      } catch (error) {
        console.error("Failed to synthesize:", error);
        updateSentence(id, { isLoading: false, isPlaying: false });
      }
    },
    [stopCurrentAudio, updateSentence, synthesisAPI, playAudio],
  );

  const synthesizeWithText = useCallback(
    async (id: string, text: string) => {
      const sentence = getSentence(id);
      stopCurrentAudio();

      if (
        sentence?.audioUrl &&
        sentence?.phoneticText &&
        sentence.text === text
      ) {
        try {
          await playAudio(sentence.audioUrl, {
            onLoadStart: () => updateSentence(id, { isPlaying: false }),
            onLoadComplete: () =>
              updateSentence(id, { isLoading: false, isPlaying: true }),
            onEnded: () => updateSentence(id, { isPlaying: false }),
            onError: () => {
              updateSentence(id, {
                isLoading: false,
                isPlaying: false,
                audioUrl: undefined,
                phoneticText: undefined,
              });
              setTimeout(() => synthesizeWithText(id, text), 100);
            },
          });
          return;
        } catch {
          updateSentence(id, { audioUrl: undefined, phoneticText: undefined });
        }
      }

      updateSentence(id, { isLoading: true, isPlaying: false });

      try {
        const result = await synthesisAPI.synthesizeText(
          text,
          sentence?.phoneticText || undefined,
        );

        await playAudio(result.audioUrl, {
          onLoadComplete: () => {
            updateSentence(id, {
              isLoading: false,
              isPlaying: true,
              phoneticText: result.phoneticText,
              audioUrl: result.audioUrl,
            });
          },
          onEnded: () => updateSentence(id, { isPlaying: false }),
          onError: () =>
            updateSentence(id, { isLoading: false, isPlaying: false }),
        });
      } catch (error) {
        console.error("Failed to synthesize:", error);
        updateSentence(id, { isLoading: false, isPlaying: false });
      }
    },
    [getSentence, stopCurrentAudio, updateSentence, synthesisAPI, playAudio],
  );

  return {
    ...sentenceState,
    currentAudio,
    playSingleSentence,
    synthesizeAndPlay,
    synthesizeWithText,
  };
}
