@misc @ux @US-069
Feature: Loading states and spinners (US-069)
  As a user of the application
  I want to see loading indicators during async operations
  So that I know the application is working and not frozen

  Scenario: Show spinner during page load
    Given I am loading the application
    Then I see a loading spinner
    And the spinner disappears when content loads

  Scenario: Show loading state during synthesis
    Given I have entered text for synthesis
    When the synthesis is processing
    Then the play button shows a loading spinner

  Scenario: Show loading state for task list
    Given I am authenticated
    When I navigate to the tasks page
    Then I see a loading indicator until tasks are fetched

  Scenario: Show loading state in shared task page
    Given I open a shared task link
    Then I see "Laadimine..." while the task loads
