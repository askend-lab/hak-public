@misc @a11y @US-058
Feature: Accessibility support for screen readers (US-058)
  As a user with assistive technology
  I want the application to have proper ARIA labels and roles
  So that I can navigate and use all features with a screen reader

  Scenario: Navigation has ARIA landmarks
    Given I am on the synthesis page
    Then the header has a navigation landmark
    And the main content has a main landmark

  Scenario: Buttons have accessible labels
    Given I am on the synthesis page
    Then the help button has an aria-label
    And the play buttons have descriptive labels

  Scenario: Modals have dialog role
    Given a modal is open
    Then the modal has role "dialog"
    And focus is trapped inside the modal

  Scenario: Menu has proper ARIA roles
    Given the sentence context menu is open
    Then the menu has role "menu"
    And each menu item has role "menuitem"

  Scenario: Close menu with Escape key
    Given the sentence context menu is open
    When I press the Escape key
    Then the menu closes
