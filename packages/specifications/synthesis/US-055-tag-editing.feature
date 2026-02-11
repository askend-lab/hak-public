@ready @synthesis @tags @US-055
Feature: Edit word tags in synthesized text (US-055)
  As a language learner
  I want to edit individual word tags in the synthesized output
  So that I can correct or customize pronunciation of specific words

  Background:
    Given I am on the synthesis page
    And I am viewing synthesis results

  Scenario: Open tag menu on a word
    When I click on a word tag
    Then I see the tag context menu

  Scenario: Edit tag text inline
    Given the tag menu is open
    When I click the edit option
    Then the tag becomes editable
    And I can type a new value

  Scenario: Commit tag edit on Enter
    Given a tag is in edit mode
    When I press Enter
    Then the tag value is updated
    And the edit mode closes

  Scenario: Delete a tag
    Given the tag menu is open
    When I click the delete option
    Then the tag is removed from the sentence

  Scenario: View variants from tag menu
    Given the tag menu is open
    When I click to view pronunciation variants
    Then the variants panel opens for that word
