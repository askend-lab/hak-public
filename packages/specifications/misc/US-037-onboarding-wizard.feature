@ready @misc @onboarding @US-037
Feature: Onboarding wizard guides new users (US-037)
  As a new user who has selected a role
  I want to see guided tooltips highlighting key features
  So that I can quickly learn how to use the application

  Scenario: Wizard starts after role selection
    Given I have selected a role
    When the synthesis page loads
    Then I see the first wizard tooltip
    And it highlights the text input area

  Scenario: Navigate through wizard steps
    Given the onboarding wizard is active
    When I follow the tooltip instructions
    Then the next tooltip appears
    And it highlights the next feature

  Scenario: Wizard shows role-specific steps
    Given I selected the "Õpetaja" role
    When the onboarding wizard starts
    Then the wizard includes a step about creating tasks

  Scenario: Complete the wizard
    Given I am on the last wizard step
    When I complete the final step
    Then the wizard closes
    And I can use the application freely

  Scenario: Wizard does not repeat after completion
    Given I have completed the onboarding wizard
    When I refresh the page
    Then the wizard does not appear again

  Scenario: Demo sentences appear during wizard
    Given the onboarding wizard is active
    When I reach the input step
    Then demo sentences are pre-filled for practice
