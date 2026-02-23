// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { convertTextToTags } from "@/types/synthesis";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";
import { postJSON, ANALYZE_API_PATH } from "@/features/synthesis/utils/analyzeApi";

interface SynthesisResult {
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
      const response = await postJSON(ANALYZE_API_PATH, { text });

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
          stressedTags = convertTextToTags(stressedText);
        }
      }

      const audioUrl = await synthesizeAuto(actualPhoneticText);

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
