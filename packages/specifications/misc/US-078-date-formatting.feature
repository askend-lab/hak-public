@ready @misc @formatting @US-078
Feature: Estonian date and time formatting (US-078)
  As a user of the application
  I want dates and times to be displayed in Estonian format
  So that I can read temporal information naturally

  Scenario: Display task creation date in Estonian
    Given I am viewing the task list
    Then each task shows its creation date in Estonian format

  Scenario: Display activity timestamp in Estonian
    Given I am on the dashboard
    Then recent activity timestamps use Estonian locale

  Scenario: Display build date in Estonian format
    Given the build info modal is open
    Then the build date is formatted as Estonian date and time
