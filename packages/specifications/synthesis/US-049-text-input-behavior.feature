@synthesis @input @US-049
Feature: Text input field behavior (US-049)
  As a language learner
  I want the text input to behave intuitively
  So that I can efficiently enter and manage sentences

  Background:
    Given I am on the synthesis page

  Scenario: Add new sentence row
    Given I have one sentence row
    When I click the add sentence button
    Then a new empty sentence row appears below

  Scenario: Clear sentence text
    Given I have a sentence "Tere"
    When I click the clear button on the sentence
    Then the sentence text is cleared
    And the input field is empty

  Scenario: Input focus after adding sentence
    Given I have one sentence row
    When I click the add sentence button
    Then the new sentence input is focused

  Scenario: Multiple sentence rows
    Given I have 3 sentences in the list
    Then I see 3 input rows
    And each row has its own play and menu buttons
