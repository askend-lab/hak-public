@ready @misc @responsive @US-090
Feature: Responsive page layout (US-090)
  As a user on different devices
  I want the application layout to adapt to my screen size
  So that I can use the app comfortably on mobile and desktop

  Scenario: Desktop layout shows full header
    Given I am on a desktop screen
    Then the header shows logo, navigation, and user controls
    And the footer shows all sections side by side

  Scenario: Sentence menu positions correctly
    Given I am on the synthesis page
    When I open a sentence context menu
    Then the menu is positioned near the trigger button
    And it stays within the viewport bounds

  Scenario: Modal adapts to screen size
    Given I open a modal dialog
    Then the modal is centered on screen
    And it has appropriate padding from screen edges
