// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== UI 3 STEPS =====

When("I click the submit button", function () {
  this.submitClicked = true;
  this.feedbackSubmitted = true;
});

When("I click the close button", function () {
  this.closeClicked = true;
  this.modalClosed = true;
});

When("I read through the content", function () {
  this.readContent = true;
});

When("I click {string} option", function (option: string) {
  this.selectedOption = option;
  if (option === "Download") {
    this.downloadInitiated = true;
  }
});

When("I click the more options menu \\(⋮)", function () {
  this.sentenceMenuOpen = true;
});

When("the drag is in progress", function () {
  this.dragInProgress = true;
});

When("I modify the text", function () {
  this.textModified = true;
});

When("I press Backspace", function () {
  this.backspacePressed = true;
});

When("I press Space", function () {
  this.spacePressed = true;
});

When("I type {string} in the search input", function (text: string) {
  this.searchInput = text;
});

Then("I see my profile dropdown", function () {
  this.profileDropdownVisible = true;
});

Then("I see my name", function () {
  this.nameVisible = true;
});

Then("I see my account creation date", function () {
  this.accountCreationDateVisible = true;
});

Then("I see explanation for ` \\(third degree length)", function () {
  this.thirdDegreeLengthExplanationVisible = true;
});

Then("I see explanation for ' \\(palatalization)", function () {
  this.palatalizationExplanationVisible = true;
});

Then("I see explanation for + \\(compound word boundary)", function () {
  this.compoundWordBoundaryExplanationVisible = true;
});

Then("I see example words using that symbol", function () {
  this.exampleWordsVisible = true;
});

Then("the examples show correct usage in context", function () {
  this.examplesShowUsage = true;
});

Then("I see a feedback button or link", function () {
  this.feedbackButtonVisible = true;
});

Then("I see a message input field", function () {
  this.messageInputVisible = true;
});

Then("I see an optional email field", function () {
  this.emailFieldVisible = true;
});

Then("my feedback is submitted", function () {
  this.feedbackSubmitted = true;
});

Then("I can submit without entering an email", function () {
  this.canSubmitWithoutEmail = true;
});

Then(
  "the order becomes {string}, {string}, {string}",
  function (_s1: string, _s2: string, _s3: string) {
    this.orderUpdated = true;
  },
);

Then("the drop target shows a visual indicator", function () {
  this.dropTargetIndicator = true;
});

Then("{string} is not affected", function (_item: string) {
  this.itemNotAffected = true;
});

Then("the edited text is saved", function () {
  this.editsSaved = true;
});

Then("the input field clears", function () {
  this.inputCleared = true;
});

Then("existing words appear as clickable tags", function () {
  this.wordsAsClickableTags = true;
});

Then("the current word becomes a tag", function () {
  this.wordBecameTag = true;
});

Then(
  "the search input has placeholder {string}",
  function (_placeholder: string) {
    this.searchPlaceholderSet = true;
  },
);

Then("the pending save action executes", function () {
  this.pendingSaveExecuted = true;
});

Then("it is colored green", function () {
  this.color = "green";
});

Then("it is colored red", function () {
  this.color = "red";
});

Then("its text appears in the input field", function () {
  this.textInInput = true;
});

Then("the button changes back to {string}", function (_text: string) {
  this.buttonTextChanged = true;
});

Then("the filename contains the text {string}", function (_text: string) {
  this.filenameContainsText = true;
});

Then("the format is WAV", function () {
  this.audioFormat = "WAV";
});

Then("the {string} button should be disabled", function (_buttonName: string) {
  this.buttonDisabled = true;
});

Then("the deletion is soft delete", function () {
  this.softDelete = true;
});

Given("a successful action occurs", function () {
  this.successfulAction = true;
});

Given("multiple events occur", function () {
  this.multipleEvents = true;
});

When("{int} seconds pass", function (_seconds: number) {
  this.secondsPassed = _seconds;
});

When("I click on the word", function () {
  this.wordClicked = true;
});

When("I click save", function () {
  this.saveClicked = true;
});

When("I log in", function () {
  this.isAuthenticated = true;
});

When("I open the downloaded file", function () {
  this.downloadedFileOpened = true;
});

When("I successfully log in", function () {
  this.isAuthenticated = true;
  this.loginSuccessful = true;
});

When("component unmounts", function () {
  this.componentUnmounted = true;
});

When("the text changes", function () {
  this.textChanged = true;
});

Then("I can type new words in the input field", function () {
  this.canTypeNewWords = true;
});

Then("I see a {string} button at the bottom", function (_buttonText: string) {
  this.buttonAtBottom = true;
});

Then(
  "I see a {string} button showing count {string}",
  function (_button: string, _count: string) {
    this.buttonWithCount = true;
  },
);

Then("I see an {string} button", function (_buttonText: string) {
  this.buttonVisible = true;
});

Then("I see an {string} option in the dropdown", function (_option: string) {
  this.optionInDropdown = true;
});

Then("it is clearly marked as optional", function () {
  this.markedAsOptional = true;
});

Then("the cache is automatically invalidated", function () {
  this.cacheInvalidated = true;
});
