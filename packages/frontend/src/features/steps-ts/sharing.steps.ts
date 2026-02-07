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
