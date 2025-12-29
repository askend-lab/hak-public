@synthesis @US-008
Feature: Save phonetic text edits (US-008)
  As a language teacher
  I want to save my phonetic text edits
  So that I can reuse the customized pronunciation in future sessions

  Background:
    Given I have edited the phonetic text

  Scenario: Save confirmation
    When I click the save button
    Then a confirmation message appears

  Scenario: Edit persistence
    Given I have saved phonetic edits
    When I navigate away and return
    Then my edits are preserved

  Scenario: Reset to original
    Given I have saved edits
    When I click the reset button
    Then the phonetic text reverts to original
