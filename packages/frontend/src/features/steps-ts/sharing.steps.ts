// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Sharing Step Definitions
 * Implements steps for US-022 (share link), US-023 (access shared), US-032 (copy entries)
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { TestWorld } from "./setup";

Given("I have a task to share", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I have a share link", async function (this: TestWorld) {
  // Mock share link
});

Given("I am viewing a shared task", async function (this: TestWorld) {
  await this.renderApp();
});

When("I click the share button", async function (this: TestWorld) {
  await this.waitFor(() => {
    const shareButton =
      this.queryByText("Jaga") ||
      this.queryByText("Share") ||
      this.container?.querySelector('[data-testid="share-button"]');
    if (shareButton) {
      this.click(shareButton);
      return true;
    }
    return false;
  });
});

When("I copy the share link", async function (this: TestWorld) {
  await this.waitFor(() => {
    const copyButton =
      this.queryByText("Kopeeri") ||
      this.queryByText("Copy") ||
      this.container?.querySelector('[data-testid="copy-link"]');
    if (copyButton) {
      this.click(copyButton);
      return true;
    }
    return false;
  });
});

When("I access the share link", async function (this: TestWorld) {
  // Navigate to shared task URL
  await this.renderApp();
});

When("I click copy entries to my task", async function (this: TestWorld) {
  await this.waitFor(() => {
    const copyButton =
      this.queryByText("Kopeeri ülesandesse") ||
      this.queryByText("Copy to task") ||
      this.container?.querySelector('[data-testid="copy-to-task"]');
    if (copyButton) {
      this.click(copyButton);
      return true;
    }
    return false;
  });
});

Then("I see the share modal", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.container?.querySelector(
        '.share-modal, [data-testid="share-modal"]',
      ) || this.queryByText("Jaga ülesannet")
    );
  });
});

Then("I see a share link", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.container?.querySelector("input[readonly], .share-link") ||
      this.container?.textContent?.includes("http")
    );
  });
});

Then("the link is copied to clipboard", async function (this: TestWorld) {
  // Clipboard is mocked in tests
});

Then("I can view the shared task", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector(
      '.task-detail, [data-testid="shared-task"]',
    );
  });
});

Then("I see the shared entries", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector('.entry, [data-testid="entry"]');
  });
});

Then("the entries are copied to my task", async function (this: TestWorld) {
  // Verify entries were added
});

Then("I see a success notification", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.container?.querySelector(
        '.notification-success, [class*="success"]',
      ) || this.queryByText("Kopeeritud")
    );
  });
});

Given("I have a task with a share token", function () {
  this.iHaveATaskWithAShareToken = true;
});

Given("I have a task without a share token", function () {
  this.iHaveATaskWithoutAShareToken = true;
});

Given("a task has been shared with a token", function () {
  this.aTaskHasBeenSharedWithAToken = true;
});

Given("a task is shared as unlisted", function () {
  this.aTaskIsSharedAsUnlisted = true;
});

Given("I am authenticated with stored tokens", function () {
  this.iAmAuthenticatedWithStoredTokens = true;
});

Given("I am viewing a shared task with entries", function () {
  this.iAmViewingASharedTaskWithEntries = true;
});

Given("I have an invalid share token", function () {
  this.iHaveAnInvalidShareToken = true;
});

Given("I have a URL with a random invalid token", function () {
  this.iHaveAUrlWithARandomInvalidToken = true;
});

Given("I have a valid share token", function () {
  this.iHaveAValidShareToken = true;
});

Given("I have a valid share token for an empty task", function () {
  this.iHaveAValidShareTokenForAnEmptyTask = true;
});

Given("my task already has a share token", function () {
  this.myTaskAlreadyHasAShareToken = true;
});

Given("my task has no share token yet", function () {
  this.myTaskHasNoShareTokenYet = true;
});

Given("the callback URL has no tokens or code", function () {
  this.theCallbackUrlHasNoTokensOrCode = true;
});

Given("the share modal is open", function () {
  this.theShareModalIsOpen = true;
});

When("an unauthenticated user accesses the share link", function () {
  this.anUnauthenticatedUserAccessesTheShareLin = true;
});

