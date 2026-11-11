@ready @playlist @storage @US-063
Feature: Persist synthesis state in local storage (US-063)
  As a language learner
  I want my sentence data to be saved in local storage
  So that I can resume my work after closing the browser

  Scenario: Save sentences to local storage on change
    Given I am on the synthesis page
    When I enter text in a sentence row
    Then the sentence state is saved to local storage

  Scenario: Restore sentences from local storage on load
    Given I have previously entered sentences
    When I reload the application
    Then my sentences are restored from local storage
    And the text content matches what I entered

  Scenario: Transient state is not persisted
    Given a sentence is currently playing audio
    When I reload the application
    Then the restored sentence is not in playing state
    And the restored sentence is not in loading state

  Scenario: Clear sentences clears storage
    Given I have sentences in local storage
    When I remove all sentences
    Then the local storage entry is cleared
