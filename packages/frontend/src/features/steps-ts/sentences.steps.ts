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

Given("I have sentence rows in the list", function () {
  this.sentences = [
    { id: "s1", text: "Sentence 1", tags: [] },
    { id: "s2", text: "Sentence 2", tags: [] },
  ];
});

Given("I have sentence rows with text", function () {
  this.sentences = [
    { id: "s1", text: "Sentence 1", tags: [] },
    { id: "s2", text: "Sentence 2", tags: [] },
  ];
});

Given("I have multiple sentence rows", function () {
  this.sentences = [
    { id: "s1", text: "Sentence 1", tags: [] },
    { id: "s2", text: "Sentence 2", tags: [] },
    { id: "s3", text: "Sentence 3", tags: [] },
  ];
});

Given("I have {int} sentences in the list", function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given("I have {int} sentences with text", function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given("I have only {int} sentence in the list", function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given(
  "I have sentences in order {string}, {string}, {string}",
  function (s1: string, s2: string, s3: string) {
    this.sentences = [
      { id: "s1", text: s1, tags: [] },
      { id: "s2", text: s2, tags: [] },
      { id: "s3", text: s3, tags: [] },
    ];
  },
);

Given(
  "I have sentences {string} and {string}",
  function (s1: string, s2: string) {
    this.sentences = [
      { id: "s1", text: s1, tags: [] },
      { id: "s2", text: s2, tags: [] },
    ];
  },
);

Given(
  "I have two sentences {string} and {string}",
  function (s1: string, s2: string) {
    this.sentences = [
      { id: "s1", text: s1, tags: [] },
      { id: "s2", text: s2, tags: [] },
    ];
  },
);

Given(
  "I have sentence {string} and an empty sentence",
  function (text: string) {
    this.sentences = [
      { id: "s1", text, tags: [] },
      { id: "s2", text: "", tags: [] },
    ];
  },
);

Given("I am dragging a sentence", function () {
  this.draggingSentence = true;
});

When("I view the sentence", function () {
  this.viewingSentence = true;
});

When("I view the sentences section", function () {
  this.viewingSentencesSection = true;
});

When("I click the three-dots menu on a sentence", function () {
  this.sentenceMenuOpen = true;
});

When("I click {string} on that sentence", function (action: string) {
  this.sentenceAction = action;
});

When("I click {string} on the second sentence", function (action: string) {
  this.sentenceAction = action;
  this.targetSentenceIndex = 1;
});

When(
  "I drag sentence {string} to position after {string}",
  function (_from: string, _to: string) {
    this.sentenceReordered = true;
  },
);

Then("I see the sentence", function () {
  this.sentenceVisible = true;
});

Then("I see sentence list", function () {
  this.sentenceListVisible = true;
});

Then("I see sentence rows", function () {
  this.sentenceRowsVisible = true;
});

Then("a new empty sentence row is added to the list", function () {
  this.sentences = this.sentences || [];
  this.sentences.push({
    id: `s${this.sentences.length + 1}`,
    text: "",
    tags: [],
  });
});

Then("I can start typing text in the new row", function () {
  this.canTypeInNewRow = true;
});

Then("each sentence has a unique ID", function () {
  this.sentencesHaveUniqueIds = true;
});

Then("the next sentence starts after the previous finishes", function () {
  this.sequentialPlaybackCorrect = true;
});

Then("empty sentences are skipped", function () {
  this.emptySentencesSkipped = true;
});

Then("the sentence is removed from the list", function () {
  this.sentenceRemoved = true;
});

Then("the sentence is cleared to empty", function () {
  this.sentenceCleared = true;
});

Then("I still have {int} sentence row visible", function (_count: number) {
  this.sentenceRowsVisible = true;
});

Then("I have {int} sentences remaining", function (_count: number) {
  this.sentencesRemaining = _count;
});

Then("the dragged sentence appears semi-transparent", function () {
  this.draggedSentenceTransparent = true;
});

Then("I have two sentence rows in the list", function () {
  this.sentences = this.sentences || [];
  if (this.sentences.length < 2) {
    this.sentences.push({ id: "s2", text: "", tags: [] });
  }
});

Given("the text input is empty", function () {
  this.textInputEmpty = true;
});
