@playlist @US-011
Feature: Play all sentences sequentially (US-011)
  As a language learner
  I want to play all my sentences in sequence
  So that I can practice listening to multiple phrases without interruption

  Scenario: Play all button shows sentence count
    Given I have 3 sentences with text
    When I view the synthesis page
    Then I see a "Mängi kõik" button showing count "(3)"

  Scenario: Sequential playback of sentences
    Given I have sentences "Tere" and "Hommikust"
    When I click the "Mängi kõik" button
    Then each sentence is played in order
    And the next sentence starts after the previous finishes

  Scenario: Skip empty sentences
    Given I have sentence "Tere" and an empty sentence
    When I click the "Mängi kõik" button
    Then only "Tere" is played
    And empty sentences are skipped

  Scenario: Stop sequential playback
    Given sequential playback is in progress
    When I click the "Peata" button
    Then playback stops immediately
    And the button changes back to "Mängi kõik"
