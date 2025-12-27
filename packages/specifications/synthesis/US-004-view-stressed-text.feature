Feature: View text with stress markers (US-004)
  As a language learner
  I want to see the Estonian text with stress markers visually indicated
  So that I can understand which syllables to emphasize when pronouncing

  Scenario: Display phonetic markers after synthesis
    Given I have entered "mees" in the text input
    When the synthesis is complete
    Then I see the phonetic text with stress markers
    And the stressed syllables are visually distinct

  Scenario: Show Estonian phonetic notation
    Given I have synthesized "koolitüdruk"
    When I view the phonetic form
    Then it uses Estonian phonetic markers (`, ´, ', +)
    And compound word boundaries are marked with "+"

  Scenario: Compare original and phonetic text
    Given I have synthesized "Tere hommikust"
    When I view the stressed text display
    Then I can see both original text and phonetic form
    And the differences are highlighted
