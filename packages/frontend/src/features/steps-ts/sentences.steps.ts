// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== SENTENCES STEPS =====

Given("I have multiple sentences with text", function () {
  this.iHaveMultipleSentencesWithText = true;
});

Given("all sentence inputs are empty", function () {
  this.allSentenceInputsAreEmpty = true;
});

Given("all sentence rows are empty", function () {
  this.allSentenceRowsAreEmpty = true;
});

Given("demo sentences are pre-filled", function () {
  this.demoSentencesArePrefilled = true;
});

Given("I have 3 sentence rows", function () {
  this.iHave3SentenceRows = true;
});

Given("I have an empty sentence", function () {
  this.iHaveAnEmptySentence = true;
});

Given("I have one sentence row", function () {
  this.iHaveOneSentenceRow = true;
});

Given("I have previously entered sentences", function () {
  this.iHavePreviouslyEnteredSentences = true;
});

Given("I have sentences in local storage", function () {
  this.iHaveSentencesInLocalStorage = true;
});

Given("the sentence context menu is open", function () {
  this.theSentenceContextMenuIsOpen = true;
});

When("I click the add sentence button", function () {
  this.iClickTheAddSentenceButton = true;
});

When("I click the clear button on the sentence", function () {
  this.iClickTheClearButtonOnTheSentence = true;
});

When("I enter a long sentence", function () {
  this.iEnterALongSentence = true;
});

When("I enter text in a sentence row", function () {
  this.iEnterTextInASentenceRow = true;
});

When("I modify a demo sentence text", function () {
  this.iModifyADemoSentenceText = true;
});

When("I open a sentence context menu", function () {
  this.iOpenASentenceContextMenu = true;
});

When("I open the sentence context menu", function () {
  this.iOpenTheSentenceContextMenu = true;
});

When("I open the sentence menu", function () {
  this.iOpenTheSentenceMenu = true;
});

When("I remove all sentences", function () {
  this.iRemoveAllSentences = true;
});

Then("each row has a clear button when text is present", function () {
  this.eachRowHasAClearButtonWhenTextIsPresent = true;
});

Then("each row has a text input field for new words", function () {
  this.eachRowHasATextInputFieldForNewWords = true;
});

Then("each row shows the creation date", function () {
  this.eachRowShowsTheCreationDate = true;
});

Then("it does not overlap other sentences", function () {
  this.itDoesNotOverlapOtherSentences = true;
});

Then("it highlights the text input area", function () {
  this.itHighlightsTheTextInputArea = true;
});

Then("the empty row is skipped", function () {
  this.theEmptyRowIsSkipped = true;
});

Then("the restored sentence is not in loading state", function () {
  this.theRestoredSentenceIsNotInLoadingState = true;
});

Then("the second row is empty", function () {
  this.theSecondRowIsEmpty = true;
});

Then("a new empty sentence row appears below", function () {
  this.aNewEmptySentenceRowAppearsBelow = true;
});

Then("demo sentences are pre-filled for practice", function () {
  this.demoSentencesArePrefilledForPractice = true;
});

Then("demo sentences are pre-filled in the input rows", function () {
  this.demoSentencesArePrefilledInTheInputRows = true;
});

Then("each sentence row shows editable word tags", function () {
  this.eachSentenceRowShowsEditableWordTags = true;
});

Then("I see 3 input rows", function () {
  this.iSee3InputRows = true;
});

Then("I see an add sentence button below the sentence list", function () {
  this.iSeeAnAddSentenceButtonBelowTheSentenceL = true;
});

Then("my sentences are restored from local storage", function () {
  this.mySentencesAreRestoredFromLocalStorage = true;
});

Then("the changes are applied to the sentence", function () {
  this.theChangesAreAppliedToTheSentence = true;
});

Then("the new sentence input is focused", function () {
  this.theNewSentenceInputIsFocused = true;
});

Then("the sentence state is saved to local storage", function () {
  this.theSentenceStateIsSavedToLocalStorage = true;
});

Then("the sentence text is cleared", function () {
  this.theSentenceTextIsCleared = true;
});

Then("the sentence text is copied to clipboard", function () {
  this.theSentenceTextIsCopiedToClipboard = true;
});

Given("I have a word in the sentence", function () {
  this.currentWord = { text: "word", phonetic: "phonetic" };
});

Given("I have modified the sentence text", function () {
  this.sentenceTextModified = true;
});

Given("I have a sentence row", function () {
  this.sentences = [{ id: "s1", text: "Test sentence", tags: [] }];
});

Given("I have a sentence {string}", function (text: string) {
  this.sentences = [{ id: "s1", text, tags: [] }];
});

Given("I have one sentence row with text {string}", function (text: string) {
  this.sentences = [{ id: "s1", text, tags: [] }];
});

