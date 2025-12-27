Feature: Generate shareable link for task (US-022)
  As a language teacher
  I want to generate a shareable link for my task
  So that I can distribute exercises to students

  Scenario: Share button visible on task
    Given I am viewing task details
    When the page loads
    Then I see a Share button

  Scenario: Generate unique share link
    Given I am viewing a task
    When I click the Share button
    Then a unique shareable URL is generated
    And the link is displayed in a dialog

  Scenario: Copy link to clipboard
    Given the share link dialog is open
    When I click "Copy link"
    Then the URL is copied to my clipboard
    And I see a confirmation message
