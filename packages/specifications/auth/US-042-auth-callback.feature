@ready @auth @callback @US-042
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
