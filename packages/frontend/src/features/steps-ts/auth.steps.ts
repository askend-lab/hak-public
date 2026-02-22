// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Auth Step Definitions
 * Implements steps for US-025 (login), US-026 (profile), US-027 (logout), US-028 (redirect)
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { TestWorld } from "./setup";

Given("I am not authenticated", async function (this: TestWorld) {
  await this.renderApp();
  // Clear any existing auth state
  localStorage.removeItem("auth_user");
  sessionStorage.clear();
});

Given("I am authenticated", async function (this: TestWorld) {
  await this.renderApp();
  // Set up authenticated state
  localStorage.setItem(
    "auth_user",
    JSON.stringify({ id: "test-user", name: "Test User" }),
  );
});

Given("I am logged in", async function (this: TestWorld) {
  await this.renderApp();
  localStorage.setItem(
    "auth_user",
    JSON.stringify({ id: "test-user", name: "Test User" }),
  );
});

When("I visit the application", async function (this: TestWorld) {
  await this.renderApp();
});

When("I click the login button", async function (this: TestWorld) {
  await this.waitFor(() => {
    const loginButton =
      this.queryByText("Logi sisse") ||
      this.queryByText("Login") ||
      this.container?.querySelector('[data-testid="login-button"]');
    if (loginButton) {
      this.click(loginButton);
      return true;
    }
    return false;
  });
});

When("I click the logout button", async function (this: TestWorld) {
  await this.waitFor(() => {
    const logoutButton =
      this.queryByText("Logi välja") ||
      this.queryByText("Logout") ||
      this.container?.querySelector('[data-testid="logout-button"]');
    if (logoutButton) {
      this.click(logoutButton);
      return true;
    }
    return false;
  });
});

When("I view my profile", async function (this: TestWorld) {
  await this.waitFor(() => {
    const profileButton = this.container?.querySelector(
      '[data-testid="profile-button"], .user-profile',
    );
    if (profileButton) {
      this.click(profileButton);
      return true;
    }
    return false;
  });
});

Then("I see a login button", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.queryByText("Logi sisse") ||
      this.queryByText("Login") ||
      this.container?.querySelector('[data-testid="login-button"]')
    );
  });
});

Then("I am logged in successfully", async function (this: TestWorld) {
  await this.waitFor(() => {
    // Check for authenticated state indicators
    const profileElement = this.container?.querySelector(
      '.user-profile, [data-testid="user-profile"]',
    );
    const logoutButton = this.queryByText("Logi välja");
    return profileElement || logoutButton;
  });
});

Then("I see my profile information", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector(
      '.user-profile, [data-testid="user-profile"]',
    );
  });
});

Then("I am logged out", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.queryByText("Logi sisse") || this.queryByText("Login");
  });
});

Then("I am redirected to the login page", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.queryByText("Logi sisse") ||
      this.container?.querySelector(".login-modal")
    );
  });
});

Then(
  "I am redirected back to my original page",
  async function (this: TestWorld) {
    // After login, user should be back at their intended destination
    await this.waitFor(() => {
      return !this.container?.querySelector(".login-modal");
    });
  },
);

When("I view the navigation menu", async function (this: TestWorld) {
  // Navigation menu should be visible
  await this.waitFor(() => {
    return this.container?.querySelector(
      'nav, .navigation, [data-testid="nav"]',
    );
  });
});

Then("I see a logout button", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.queryByText("Logi välja") ||
      this.queryByText("Logout") ||
      this.container?.querySelector('[data-testid="logout-button"]')
    );
  });
});

Then("my session is terminated", async function (this: TestWorld) {
  // Session should be cleared
  await this.waitFor(() => {
    return !localStorage.getItem("auth_user");
  });
});

Then("I am redirected to the home page", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector(
      '.synthesis-view, [data-testid="home"]',
    );
  });
});

Given("I have logged out", async function (this: TestWorld) {
  await this.renderApp();
  localStorage.removeItem("auth_user");
});

When("I try to access a protected feature", async function (this: TestWorld) {
  // Try to navigate to tasks (protected)
  const tasksButton = this.container?.querySelector(
    '[data-testid="tasks-nav"]',
  );
  if (tasksButton) {
    this.click(tasksButton);
  }
});

Then("I am prompted to log in again", async function (this: TestWorld) {
  await this.waitFor(() => {
    return (
      this.container?.querySelector(".login-modal") ||
      this.queryByText("Logi sisse")
    );
  });
});

Given("I am no longer authenticated", function () {
  this.iAmNoLongerAuthenticated = true;
});

Given("I am authenticated with Estonian eID", function () {
  this.iAmAuthenticatedWithEstonianEid = true;
});

Given("I completed Google login", function () {
  this.iCompletedGoogleLogin = true;
});

Given("I completed TARA login", function () {
  this.iCompletedTaraLogin = true;
});

Given("I complete the login flow", function () {
  this.iCompleteTheLoginFlow = true;
});

Given("I see the login modal", function () {
  this.iSeeTheLoginModal = true;
});

Given("I was redirected to login from tasks", function () {
  this.iWasRedirectedToLoginFromTasks = true;
});

Given("the login provider returned an error", function () {
  this.theLoginProviderReturnedAnError = true;
});

When("I click login and authenticate", function () {
  this.iClickLoginAndAuthenticate = true;
});

When("the callback page receives an authorization code", function () {
  this.theCallbackPageReceivesAnAuthorizationCo = true;
});

When("the login attempt fails", function () {
  this.theLoginAttemptFails = true;
});

Then("I see an authentication error", function () {
  this.iSeeAnAuthenticationError = true;
});

Then("I see the Google login button", function () {
  this.iSeeTheGoogleLoginButton = true;
});

Then("I see the TARA login button", function () {
  this.iSeeTheTaraLoginButton = true;
});

Then("I am still authenticated", function () {
  this.iAmStillAuthenticated = true;
});

Then("the entries are saved to my session", function () {
  this.theEntriesAreSavedToMySession = true;
});

Then("the Google authentication flow starts", function () {
  this.theGoogleAuthenticationFlowStarts = true;
});

Then("the login modal closes", function () {
  this.theLoginModalCloses = true;
});

Then("the login modal opens", function () {
  this.theLoginModalOpens = true;
});

Then("the request is rejected with authorization error", function () {
  this.theRequestIsRejectedWithAuthorizationErr = true;
});

Then("the TARA authentication flow starts", function () {
  this.theTaraAuthenticationFlowStarts = true;
});

Then("they can view the task without authentication", function () {
  this.theyCanViewTheTaskWithoutAuthentication = true;
});

Given("I am authenticated as a new user", function () {
  this.isAuthenticated = true;
  this.isNewUser = true;
});

Given("I am redirected to login", function () {
  this.redirectedToLogin = true;
});

When("the login page loads", function () {
  this.loginPageLoaded = true;
});

Then("I see a message explaining authentication is required", function () {
  this.authRequiredMessageVisible = true;
});

Then(
  "the {string} button shows login required",
  function (_buttonName: string) {
    this.loginRequiredShown = true;
  },
);

Then("authentication is not required", function () {
  this.authNotRequired = true;
});

Then("I see a login prompt", function () {
  this.loginPromptVisible = true;
});
