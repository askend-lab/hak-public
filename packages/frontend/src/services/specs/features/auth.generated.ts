// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: auth

export const FEATURES_AUTH: Record<string, string> = {
  'US-025-login-eid': `Feature: Login with eID (US-025)
  As a registered user
  I want to log in using Estonian eID via Cognito
  So that I can access task management and personalized features

  Scenario: Login button is visible
    Given I am not authenticated
    When I visit the application
    Then I see a login button

  Scenario: Successful login
    Given I am not authenticated
    When I click the login button
    Then I am logged in successfully
    And I see my profile information
`,

  'US-027-logout': `Feature: Logout from system (US-027)
  As an authenticated user
  I want to log out of the application
  So that I can secure my account when done

  Scenario: Logout button visible when authenticated
    Given I am logged in
    When I view the navigation menu
    Then I see a logout button

  Scenario: Logout action terminates session
    Given I am logged in
    When I click the logout button
    Then my session is terminated
    And I am redirected to the home page

  Scenario: Protected features require re-login
    Given I have logged out
    When I try to access a protected feature
    Then I am prompted to log in again
`,
};
