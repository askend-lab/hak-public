@tasks @entries @US-050
Feature: Manage entries within a task (US-050)
  As a language teacher
  I want to manage individual entries within a task
  So that I can curate the best pronunciation exercises

  Background:
    Given I am authenticated
    And I am viewing a task with entries

  Scenario: See task entries list
    Then I see all entries in the task
    And each entry shows its text content

  Scenario: Play entry audio from task view
    When I click the play button on an entry
    Then the audio for that entry is synthesized and played

  Scenario: Remove entry from task
    When I click remove on an entry
    Then the entry is removed from the task

  Scenario: Empty task shows helpful message
    Given I am viewing an empty task
    Then I see a message suggesting to add entries
    And I see a link to the synthesis page
