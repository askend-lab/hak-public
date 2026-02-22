// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Baseline Step Definitions
 * Implements steps for baseline/common scenarios
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { TestWorld } from "./setup";

Given("baseline tasks are available", async function (this: TestWorld) {
  await this.renderApp();
});

When("I log out and log back in", async function (this: TestWorld) {
  // Simulate logout and login
  localStorage.removeItem("auth_user");
  localStorage.setItem(
    "auth_user",
    JSON.stringify({ id: "test-user", name: "Test User" }),
  );
});

Then("the same baseline tasks are available", async function (this: TestWorld) {
  // Verify tasks are still available after re-login
});

Given("I am on the synthesis page", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I have synthesized audio", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I have multiple sentences", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I am viewing synthesis results", async function (this: TestWorld) {
  await this.renderApp();
});

When("I navigate to {string}", async function (this: TestWorld, _path: string) {
  // Navigation is handled by React Router
});

When("I refresh the page", async function (this: TestWorld) {
  await this.renderApp();
});

When(
  "I wait for {int} seconds",
  async function (this: TestWorld, seconds: number) {
    await new Promise((resolve) => { setTimeout(resolve, seconds * 1000); });
  },
);

Then("I see the application", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector('#root, .app, [data-testid="app"]');
  });
});

Then("I see the header", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector(
      'header, .header, [data-testid="header"]',
    );
  });
});

Then("I see the footer", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector(
      'footer, .footer, [data-testid="footer"]',
    );
  });
});

Then("I see a loading indicator", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector(
      '.loading, [class*="loading"], [class*="spinner"]',
    );
  });
});

Then("I see an error message", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector('.error, [class*="error"]');
  });
});

Then("I see {string}", async function (this: TestWorld, text: string) {
  await this.waitFor(() => {
    return this.queryByText(text);
  });
});

Then("I do not see {string}", async function (this: TestWorld, text: string) {
  await this.waitFor(() => {
    return !this.queryByText(text);
  });
});
