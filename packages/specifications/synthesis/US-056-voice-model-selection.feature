@synthesis @voice @US-056
Feature: Automatic voice model selection (US-056)
  As a language learner
  I want the system to automatically select the best voice model
  So that I hear natural pronunciation for different text types

  Scenario: Short word uses appropriate voice
    Given I am on the synthesis page
    When I enter a single word "Tere"
    And the synthesis completes
    Then the appropriate voice model is used for short text

  Scenario: Long sentence uses appropriate voice
    Given I am on the synthesis page
    When I enter a long sentence
    And the synthesis completes
    Then the appropriate voice model is used for long text

  Scenario: Phonetic text uses correct model
    Given I have edited the phonetic text with markers
    When I play the edited phonetic text
    Then the voice model matches the phonetic input type
