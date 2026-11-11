@synthesis @phonetic @US-034
Feature: US-034 Create custom phonetic variant
  As a language learner or advanced user
  I want to manually create and test custom phonetic variants for words
  So that I can experiment with specific pronunciations not provided by the automatic variants

  Background:
    Given I am on the synthesis page
    And the pronunciation variants panel is open for a word

  Scenario: Custom variant input field visible
    When I scroll to the custom variant section
    Then I see a custom phonetic input field
    And the input field allows free text entry

  Scenario: Phonetic marker toolbar available
    Given I am in the custom variant input field
    Then I see quick-insert buttons for phonetic markers
    And I see a button for third quantity marker
    And I see a button for stressed syllable marker
    And I see a button for palatalization marker
    And I see a button for compound word boundary marker

  Scenario: Insert marker at cursor position
    Given I am in the custom variant input field
    And my cursor is at position 3
    When I click the stressed syllable marker button
    Then the marker is inserted at position 3
    And my cursor moves after the inserted marker

  Scenario: Preview custom variant
    Given I have entered a custom phonetic variant "m`ee+s"
    When I click the play button for custom variant
    Then the custom variant is synthesized
    And I hear the audio playback

  Scenario: Select custom variant
    Given I have created a custom phonetic variant
    When I click the "Kasuta" button for custom variant
    Then the custom variant replaces the word phonetic form
    And the variants panel closes

  Scenario: Access phonetic guide
    Given I am creating a custom variant
    When I click the phonetic guide button
    Then I see the phonetic guide modal
    And the guide explains available markers
