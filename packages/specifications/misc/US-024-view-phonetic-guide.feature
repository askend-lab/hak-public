@misc @US-024
Feature: View phonetic symbols reference guide (US-024)
  As a language learner
  I want to view an explanation of phonetic markers
  So that I can understand the stress and pronunciation symbols

  Scenario: Open phonetic guide via help icon
    Given I am viewing the synthesis page
    When I click the help icon (?) near the phonetic text
    Then the phonetic guide modal opens
    And I see explanations for phonetic symbols

  Scenario: View symbol explanations
    Given the phonetic guide is open
    When I read through the content
    Then I see explanation for ` (third degree length)
    And I see explanation for ´ (stress marker)
    And I see explanation for ' (palatalization)
    And I see explanation for + (compound word boundary)

  Scenario: Examples provided for each symbol
    Given the phonetic guide is open
    When I view a symbol's explanation
    Then I see example words using that symbol
    And the examples show correct usage in context

  Scenario: Close phonetic guide
    Given the phonetic guide modal is open
    When I click the close button
    Then the modal closes
    And I return to the main synthesis view
