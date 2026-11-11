@sharing @US-032
Feature: Copy shared task entries to playlist (US-032)
  As a language learner
  I want to copy entries from a shared task to my own playlist
  So that I can practice with teacher-created materials

  Background:
    Given I am viewing a shared task

  Scenario: See copy button on shared task
    Then I see a "Copy to Playlist" button

  Scenario: Copy entries without authentication
    Given I am not authenticated
    When I click the "Copy to Playlist" button
    Then entries are copied to my local playlist

  Scenario: Login prompt when saving
    Given I am not authenticated
    When I try to save copied entries to a task
    Then I see a login prompt

  Scenario: Entries appear in synthesis view
    When I copy entries from shared task
    Then I see the entries in synthesis view

  Scenario: Pending action executes after login
    Given I am not authenticated
    And I tried to save copied entries
    When I log in
    Then the pending save action executes

  Scenario: Success notification on copy
    When I copy entries from shared task
    Then I see a success notification

  Scenario: Save copied entries to own task
    Given I am authenticated
    When I copy entries and save to a task
    Then entries are saved to my task

  Scenario: Audio preserved in copied entries
    When I copy entries from shared task
    Then audio data is preserved in copied entries
