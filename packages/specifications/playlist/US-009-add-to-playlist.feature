Feature: Add sentence to synthesis list (US-009)
  As a language learner
  I want to add multiple sentence rows to the synthesis page
  So that I can prepare and practice several phrases in one session

  Scenario: Add sentence button is visible
    Given I am on the synthesis page
    When I view the sentences section
    Then I see a "Lisa lause" button at the bottom

  Scenario: Add new sentence row
    Given I am on the synthesis page
    When I click the "Lisa lause" button
    Then a new empty sentence row is added to the list
    And I can start typing text in the new row

  Scenario: Multiple sentences support
    Given I have one sentence row with text "Tere"
    When I click the "Lisa lause" button
    Then I have two sentence rows in the list
    And each sentence has a unique ID
