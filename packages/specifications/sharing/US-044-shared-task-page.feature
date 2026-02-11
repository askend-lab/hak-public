@sharing @shared-page @US-044
Feature: View and interact with shared task page (US-044)
  As a student accessing a shared task
  I want to view task entries and play audio on the shared page
  So that I can practice pronunciation from teacher-created materials

  Scenario: View shared task with entries
    Given I have a valid share token
    When I open the shared task page
    Then I see the task name and description
    And I see the list of task entries

  Scenario: Play individual entry on shared page
    Given I am viewing a shared task with entries
    When I click play on an entry
    Then the audio for that entry is synthesized and played

  Scenario: Play all entries on shared page
    Given I am viewing a shared task with entries
    When I click the "Play all" button
    Then all entries are played sequentially

  Scenario: Copy entries to my playlist
    Given I am viewing a shared task with entries
    When I click the "Kopeeri" button
    Then the entries are saved to my session
    And I am redirected to the synthesis page

  Scenario: Invalid share token shows error
    Given I have an invalid share token
    When I open the shared task page
    Then I see "Ülesannet ei leitud" error message

  Scenario: Empty shared task
    Given I have a valid share token for an empty task
    When I open the shared task page
    Then I see a message that the task has no entries
