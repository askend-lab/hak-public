import { useCallback } from "react";
import { getVoiceModel } from "@/types/synthesis";
import { synthesizeWithPolling } from "@/utils/synthesize";

export interface SynthesisResult {
  audioUrl: string;
  phoneticText: string;
  stressedTags?: string[] | undefined;
}

export function useSynthesisAPI(): {
  analyzeText: (text: string) => Promise<{ stressedText: string }>;
  synthesizeText: (
    text: string,
    phoneticText?: string,
  ) => Promise<SynthesisResult>;
  synthesizeWithCache: (
    text: string,
    cachedPhoneticText?: string | null,
    cachedAudioUrl?: string | null,
  ) => Promise<SynthesisResult>;
} {
  const analyzeText = useCallback(
    async (text: string): Promise<{ stressedText: string }> => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      return response.json();
    },
    [],
  );

  const synthesizeText = useCallback(
    async (text: string, phoneticText?: string): Promise<SynthesisResult> => {
      let actualPhoneticText: string;
      let stressedTags: string[] | undefined;

      if (phoneticText) {
        actualPhoneticText = phoneticText;
      } else {
        const { stressedText } = await analyzeText(text);
        actualPhoneticText = stressedText || text;
        if (stressedText) {
          stressedTags = stressedText
            .trim()
            .split(/\s+/)
            .filter((w: string) => w.length > 0);
        }
      }

      const audioUrl = await synthesizeWithPolling(
        actualPhoneticText,
        getVoiceModel(actualPhoneticText),
      );

      return {
        audioUrl,
        phoneticText: actualPhoneticText,
        stressedTags,
      };
    },
    [analyzeText],
  );

  const synthesizeWithCache = useCallback(
    async (
      text: string,
      cachedPhoneticText?: string | null,
      cachedAudioUrl?: string | null,
    ): Promise<SynthesisResult> => {
      if (cachedAudioUrl && cachedPhoneticText) {
        return {
          audioUrl: cachedAudioUrl,
          phoneticText: cachedPhoneticText,
        };
      }

      return synthesizeText(text, cachedPhoneticText || undefined);
    },
    [synthesizeText],
  );

  return {
    analyzeText,
    synthesizeText,
    synthesizeWithCache,
  };
}
