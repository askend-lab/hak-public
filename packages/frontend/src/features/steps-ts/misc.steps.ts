// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// Main page and application state
Given("I am on the main page", function () {
  this.currentPage = "main";
});

Given("I am using the application", function () {
  this.usingApplication = true;
});

Given("I am not logged in", function () {
  this.isAuthenticated = false;
});

Given("I am redirected to login", function () {
  this.redirectedToLogin = true;
});

Given("I am authenticated as a new user", function () {
  this.isAuthenticated = true;
  this.isNewUser = true;
});

Given("I am viewing the synthesis page", function () {
  this.currentPage = "synthesis";
});

Given("I am viewing the task list", function () {
  this.currentPage = "tasks";
  this.viewingTaskList = true;
});

Given("I am viewing a baseline task", function () {
  this.viewingBaselineTask = true;
  this.currentTask = {
    id: "baseline-1",
    name: "Baseline Task",
    isBaseline: true,
  };
});

// Feedback form
Given("the feedback form is open", function () {
  this.feedbackFormOpen = true;
});

Given(
  "I have entered {string} in the message field",
  function (_message: string) {
    this.messageInput = _message;
  },
);

// Phonetic guide
Given("the phonetic guide is open", function () {
  this.phoneticGuideOpen = true;
});

Given("the phonetic guide modal is open", function () {
  this.phoneticGuideOpen = true;
});

// When steps
When("I try to access a protected page", function () {
  this.accessedProtectedPage = true;
});

When("the login page loads", function () {
  this.loginPageLoaded = true;
});

When("I click on my user icon", function () {
  this.userIconClicked = true;
  this.profileDropdownVisible = true;
});

When("I click the help icon \\(?) near the phonetic text", function () {
  this.helpIconClicked = true;
  this.phoneticGuideOpen = true;
});

When("I click the feedback button", function () {
  this.feedbackButtonClicked = true;
  this.feedbackFormOpen = true;
});

When("I click the submit button", function () {
  this.submitClicked = true;
  this.feedbackSubmitted = true;
});

When("I click the close button", function () {
  this.closeClicked = true;
  this.modalClosed = true;
});

When("I click outside the dialog", function () {
  this.clickedOutsideDialog = true;
  this.modalClosed = true;
});

When("I read through the content", function () {
  this.readContent = true;
});

When("I view a symbol's explanation", function () {
  this.viewingSymbolExplanation = true;
});

When("I view the footer area", function () {
  this.viewingFooter = true;
});

When("I view synthesis results", function () {
  this.viewingSynthesisResults = true;
});

// Then steps
Then("I see my profile dropdown", function () {
  this.profileDropdownVisible = true;
});

Then("I see my name", function () {
  this.nameVisible = true;
});

Then("I see my account creation date", function () {
  this.accountCreationDateVisible = true;
});

Then("I see number of tasks created", function () {
  this.tasksCountVisible = true;
});

Then("I see total entries count", function () {
  this.entriesCountVisible = true;
});

Then("I see my recent tasks", function () {
  this.recentTasksVisible = true;
});

Then("I see a message explaining authentication is required", function () {
  this.authRequiredMessageVisible = true;
});

Then("I am redirected back to the original page", function () {
  this.redirectedBack = true;
});

Then(
  "the {string} button shows login required",
  function (_buttonName: string) {
    this.loginRequiredShown = true;
  },
);

Then("the phonetic guide modal opens", function () {
  this.phoneticGuideOpen = true;
});

Then("I see explanations for phonetic symbols", function () {
  this.phoneticExplanationsVisible = true;
});

Then("I see explanation for ` \\(third degree length)", function () {
  this.thirdDegreeLengthExplanationVisible = true;
});

Then("I see explanation for ´ \\(stress marker)", function () {
  this.stressMarkerExplanationVisible = true;
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

Then("the modal closes", function () {
  this.modalClosed = true;
});

Then("I return to the main synthesis view", function () {
  this.returnedToSynthesisView = true;
});

Then("I see a feedback button or link", function () {
  this.feedbackButtonVisible = true;
});

Then("the feedback modal opens", function () {
  this.feedbackFormOpen = true;
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

Then("I see a thank you confirmation message", function () {
  this.thankYouMessageVisible = true;
});

Then("I can submit without entering an email", function () {
  this.canSubmitWithoutEmail = true;
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

Then("I see {string} label on baseline tasks", function (_label: string) {
  this.baselineLabelVisible = true;
});

Then("I see baseline tasks in the list", function () {
  this.baselineTasksVisible = true;
});

Then("authentication is not required", function () {
  this.authNotRequired = true;
});

Then("I cannot delete the task", function () {
  this.cannotDeleteTask = true;
});

Then("I cannot edit the task", function () {
  this.cannotEditTask = true;
});
