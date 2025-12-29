@tasks @US-021
Feature: Add playlist entries to task (US-021)
  As a language teacher
  I want to add entire playlist to a task
  So that I can save curated pronunciation sequences as exercises

  Background:
    Given I am authenticated

  Scenario: See add playlist to task button
    Given I have entries in playlist
    Then I see an "Add all to task" button

  Scenario: Add all entries to task
    Given I have entries in playlist
    When I click the "Add all to task" button
    And I select a task
    Then all playlist entries are added to the task

  Scenario: Preserve entry order
    Given I have multiple entries in playlist
    When I add playlist to task
    Then entries maintain their original order

  Scenario: Success notification after adding playlist
    Given I have entries in playlist
    When I add playlist to task successfully
    Then I see a success notification
