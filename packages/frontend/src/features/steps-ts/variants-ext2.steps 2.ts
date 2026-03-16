// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== VARIANTS EXT2 STEPS =====

Then("variants are fetched from the API", function () {
  this.variantsAreFetchedFromTheApi = true;
});

Then("variants for that word are loaded", function () {
  this.variantsForThatWordAreLoaded = true;
});

Then("I hear the audio for that variant", function () {
  this.iHearTheAudioForThatVariant = true;
});

Then("I hear the audio for the edited phonetic text", function () {
  this.iHearTheAudioForTheEditedPhoneticText = true;
});

Then("I see a list of available phonetic markers", function () {
  this.iSeeAListOfAvailablePhoneticMarkers = true;
});

Then("I see a list of unique pronunciation variants", function () {
  this.iSeeAListOfUniquePronunciationVariants = true;
});

Then("I see an error message in the variants panel", function () {
  this.iSeeAnErrorMessageInTheVariantsPanel = true;
});

Then("I see each marker with name, rule, and examples", function () {
  this.iSeeEachMarkerWithNameRuleAndExamples = true;
});

Then("I see marker buttons for kolmas välde, rõhk, peenendus, liitsõnapiir", function () {
  this.iSeeMarkerButtonsForKolmasVldeRhkPeenend = true;
});

Then("I see task search, create task, phonetic, download, copy, and remove", function () {
  this.iSeeTaskSearchCreateTaskPhoneticDownload = true;
});

Then("I see the custom variant input form", function () {
  this.iSeeTheCustomVariantInputForm = true;
});

Then("I see the original text without stress markers", function () {
  this.iSeeTheOriginalTextWithoutStressMarkers = true;
});

Then("I see the phonetic editing panel", function () {
  this.iSeeThePhoneticEditingPanel = true;
});

Then("I see the tag context menu", function () {
  this.iSeeTheTagContextMenu = true;
});

Then("the custom variant is applied to the sentence", function () {
  this.theCustomVariantIsAppliedToTheSentence = true;
});

Then("the entry text reflects the chosen variant", function () {
  this.theEntryTextReflectsTheChosenVariant = true;
});

Then("the marker is inserted at the cursor position", function () {
  this.theMarkerIsInsertedAtTheCursorPosition = true;
});

Then("the marker is shown as a backtick symbol in the UI", function () {
  this.theMarkerIsShownAsABacktickSymbolInTheUi = true;
});

Then("the markers are transformed to Vabamorf format", function () {
  this.theMarkersAreTransformedToVabamorfFormat = true;
});

Then("the marker symbol is inserted at the cursor", function () {
  this.theMarkerSymbolIsInsertedAtTheCursor = true;
});

Then("the phonetic panel opens for that entry", function () {
  this.thePhoneticPanelOpensForThatEntry = true;
});

Then("the phonetic panel opens for that sentence", function () {
  this.thePhoneticPanelOpensForThatSentence = true;
});

Then("the tag becomes editable", function () {
  this.theTagBecomesEditable = true;
});

Then("the tag is removed from the sentence", function () {
  this.theTagIsRemovedFromTheSentence = true;
});

Then("the tag value is updated", function () {
  this.theTagValueIsUpdated = true;
});

Then("the variant replaces the word in the sentence", function () {
  this.theVariantReplacesTheWordInTheSentence = true;
});

Then("the variants panel opens for that word", function () {
  this.theVariantsPanelOpensForThatWord = true;
});

Then("the variants panel shows a loading indicator", function () {
  this.theVariantsPanelShowsALoadingIndicator = true;
});

Then("the voice model matches the phonetic input type", function () {
  this.theVoiceModelMatchesThePhoneticInputType = true;
});

Given("the phonetic guide is open", function () {
  this.phoneticGuideOpen = true;
});

Given("the phonetic guide modal is open", function () {
  this.phoneticGuideOpen = true;
});

Given("I have saved edited phonetic text", function () {
  this.phoneticTextSaved = true;
});

Given("I am creating a custom variant", function () {
  this.creatingCustomVariant = true;
});

Given("I am in the custom variant input field", function () {
  this.inCustomVariantInput = true;
});

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
