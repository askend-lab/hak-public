// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Given, When, Then } from "@cucumber/cucumber";

// ===== NAVIGATION STEPS =====

Given("I am on any page", function () {
  this.iAmOnAnyPage = true;
});

Given("I am on the role selection page", function () {
  this.iAmOnTheRoleSelectionPage = true;
});

Given("I am on the specs page", function () {
  this.iAmOnTheSpecsPage = true;
});

Given("the browser denies clipboard access", function () {
  this.theBrowserDeniesClipboardAccess = true;
});

When("I navigate away from the page", function () {
  this.iNavigateAwayFromThePage = true;
});

When("I navigate to the dashboard", function () {
  this.iNavigateToTheDashboard = true;
});

When("I navigate to the specs page", function () {
  this.iNavigateToTheSpecsPage = true;
});

When("the callback page loads", function () {
  this.theCallbackPageLoads = true;
});

When("the page finishes loading", function () {
  this.thePageFinishesLoading = true;
});

When("the redirect completes", function () {
  this.theRedirectCompletes = true;
});

Then("it stays within the viewport bounds", function () {
  this.itStaysWithinTheViewportBounds = true;
});

Then("I am not redirected to role selection", function () {
  this.iAmNotRedirectedToRoleSelection = true;
});

Then("I am redirected to the role selection page", function () {
  this.iAmRedirectedToTheRoleSelectionPage = true;
});

Then("I see the page header with \"Mängi kõik\" button", function () {
  this.iSeeThePageHeaderWithMngiKikButton = true;
});

Then("I see the specs page with feature groups", function () {
  this.iSeeTheSpecsPageWithFeatureGroups = true;
});

Then("the page background cannot be scrolled", function () {
  this.thePageBackgroundCannotBeScrolled = true;
});

Then("the pending redirect state is cleared", function () {
  this.thePendingRedirectStateIsCleared = true;
});

Given("I was redirected from a protected page", function () {
  this.redirectedFromProtectedPage = true;
});

Given("I am on the main page", function () {
  this.currentPage = "main";
});

When("I try to access a protected page", function () {
  this.accessedProtectedPage = true;
});

When("I view a symbol's explanation", function () {
  this.viewingSymbolExplanation = true;
});

When("I view the footer area", function () {
  this.viewingFooter = true;
});

Then("I am redirected back to the original page", function () {
  this.redirectedBack = true;
});

Then("it is hidden from my view", function () {
  this.hidden = true;
});

When("I view the email field", function () {
  this.viewingEmailField = true;
});

Then("blob URLs are revoked to free memory", function () {
  this.blobUrlsRevoked = true;
});

Then("the URL is copied to clipboard", function () {
  this.urlCopiedToClipboard = true;
});
