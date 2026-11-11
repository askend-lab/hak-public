@ready @misc @modal @US-095
Feature: Base modal common behavior (US-095)
  As a user of the application
  I want all modals to behave consistently
  So that I have a predictable and accessible experience

  Scenario: Modal overlay blocks background interaction
    Given a modal is open
    Then a backdrop overlay is displayed
    And clicking the backdrop closes the modal

  Scenario: Modal shows close button when configured
    Given a modal with close button is open
    Then I see an X close button in the header

  Scenario: Modal sizes adapt to content
    Given a small modal is open
    Then the modal uses compact sizing
    And a medium modal uses wider sizing

  Scenario: Modal prevents scroll on body
    Given a modal is open
    Then the page background cannot be scrolled
