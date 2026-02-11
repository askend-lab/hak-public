@misc @onboarding @US-036
Feature: Select user role on first visit (US-036)
  As a first-time user
  I want to select my role (learner, teacher, or researcher)
  So that the application can tailor the experience to my needs

  Scenario: Redirect to role selection on first visit
    Given I am a new user visiting for the first time
    When I visit the application
    Then I am redirected to the role selection page
    And I see three role options

  Scenario: Select learner role
    Given I am on the role selection page
    When I select the "Õppija" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Select teacher role
    Given I am on the role selection page
    When I select the "Õpetaja" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Select researcher role
    Given I am on the role selection page
    When I select the "Uurija" role
    Then I am redirected to the synthesis page
    And the onboarding wizard starts

  Scenario: Role selection persists across sessions
    Given I have selected the "Õppija" role
    When I refresh the page
    Then I am not redirected to role selection
    And I see the synthesis page

  Scenario: Skip role selection with shared task link
    Given I have a shared task link
    When I open the shared link
    Then I am not redirected to role selection
