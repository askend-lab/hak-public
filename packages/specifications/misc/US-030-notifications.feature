@misc @US-030
Feature: Display and dismiss notifications (US-030)
  As a user of the application
  I want to see notifications for system messages
  So that I am informed about successes, errors, and important information

  Scenario: Show success notification
    Given a successful action occurs
    Then I see a success notification
    And it is colored green

  Scenario: Show error notification
    Given an error occurs
    Then I see an error notification
    And it is colored red

  Scenario: Dismiss notification manually
    Given a notification is visible
    When I click the notification close button
    Then the notification disappears

  Scenario: Auto-dismiss notification
    Given a notification is visible
    When 5 seconds pass
    Then the notification automatically disappears

  Scenario: Multiple notifications stack
    Given multiple events occur
    Then notifications stack without overlapping
