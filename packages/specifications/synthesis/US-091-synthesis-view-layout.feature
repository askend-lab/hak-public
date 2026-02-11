@ready @synthesis @layout @US-091
Feature: Synthesis page layout and header (US-091)
  As a language learner
  I want the synthesis page to have a clear layout
  So that I can easily enter text and manage sentences

  Scenario: See synthesis page header with controls
    Given I am on the synthesis page
    Then I see the page header with "Mängi kõik" button
    And I see the "Lisa ülesandesse" button

  Scenario: Add sentence button at bottom of list
    Given I am on the synthesis page
    Then I see an add sentence button below the sentence list

  Scenario: Sentence rows are numbered
    Given I have multiple sentence rows
    Then each row displays its position number

  Scenario: Variants panel appears beside sentence
    Given I opened the variants panel for a word
    Then the panel appears as a side panel
    And it does not overlap other sentences
