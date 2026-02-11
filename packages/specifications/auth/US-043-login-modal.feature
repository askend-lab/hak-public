@auth @login @US-043
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
