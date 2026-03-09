// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { convertTextToTags } from "@/types/synthesis";
import { synthesizeAuto, AuthRequiredError } from "@/features/synthesis/utils/synthesize";
import { postJSON, ANALYZE_API_PATH } from "@/features/synthesis/utils/analyzeApi";
import { AuthStorage } from "@/features/auth/services/storage";

interface SynthesisResult {
  audioUrl: string;
  phoneticText: string;
  stressedTags?: string[] | undefined;
}

async function resolvePhonetic(analyzeText: (t: string) => Promise<{ stressedText: string }>, text: string, phoneticText?: string) {
  if (phoneticText) {return { actualPhoneticText: phoneticText, stressedTags: undefined };}
  const { stressedText } = await analyzeText(text);
  const actual = stressedText || text;
  return { actualPhoneticText: actual, stressedTags: stressedText ? convertTextToTags(stressedText) : undefined };
}

export function useSynthesisAPI() {
  const analyzeText = useCallback(async (text: string): Promise<{ stressedText: string }> => {
    const token = AuthStorage.getAccessToken();
    if (!token) {throw new AuthRequiredError();}
    const response = await postJSON(ANALYZE_API_PATH, { text }, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) {throw new AuthRequiredError();}
    if (!response.ok) {throw new Error("Analysis failed");}
    return response.json();
  }, []);

  const synthesizeText = useCallback(async (text: string, phoneticText?: string): Promise<SynthesisResult> => {
    const { actualPhoneticText, stressedTags } = await resolvePhonetic(analyzeText, text, phoneticText);
    const audioUrl = await synthesizeAuto(actualPhoneticText);
    return { audioUrl, phoneticText: actualPhoneticText, stressedTags };
  }, [analyzeText]);

  const synthesizeWithCache = useCallback(async (text: string, cachedPhonetic?: string | null, cachedAudio?: string | null): Promise<SynthesisResult> => {
    if (cachedAudio && cachedPhonetic) {return { audioUrl: cachedAudio, phoneticText: cachedPhonetic };}
    return synthesizeText(text, cachedPhonetic || undefined);
  }, [synthesizeText]);

  return { analyzeText, synthesizeText, synthesizeWithCache };
}
