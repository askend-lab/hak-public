// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: auth

export const FEATURES_AUTH: Record<string, string> = {
  "US-025-login-eid": `@auth @US-025 @ready
Feature: Login with eID (US-025)
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

  "US-026-view-profile": `@auth @US-026
Feature: View user profile (US-026)
  As an authenticated user
  I want to view my profile information
  So that I can see my account details and settings

  Background:
    Given I am logged in

  Scenario: Access profile via user icon
    When I click on my user icon
    Then I see my profile dropdown

  Scenario: See profile information
    When I view my profile
    Then I see my name
    And I see my account creation date

  Scenario: See task statistics
    When I view my profile
    Then I see number of tasks created
    And I see total entries count

  Scenario: See recent activity
    When I view my profile
    Then I see my recent tasks
`,

  "US-027-logout": `@auth @US-027 @ready
Feature: Logout from system (US-027)
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

  "US-028-auth-redirect": `@auth @redirect @US-028
Feature: US-028 Redirect to login for protected features
  As an unauthenticated user
  I want to be redirected to login when accessing protected features
  So that I understand authentication is required

  Scenario: Protected route access attempt
    Given I am not logged in
    When I try to access a protected page
    Then I am redirected to the login page

  Scenario: Informative message on redirect
    Given I am redirected to login
    When the login page loads
    Then I see a message explaining authentication is required

  Scenario: Return to intended page after login
    Given I was redirected from a protected page
    When I successfully log in
    Then I am redirected back to the original page

  Scenario: Disabled protected actions for guests
    Given I am not logged in
    When I view synthesis results
    Then the "Add to task" button shows login required
`,
};
