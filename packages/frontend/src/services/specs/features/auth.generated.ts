// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: auth

export const FEATURES_AUTH: Record<string, string> = {
  'US-025-login-eid': `@auth @US-025 @ready
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

  'US-026-view-profile': `@auth @US-026
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

  'US-027-logout': `@auth @US-027 @ready
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

  'US-028-auth-redirect': `@auth @redirect @US-028
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

  'US-042-auth-callback 2': `@ready @auth @callback @US-042
Feature: Process authentication callback (US-042)
  As a user completing login
  I want the callback page to process my authentication tokens
  So that I am securely logged in and redirected to the app

  Scenario: Successful TARA authentication
    Given I completed TARA login
    When the callback page receives access and ID tokens
    Then I am redirected to the home page
    And I am authenticated

  Scenario: Successful Google authentication
    Given I completed Google login
    When the callback page receives an authorization code
    Then the code is exchanged for tokens
    And I am redirected to the home page

  Scenario: Authentication error from provider
    Given the login provider returned an error
    When the callback page loads
    Then I see an error message
    And I see a "Tagasi avalehele" button

  Scenario: Missing token in callback
    Given the callback URL has no tokens or code
    When the callback page loads
    Then I am redirected to the home page
`,

  'US-042-auth-callback': `@ready @auth @callback @US-042
Feature: Process authentication callback (US-042)
  As a user completing login
  I want the callback page to process my authentication tokens
  So that I am securely logged in and redirected to the app

  Scenario: Successful TARA authentication
    Given I completed TARA login
    When the callback page receives access and ID tokens
    Then I am redirected to the home page
    And I am authenticated

  Scenario: Successful Google authentication
    Given I completed Google login
    When the callback page receives an authorization code
    Then the code is exchanged for tokens
    And I am redirected to the home page

  Scenario: Authentication error from provider
    Given the login provider returned an error
    When the callback page loads
    Then I see an error message
    And I see a "Tagasi avalehele" button

  Scenario: Missing token in callback
    Given the callback URL has no tokens or code
    When the callback page loads
    Then I am redirected to the home page
`,

  'US-043-login-modal 2': `@ready @auth @login @US-043
Feature: Login modal with provider options (US-043)
  As an unauthenticated user
  I want to see a login modal with multiple sign-in options
  So that I can choose my preferred authentication method

  Scenario: See login modal
    Given I am not authenticated
    When I click the login button
    Then I see the login modal
    And I see the TARA login button
    And I see the Google login button

  Scenario: Login with TARA
    Given I see the login modal
    When I click "Logi sisse TARA-ga"
    Then the TARA authentication flow starts
    And the button shows loading state

  Scenario: Login with Google
    Given I see the login modal
    When I click "Jätka Google'iga"
    Then the Google authentication flow starts
    And the button shows loading state

  Scenario: Close login modal
    Given I see the login modal
    When I click the close button
    Then the login modal closes

  Scenario: Show login error
    Given I see the login modal
    When the login attempt fails
    Then I see an error message in the modal
`,

  'US-043-login-modal': `@ready @auth @login @US-043
Feature: Login modal with provider options (US-043)
  As an unauthenticated user
  I want to see a login modal with multiple sign-in options
  So that I can choose my preferred authentication method

  Scenario: See login modal
    Given I am not authenticated
    When I click the login button
    Then I see the login modal
    And I see the TARA login button
    And I see the Google login button

  Scenario: Login with TARA
    Given I see the login modal
    When I click "Logi sisse TARA-ga"
    Then the TARA authentication flow starts
    And the button shows loading state

  Scenario: Login with Google
    Given I see the login modal
    When I click "Jätka Google'iga"
    Then the Google authentication flow starts
    And the button shows loading state

  Scenario: Close login modal
    Given I see the login modal
    When I click the close button
    Then the login modal closes

  Scenario: Show login error
    Given I see the login modal
    When the login attempt fails
    Then I see an error message in the modal
`,

  'US-066-user-identity 2': `@ready @auth @identity @US-066
Feature: User identity from Estonian ID code (US-066)
  As an authenticated user with Estonian eID
  I want my identity to be validated and displayed correctly
  So that the system recognizes me properly

  Scenario: Valid Estonian ID code is accepted
    Given I log in with a valid Estonian ID code
    Then my identity is verified
    And my name is derived from the ID code

  Scenario: Invalid ID code is rejected
    Given I attempt to log in with an invalid ID code
    Then the validation fails
    And I see an authentication error

  Scenario: ID code format is displayed correctly
    Given I am authenticated with Estonian eID
    When I view my profile
    Then my ID code is displayed in formatted groups
`,

  'US-066-user-identity': `@ready @auth @identity @US-066
Feature: User identity from Estonian ID code (US-066)
  As an authenticated user with Estonian eID
  I want my identity to be validated and displayed correctly
  So that the system recognizes me properly

  Scenario: Valid Estonian ID code is accepted
    Given I log in with a valid Estonian ID code
    Then my identity is verified
    And my name is derived from the ID code

  Scenario: Invalid ID code is rejected
    Given I attempt to log in with an invalid ID code
    Then the validation fails
    And I see an authentication error

  Scenario: ID code format is displayed correctly
    Given I am authenticated with Estonian eID
    When I view my profile
    Then my ID code is displayed in formatted groups
`,

  'US-082-auth-token-storage 2': `@ready @auth @storage @US-082
Feature: Authentication token storage and retrieval (US-082)
  As an authenticated user
  I want my auth tokens to be securely stored
  So that I remain logged in across page refreshes

  Scenario: Tokens are stored after successful login
    Given I complete the login flow
    Then access, ID, and refresh tokens are stored locally

  Scenario: Tokens are used for API requests
    Given I am authenticated with stored tokens
    When I make an API request
    Then the ID token is sent as Bearer authorization

  Scenario: Tokens are cleared on logout
    Given I am authenticated
    When I log out
    Then all stored tokens are removed
    And I am no longer authenticated

  Scenario: Session persists across page refresh
    Given I am authenticated
    When I refresh the page
    Then I am still authenticated
    And my user profile is displayed
`,

  'US-082-auth-token-storage': `@ready @auth @storage @US-082
Feature: Authentication token storage and retrieval (US-082)
  As an authenticated user
  I want my auth tokens to be securely stored
  So that I remain logged in across page refreshes

  Scenario: Tokens are stored after successful login
    Given I complete the login flow
    Then access, ID, and refresh tokens are stored locally

  Scenario: Tokens are used for API requests
    Given I am authenticated with stored tokens
    When I make an API request
    Then the ID token is sent as Bearer authorization

  Scenario: Tokens are cleared on logout
    Given I am authenticated
    When I log out
    Then all stored tokens are removed
    And I am no longer authenticated

  Scenario: Session persists across page refresh
    Given I am authenticated
    When I refresh the page
    Then I am still authenticated
    And my user profile is displayed
`,

  'US-092-post-login-redirect 2': `@ready @auth @redirect @US-092
Feature: Post-login redirect to intended page (US-092)
  As a user who was redirected to login
  I want to be taken back to my intended destination after login
  So that my workflow is not interrupted by authentication

  Scenario: Redirect to tasks after login from tasks link
    Given I am not authenticated
    And I clicked the tasks navigation link
    When I successfully log in
    Then I am redirected to the tasks page

  Scenario: Stay on synthesis after direct login
    Given I am on the synthesis page
    When I click login and authenticate
    Then I remain on the synthesis page

  Scenario: Pending redirect is cleared after navigation
    Given I was redirected to login from tasks
    And I successfully logged in
    When the redirect completes
    Then the pending redirect state is cleared
`,

  'US-092-post-login-redirect': `@ready @auth @redirect @US-092
Feature: Post-login redirect to intended page (US-092)
  As a user who was redirected to login
  I want to be taken back to my intended destination after login
  So that my workflow is not interrupted by authentication

  Scenario: Redirect to tasks after login from tasks link
    Given I am not authenticated
    And I clicked the tasks navigation link
    When I successfully log in
    Then I am redirected to the tasks page

  Scenario: Stay on synthesis after direct login
    Given I am on the synthesis page
    When I click login and authenticate
    Then I remain on the synthesis page

  Scenario: Pending redirect is cleared after navigation
    Given I was redirected to login from tasks
    And I successfully logged in
    When the redirect completes
    Then the pending redirect state is cleared
`,
};
