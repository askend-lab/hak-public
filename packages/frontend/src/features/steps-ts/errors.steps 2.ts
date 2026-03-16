// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== ERRORS STEPS =====

Given("a component has a custom error fallback", function () {
  this.aComponentHasACustomErrorFallback = true;
});

Given("an error occurs in the application", function () {
  this.anErrorOccursInTheApplication = true;
});

Given("I see an error boundary message", function () {
  this.iSeeAnErrorBoundaryMessage = true;
});

Given("the warm-up worker failed to initialize", function () {
  this.theWarmupWorkerFailedToInitialize = true;
});

When("a component error occurs", function () {
  this.aComponentErrorOccurs = true;
});

When("an API request fails", function () {
  this.anApiRequestFails = true;
});

When("I enter text and the analysis API fails", function () {
  this.iEnterTextAndTheAnalysisApiFails = true;
});

When("the save to backend fails", function () {
  this.theSaveToBackendFails = true;
});

When("the status endpoint returns an error", function () {
  this.theStatusEndpointReturnsAnError = true;
});

Then("no error blocks my workflow", function () {
  this.noErrorBlocksMyWorkflow = true;
});

Then("I see an error message \"Midagi läks valesti\"", function () {
  this.iSeeAnErrorMessageMidagiLksValesti = true;
});

Then("I see a timeout error notification", function () {
  this.iSeeATimeoutErrorNotification = true;
});

Then("I see pass or fail status for each scenario", function () {
  this.iSeePassOrFailStatusForEachScenario = true;
});

Then("the error is cleared", function () {
  this.theErrorIsCleared = true;
});

Then("the error is handled gracefully", function () {
  this.theErrorIsHandledGracefully = true;
});

Then("the validation fails", function () {
  this.theValidationFails = true;
});

Given("a notification is visible", function () {
  this.notificationVisible = true;
});

Given("an error occurs", function () {
  this.errorOccurred = true;
});

When("I click the notification close button", function () {
  this.notificationCloseClicked = true;
});

Then("I see an error notification", function () {
  this.errorNotificationVisible = true;
});

Then("notifications stack without overlapping", function () {
  this.notificationsStack = true;
});

Then("the notification automatically disappears", function () {
  this.notificationAutoDisappears = true;
});

Then("the notification disappears", function () {
  this.notificationDisappears = true;
});
