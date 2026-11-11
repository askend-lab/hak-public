@ready @playlist @playback @US-087
Feature: Skip empty sentences during sequential playback (US-087)
  As a language learner
  I want empty sentences to be skipped during play all
  So that playback is not interrupted by blank entries

  Scenario: Skip empty rows during play all
    Given I have 3 sentence rows
    And the second row is empty
    When I click "Mängi kõik"
    Then only non-empty sentences are played
    And the empty row is skipped

  Scenario: No playback when all rows are empty
    Given all sentence rows are empty
    When I click "Mängi kõik"
    Then nothing is played

  Scenario: Play all with single non-empty sentence
    Given I have 3 sentence rows
    And only one has text
    When I click "Mängi kõik"
    Then only the sentence with text is played
