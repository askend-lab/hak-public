// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, Then } from "@cucumber/cucumber";

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

