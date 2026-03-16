@ready @misc @profile @US-100
Feature: User profile display in header (US-100)
  As an authenticated user
  I want to see my profile information in the header
  So that I know which account I am logged in with

  Scenario: Show user avatar or initials in header
    Given I am authenticated
    Then I see my user profile in the header

  Scenario: Unauthenticated user sees login button
    Given I am not authenticated
    Then I see a "Logi sisse" button in the header

  Scenario: Profile shows user name
    Given I am authenticated with a display name
    Then I see my name in the profile area
