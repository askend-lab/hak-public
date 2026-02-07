// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: sharing

export const FEATURES_SHARING: Record<string, string> = {
  "US-022-generate-share-link": `@sharing @US-022
Feature: Generate shareable link for task (US-022)
  As a language teacher
  I want to generate a shareable link for my task
  So that I can distribute exercises to students

  Background:
    Given I am authenticated
    And I am viewing task details

  Scenario: See share button
    Then I see a "Share" button

  Scenario: Generate unique link
    When I click the "Share" button
    Then a unique shareable URL is generated

  Scenario: Display share link
    When I click the "Share" button
    Then I see the share link in a dialog

  Scenario: Copy link to clipboard
    When I click the "Share" button
    And I click the "Copy link" button
    Then the URL is copied to clipboard

  Scenario: Link persists across sessions
    When I generate a share link
    And I close and reopen the task
    Then the same share link is available
`,

  "US-023-access-shared-task": `@sharing @US-023
Feature: Access shared task via link (US-023)
  As a language student
  I want to access a task via a shared link
  So that I can complete exercises assigned by my teacher

  Scenario: Open shared task link
    Given I have a shared task link
    When I open the shared link
    Then I see the shared task details

  Scenario: Read-only view
    Given I am viewing a shared task
    Then I can see all task entries
    And I cannot edit the task
    And I cannot delete the task

  Scenario: Play audio entries
    Given I am viewing a shared task
    When I click play on an entry
    Then I hear the synthesized audio

  Scenario: Access without authentication
    Given I am not authenticated
    When I open a shared task link
    Then I can still view the task content

  Scenario: Copy shared task to my tasks
    Given I am authenticated
    And I am viewing a shared task
    When I click the "Copy to my tasks" button
    Then the task is copied to my task list
`,

  "US-032-copy-shared-entries": `@sharing @US-032
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
`,
};
