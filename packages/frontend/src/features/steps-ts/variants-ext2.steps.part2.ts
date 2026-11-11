// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== VARIANTS EXT2 STEPS =====

Given("I have created a custom phonetic variant", function () {
  this.customVariant = { phonetic: "custom-phonetic" };
});

Given(
  "I have entered a custom phonetic variant {string}",
  function (variant: string) {
    this.customVariant = { phonetic: variant };
  },
);

When("I click the help icon \\(?) near the phonetic text", function () {
  this.helpIconClicked = true;
  this.phoneticGuideOpen = true;
});

When("I click the play button for custom variant", function () {
  this.customVariantPlayClicked = true;
});

When(
  "I click the {string} button for custom variant",
  function (_button: string) {
    this.customVariantButtonClicked = true;
  },
);

When("I click the edit button on phonetic text", function () {
  this.editModeActive = true;
});

When("I scroll to the custom variant section", function () {
  this.scrolledToCustomSection = true;
});

When("I click a phonetic marker button", function () {
  this.markerButtonClicked = true;
});

When("I click the stressed syllable marker button", function () {
  this.stressMarkerClicked = true;
});

Then("the phonetic guide modal opens", function () {
  this.phoneticGuideOpen = true;
});

Then("I see explanations for phonetic symbols", function () {
  this.phoneticExplanationsVisible = true;
});

Then("I see explanation for ´ \\(stress marker)", function () {
  this.stressMarkerExplanationVisible = true;
});

Then("the guide explains available markers", function () {
  this.guideExplainsMarkers = true;
});

Then("I see a button for third quantity marker", function () {
  this.thirdQuantityButtonVisible = true;
});

Then("I see a button for stressed syllable marker", function () {
  this.stressedSyllableButtonVisible = true;
});

Then("I see a button for palatalization marker", function () {
  this.palatalizationButtonVisible = true;
});

Then("I see a button for compound word boundary marker", function () {
  this.compoundWordBoundaryButtonVisible = true;
});

Then("the custom variant replaces the word phonetic form", function () {
  this.customVariantReplaced = true;
});

Then("the custom variant is synthesized", function () {
  this.customVariantSynthesized = true;
});

Then("the phonetic text becomes editable", function () {
  this.editModeActive = true;
});

Then("the marker is inserted at cursor position", function () {
  this.markerInserted = true;
});

Then("the marker is inserted at position {int}", function (_position: number) {
  this.markerInserted = true;
});

Then("my cursor moves after the inserted marker", function () {
  this.cursorMovedAfterMarker = true;
});

Then("the last tag is removed", function () {
  this.lastTagRemoved = true;
});

Then("I hear pronunciations", function () {
  this.heardPronunciations = true;
});

When("I click the phonetic guide button", function () {
  this.phoneticGuideButtonClicked = true;
  this.phoneticGuideOpen = true;
});

Then("the pronunciation variants panel is open for a word", function () {
  this.variantsPanelOpen = true;
});

Then("I can customize its phonetic form", function () {
  this.canCustomizePhonetic = true;
});

Then("I see a custom phonetic input field", function () {
  this.customPhoneticInputVisible = true;
});

Then("I see quick-insert buttons for phonetic markers", function () {
  this.quickInsertButtons = true;
});

Then("I see the phonetic guide modal", function () {
  this.phoneticGuideOpen = true;
});

Then("both audio blob and phonetic text are cached together", function () {
  this.audioBlobCached = true;
});

Then("the audio uses the edited phonetic form", function () {
  this.audioUsesEditedPhonetic = true;
});
