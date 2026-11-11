@ready @sharing @modal @US-053
Feature: Share task via modal with copy link (US-053)
  As a language teacher
  I want to share a task using a modal with a copy-link button
  So that I can easily distribute the share URL to students

  Scenario: Open share modal
    Given I am authenticated
    And I have a task with a share token
    When I click the share button on the task
    Then I see the share task modal

  Scenario: See share link in modal
    Given the share modal is open
    Then I see the share URL in a read-only input field
    And the URL contains the share token

  Scenario: Copy share link to clipboard
    Given the share modal is open
    When I click the "Kopeeri" button
    Then the share URL is copied to clipboard
    And I see a success notification

  Scenario: Close share modal
    Given the share modal is open
    When I close the modal
    Then the share modal disappears
