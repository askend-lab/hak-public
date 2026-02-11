@ready @tasks @list @US-076
Feature: Task list row with expandable description (US-076)
  As a language teacher
  I want to see task summaries in a list with expandable details
  So that I can quickly scan and manage my tasks

  Background:
    Given I am authenticated
    And I am on the tasks page
    And I have multiple tasks

  Scenario: See task row with name and meta
    Then each task row shows the task name
    And each row shows the entry count
    And each row shows the creation date

  Scenario: Expand truncated description
    Given a task has a long description
    When I click "Näita rohkem"
    Then the full description is revealed

  Scenario: Collapse expanded description
    Given a task description is expanded
    When I click "Näita vähem"
    Then the description is truncated again

  Scenario: Click task row to view details
    When I click on a task row
    Then I navigate to the task detail view

  Scenario: Open task row context menu
    When I click the more options button on a task row
    Then I see options for "Muuda", "Jaga", and "Kustuta"