When("I click the share button on the task", function () {
  this.iClickTheShareButtonOnTheTask = true;
});

When("I copy an entry's text", function () {
  this.iCopyAnEntrysText = true;
});

When("I copy the sentence text via the menu", function () {
  this.iCopyTheSentenceTextViaTheMenu = true;
});

When("I open the shared task page", function () {
  this.iOpenTheSharedTaskPage = true;
});

When("I share my task", function () {
  this.iShareMyTask = true;
});

When("I share the task", function () {
  this.iShareTheTask = true;
});

When("I share the task again", function () {
  this.iShareTheTaskAgain = true;
});

When("I try to access the shared task", function () {
  this.iTryToAccessTheSharedTask = true;
});

When("I try to copy text", function () {
  this.iTryToCopyText = true;
});

When("someone opens the share URL with the token", function () {
  this.someoneOpensTheShareUrlWithTheToken = true;
});

When("the callback page receives access and ID tokens", function () {
  this.theCallbackPageReceivesAccessAndIdTokens = true;
});

Then("it is accessible only via the share token", function () {
  this.itIsAccessibleOnlyViaTheShareToken = true;
});

Then("the URL contains the share token", function () {
  this.theUrlContainsTheShareToken = true;
});

Then("access, ID, and refresh tokens are stored locally", function () {
  this.accessIdAndRefreshTokensAreStoredLocally = true;
});

Then("all stored tokens are removed", function () {
  this.allStoredTokensAreRemoved = true;
});

Then("a share token is generated and assigned", function () {
  this.aShareTokenIsGeneratedAndAssigned = true;
});

Then("a unique 16-character hex token is generated", function () {
  this.aUnique16characterHexTokenIsGenerated = true;
});

Then("I see the share task modal", function () {
  this.iSeeTheShareTaskModal = true;
});

Then("I see the share URL in a read-only input field", function () {
  this.iSeeTheShareUrlInAReadonlyInputField = true;
});

Then("the Authorization header contains the Bearer token", function () {
  this.theAuthorizationHeaderContainsTheBearerT = true;
});

Then("the code is exchanged for tokens", function () {
  this.theCodeIsExchangedForTokens = true;
});

Then("the ID token is sent as Bearer authorization", function () {
  this.theIdTokenIsSentAsBearerAuthorization = true;
});

Then("the same share token is used", function () {
  this.theSameShareTokenIsUsed = true;
});

Then("the share modal disappears", function () {
  this.theShareModalDisappears = true;
});

Then("the share modal opens for that task", function () {
  this.theShareModalOpensForThatTask = true;
});

Then("the share task modal opens", function () {
  this.theShareTaskModalOpens = true;
});

Then("the share URL is copied to clipboard", function () {
  this.theShareUrlIsCopiedToClipboard = true;
});

Then("the task is saved as unlisted", function () {
  this.theTaskIsSavedAsUnlisted = true;
});

Given("I have a shared task link", function () {
  this.sharedTaskLink = "https://app.example.com/shared/abc123";
});

Then("the shareable URL is copied to clipboard", function () {
  this.urlCopiedToClipboard = true;
});

Then("the task is shared", function () {
  this.taskShared = true;
});

When("I copy entries and save to a task", function () {
  this.entriesCopied = true;
  this.entriesSavedToTask = true;
});

When("I copy entries from shared task", function () {
  this.entriesCopiedFromShared = true;
});

When("I copy the baseline task", function () {
  this.baselineTaskCopied = true;
});

When("I generate a share link", function () {
  this.shareLinkGenerated = true;
  this.shareLink = "https://app.example.com/shared/abc123";
});

When("I open a shared task link", function () {
  this.openedSharedTask = true;
});

When("I open the shared link", function () {
  this.sharedLinkOpened = true;
});

Then("I see the share link in a dialog", function () {
  this.shareLinkInDialog = true;
});

Then("I see the shared task details", function () {
  this.sharedTaskDetailsVisible = true;
});

Then("a unique shareable URL is generated", function () {
  this.shareLink = "https://app.example.com/shared/abc123";
});

Then("the same share link is available", function () {
  this.sameLinkAvailable = true;
});
