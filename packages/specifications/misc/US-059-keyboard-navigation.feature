@ready @misc @keyboard @US-059
Feature: Keyboard navigation and shortcuts (US-059)
  As a power user
  I want to use keyboard shortcuts for common actions
  So that I can work more efficiently without using the mouse

  Background:
    Given I am on the synthesis page

  Scenario: Submit text with Enter key
    Given I am typing in the input field
    When I press Enter
    Then the text is submitted for synthesis

  Scenario: Navigate between sentence rows with Tab
    Given I have multiple sentence rows
    When I press Tab
    Then focus moves to the next interactive element

  Scenario: Close modal with Escape
    Given a modal is open
    When I press Escape
    Then the modal closes

  Scenario: Delete tag with Backspace
    Given I have existing tags and empty input
    When I press Backspace
    Then the last tag is removed
