// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SynthesisModals from "./SynthesisModals";

const mockContext = {
  synthesis: {
    sentences: [
      { id: "s1", text: "Tere", phoneticText: "te`re", tags: [], currentInput: "" },
    ],
    handleSentencePhoneticApply: vi.fn(),
  },
  variants: {
    variantsWord: null as string | null,
    isVariantsPanelOpen: false,
    handleCloseVariants: vi.fn(),
    variantsCustomPhonetic: null as string | null,
    sentencePhoneticId: null as string | null,
    showSentencePhoneticPanel: false,
    handleCloseSentencePhonetic: vi.fn(),
  },
  handleUseVariant: vi.fn(),
};

vi.mock("@/contexts/SynthesisPageContext", () => ({
  useSynthesisPage: () => mockContext,
}));

vi.mock("./PronunciationVariants", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="pronunciation-variants">PV</div> : null,
}));

vi.mock("./SentencePhoneticPanel", () => ({
  default: ({
    isOpen,
    onApply,
  }: {
    isOpen: boolean;
    onApply: (text: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="sentence-phonetic-panel">
        <button onClick={() => onApply("new-phonetic")}>Apply</button>
      </div>
    ) : null,
}));

describe("SynthesisModals", () => {
  const showNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.variants.sentencePhoneticId = null;
    mockContext.variants.showSentencePhoneticPanel = false;
    mockContext.variants.isVariantsPanelOpen = false;
  });

  it("renders without sentence phonetic panel when no sentencePhoneticId", () => {
    render(<SynthesisModals showNotification={showNotification} />);
    expect(screen.queryByTestId("sentence-phonetic-panel")).not.toBeInTheDocument();
  });

  it("renders sentence phonetic panel when sentencePhoneticId set", () => {
    mockContext.variants.sentencePhoneticId = "s1";
    mockContext.variants.showSentencePhoneticPanel = true;
    render(<SynthesisModals showNotification={showNotification} />);
    expect(screen.getByTestId("sentence-phonetic-panel")).toBeInTheDocument();
  });

  it("calls handleSentencePhoneticApply and showNotification on Apply", () => {
    mockContext.variants.sentencePhoneticId = "s1";
    mockContext.variants.showSentencePhoneticPanel = true;
    render(<SynthesisModals showNotification={showNotification} />);
    fireEvent.click(screen.getByText("Apply"));
    expect(mockContext.synthesis.handleSentencePhoneticApply).toHaveBeenCalledWith(
      "s1",
      "new-phonetic",
    );
    expect(showNotification).toHaveBeenCalledWith("success", expect.any(String));
  });
});
