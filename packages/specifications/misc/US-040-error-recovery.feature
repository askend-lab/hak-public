@ready @misc @error-handling @US-040
Feature: Graceful error recovery (US-040)
  As a user of the application
  I want the application to handle errors gracefully
  So that I can recover from unexpected issues without losing my work

  Scenario: Show error boundary on component crash
    Given I am using the application
    When a component error occurs
    Then I see an error message "Midagi läks valesti"
    And I see a "Proovi uuesti" button

  Scenario: Recover from error via retry button
    Given I see an error boundary message
    When I click the "Proovi uuesti" button
    Then the error is cleared
    And the application renders normally

  Scenario: Show fallback UI when provided
    Given a component has a custom error fallback
    When the component crashes
    Then the custom fallback UI is displayed

  Scenario: API error shows notification
    Given I am on the synthesis page
    When an API request fails
    Then I see an error notification
    And I can continue using the application
