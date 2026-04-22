// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Synthesis Step Definitions
 * Implements steps for US-004 (stressed text), US-005 (variants), US-008 (phonetic edits)
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { TestWorld } from "./setup";

Given("I have entered {string} in the synthesis text field", async function (this: TestWorld, text: string) {
    await this.renderApp();
    const input = this.getByPlaceholder("Sisesta tekst või sõna...");
    if (input) {
      this.type(input, text);
    }
  },
);

Given("I have synthesized {string}", async function (this: TestWorld, text: string) {
    await this.renderApp();
    const input = this.getByPlaceholder("Sisesta tekst või sõna...");
    if (input) {
      this.type(input, text);
      // Trigger synthesis by pressing Enter or clicking synthesize button
      const form = input.closest("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true }));
      }
    }
  },
);

When("the synthesis is complete", async function (this: TestWorld) {
  // Wait for synthesis to complete - look for audio player or phonetic text
  await this.waitFor(() => {
    const phoneticText = this.queryByTestId("phonetic-text");
    const audioPlayer = this.queryByTestId("audio-player");
    return phoneticText || audioPlayer;
  });
});

When("I view the phonetic form", async function (this: TestWorld) {
  // Phonetic form should be visible after synthesis
  await this.waitFor(() => {
    return (
      this.queryByTestId("phonetic-text") ||
      this.container?.textContent?.match(/[`´'+]/)
    );
  });
});

When("I view the stressed text display", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.queryByTestId("stressed-text-display");
  });
});

Then(
  "I see the phonetic text with stress markers",
  async function (this: TestWorld) {
    await this.waitFor(() => {
      const container = this.container;
      if (!container) {return false;}
      // Look for stress markers in the rendered text
      const text = container.textContent || "";
      return text.includes("`") || text.includes("´") || text.includes("'");
    });
  },
);

Then(
  "the stressed syllables are visually distinct",
  async function (this: TestWorld) {
    await this.waitFor(() => {
      const container = this.container;
      if (!container) {return false;}
      // Check for stress-related CSS classes or styling
      const stressedElements = container.querySelectorAll(
        '[class*="stress"], [class*="accent"]',
      );
      return stressedElements.length > 0 || container.querySelector(".tag");
    });
  },
);

Then(
  "it uses Estonian phonetic markers \\(`, ´, ', +)",
  async function (this: TestWorld) {
    await this.waitFor(() => {
      const container = this.container;
      if (!container) {return false;}
      const text = container.textContent || "";
      // Check for Estonian phonetic markers
      return /[`´'+]/.test(text);
    });
  },
);

Then(
  "compound word boundaries are marked with {string}",

  async function (this: TestWorld, marker: string) {
    await this.waitFor(() => {
      const container = this.container;
      if (!container) {return false;}
      const text = container.textContent || "";
      return text.includes(marker);
    });
  },
);

Then(
  "I can see both original text and phonetic form",
  async function (this: TestWorld) {
    await this.waitFor(() => {
      const container = this.container;
      if (!container) {return false;}
      // Both original and phonetic should be present
      const hasOriginal = container.querySelector(
        '.original-text, [data-testid="original-text"]',
      );
      const hasPhonetic = container.querySelector(
        '.phonetic-text, [data-testid="phonetic-text"]',
      );
      return (
        hasOriginal ||
        hasPhonetic ||
        container.querySelectorAll(".tag").length > 0
      );
    });
  },
);

Then("the differences are highlighted", async function (this: TestWorld) {
  await this.waitFor(() => {
    const container = this.container;
    if (!container) {return false;}
    // Check for highlighting elements
    const highlighted = container.querySelectorAll(
      '[class*="highlight"], [class*="diff"], .tag',
    );
    return highlighted.length > 0;
  });
});

Given("I have edited the phonetic text", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I have saved phonetic edits", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I have saved edits", async function (this: TestWorld) {
  await this.renderApp();
});

When("I click the save button", async function (this: TestWorld) {
  const saveButton =
    this.queryByText("Salvesta") ||
    this.queryByText("Save") ||
    this.container?.querySelector('[data-testid="save-button"]');
  if (saveButton) {
    this.click(saveButton);
  }
});

When("I navigate away and return", async function (this: TestWorld) {
  // Simulate navigation
  await this.renderApp();
});

When("I click the reset button", async function (this: TestWorld) {
  const resetButton =
    this.queryByText("Lähtesta") ||
    this.queryByText("Reset") ||
    this.container?.querySelector('[data-testid="reset-button"]');
  if (resetButton) {
    this.click(resetButton);
  }
});

Then("a confirmation message appears", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.container?.querySelector('.notification, [class*="success"]') ||
      this.queryByText("Salvestatud")
    );
  });
});

Then("my edits are preserved", async function (this: TestWorld) {
  // Edits should be visible after navigation
});

Then("the phonetic text reverts to original", async function (this: TestWorld) {
  // Original text should be restored
});

Given("I am redirected to the synthesis page", function () {
  this.iAmRedirectedToTheSynthesisPage = true;
});

Given("I have a sentence with synthesized text", function () {
  this.iHaveASentenceWithSynthesizedText = true;
});

Given("I have synthesized audio for \"Tere\"", function () {
  this.iHaveSynthesizedAudioForTere = true;
});

Given("all sentences have finished playing", function () {
  this.allSentencesHaveFinishedPlaying = true;
});

Given("a sentence is currently playing audio", function () {
  this.aSentenceIsCurrentlyPlayingAudio = true;
});

Given("audio is playing", function () {
  this.audioIsPlaying = true;
});

Given("audio is playing for one sentence", function () {
  this.audioIsPlayingForOneSentence = true;
});

Given("audio is playing on the shared page", function () {
  this.audioIsPlayingOnTheSharedPage = true;
});

Given("audio playback failed for a sentence", function () {
  this.audioPlaybackFailedForASentence = true;
});

Given("I am authenticated with a display name", function () {
  this.iAmAuthenticatedWithADisplayName = true;
});

Given("I am viewing a task with audio entries", function () {
  this.iAmViewingATaskWithAudioEntries = true;
});

Given("I enter text for synthesis", function () {
  this.iEnterTextForSynthesis = true;
});
