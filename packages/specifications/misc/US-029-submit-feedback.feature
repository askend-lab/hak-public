Feature: Submit feedback (US-029)
  As a user of the application
  I want to submit feedback about the platform
  So that I can report issues or suggest improvements

  Scenario: Feedback button is visible
    Given I am using the application
    When I view the footer area
    Then I see a feedback button or link

  Scenario: Open feedback form
    Given I am on the main page
    When I click the feedback button
    Then the feedback modal opens
    And I see a message input field
    And I see an optional email field

  Scenario: Submit feedback successfully
    Given the feedback form is open
    And I have entered "Great app!" in the message field
    When I click the submit button
    Then my feedback is submitted
    And I see a thank you confirmation message

  Scenario: Email field is optional
    Given the feedback form is open
    When I view the email field
    Then it is clearly marked as optional
    And I can submit without entering an email
