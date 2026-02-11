@misc @navigation @US-041
Feature: Navigate between application views (US-041)
  As a user of the application
  I want to navigate between synthesis, tasks, and other views
  So that I can access different features of the application

  Scenario: See navigation header
    Given I am on the synthesis page
    Then I see the application header
    And I see navigation links

  Scenario: Navigate to tasks view
    Given I am authenticated
    And I am on the synthesis page
    When I click the tasks navigation link
    Then I see the tasks view

  Scenario: Navigate back to synthesis
    Given I am authenticated
    And I am on the tasks page
    When I click the synthesis navigation link
    Then I see the synthesis page

  Scenario: Unauthenticated user sees login prompt for tasks
    Given I am not authenticated
    And I am on the synthesis page
    When I click the tasks navigation link
    Then I see a login prompt

  Scenario: Access help from header
    Given I am on the synthesis page
    When I click the help button in the header
    Then I am redirected to the role selection page
