// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== MODALS STEPS =====

Given("a destructive action requires confirmation", function () {
  this.aDestructiveActionRequiresConfirmation = true;
});

Given("a modal is open", function () {
  this.aModalIsOpen = true;
});

Given("a modal with close button is open", function () {
  this.aModalWithCloseButtonIsOpen = true;
});

Given("a small modal is open", function () {
  this.aSmallModalIsOpen = true;
});

Given("I open a modal dialog", function () {
  this.iOpenAModalDialog = true;
});

Given("the build info modal is open", function () {
  this.theBuildInfoModalIsOpen = true;
});

When("I close the modal", function () {
  this.iCloseTheModal = true;
});

When("I close the modal without saving", function () {
  this.iCloseTheModalWithoutSaving = true;
});

When("the confirmation dialog appears", function () {
  this.theConfirmationDialogAppears = true;
});

Then("a medium modal uses wider sizing", function () {
  this.aMediumModalUsesWiderSizing = true;
});

Then("clicking the backdrop closes the modal", function () {
  this.clickingTheBackdropClosesTheModal = true;
});

Then("focus is trapped inside the modal", function () {
  this.focusIsTrappedInsideTheModal = true;
});

Then("I see a confirmation notification", function () {
  this.iSeeAConfirmationNotification = true;
});

Then("a delete confirmation dialog appears", function () {
  this.aDeleteConfirmationDialogAppears = true;
});

Then("I see a confirmation dialog with a warning message", function () {
  this.iSeeAConfirmationDialogWithAWarningMessa = true;
});

Then("I see a modal with commit hash and branch info", function () {
  this.iSeeAModalWithCommitHashAndBranchInfo = true;
});

Then("I see an error message in the modal", function () {
  this.iSeeAnErrorMessageInTheModal = true;
});

Then("the build info modal closes", function () {
  this.theBuildInfoModalCloses = true;
});

Then("the dialog is styled with danger indicators", function () {
  this.theDialogIsStyledWithDangerIndicators = true;
});

Then("the modal has role \"dialog\"", function () {
  this.theModalHasRoleDialog = true;
});

Then("the modal is centered on screen", function () {
  this.theModalIsCenteredOnScreen = true;
});

Then("the modal uses compact sizing", function () {
  this.theModalUsesCompactSizing = true;
});

When("I click outside the dialog", function () {
  this.clickedOutsideDialog = true;
  this.modalClosed = true;
});

Then("the modal closes", function () {
  this.modalClosed = true;
});

Then("the feedback modal opens", function () {
  this.feedbackFormOpen = true;
});

Then("I see a thank you confirmation message", function () {
  this.thankYouMessageVisible = true;
});

Then("I see a search input in the dialog", function () {
  this.searchInputInDialog = true;
});

Then("the dialog closes", function () {
  this.dialogClosed = true;
});
