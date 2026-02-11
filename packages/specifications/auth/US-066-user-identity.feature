@auth @identity @US-066
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
