@auth @storage @US-082
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
