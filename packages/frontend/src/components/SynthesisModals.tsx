// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import PronunciationVariants from "./PronunciationVariants";
import SentencePhoneticPanel from "./SentencePhoneticPanel";
import { useSynthesisPage } from "@/contexts/SynthesisPageContext";
import { MODAL_STRINGS } from "@/constants/ui-strings";
import { NotificationType } from "@/components/Notification";

interface SynthesisModalsProps {
  showNotification: (
    type: NotificationType,
    title: string,
    desc?: string,
  ) => void;
}

export default function SynthesisModals({
  showNotification,
}: SynthesisModalsProps) {
  const { synthesis, variants, handleUseVariant } = useSynthesisPage();

  return (
    <>
      <PronunciationVariants
        word={variants.variantsWord}
        isOpen={variants.isVariantsPanelOpen}
        onClose={variants.handleCloseVariants}
        onUseVariant={handleUseVariant}
        customPhoneticForm={variants.variantsCustomPhonetic}
      />
      {variants.sentencePhoneticId && (
        <SentencePhoneticPanel
          sentenceText={
            synthesis.sentences.find(
              (s) => s.id === variants.sentencePhoneticId,
            )?.text || ""
          }
          phoneticText={
            synthesis.sentences.find(
              (s) => s.id === variants.sentencePhoneticId,
            )?.phoneticText || null
          }
          isOpen={variants.showSentencePhoneticPanel}
          onClose={variants.handleCloseSentencePhonetic}
          onApply={(newPhoneticText) => {
            synthesis.handleSentencePhoneticApply(
              variants.sentencePhoneticId!,
              newPhoneticText,
            );
            showNotification("success", MODAL_STRINGS.PHONETIC_APPLIED);
          }}
        />
      )}
    </>
  );
}
