// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab
//
// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm --filter @hak/frontend sync-features
// Group: sharing

export const FEATURES_SHARING: Record<string, string> = {
  'US-022-generate-share-link': `@sharing @US-022
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

  'US-023-access-shared-task': `@sharing @US-023
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

  'US-032-copy-shared-entries': `@sharing @US-032
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

  'US-044-shared-task-page 2': `@ready @sharing @shared-page @US-044
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
`,

  'US-044-shared-task-page': `@ready @sharing @shared-page @US-044
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
`,

  'US-053-share-task-modal 2': `@ready @sharing @modal @US-053
Feature: Share task via modal with copy link (US-053)
  As a language teacher
  I want to share a task using a modal with a copy-link button
  So that I can easily distribute the share URL to students

  Scenario: Open share modal
    Given I am authenticated
    And I have a task with a share token
    When I click the share button on the task
    Then I see the share task modal

  Scenario: See share link in modal
    Given the share modal is open
    Then I see the share URL in a read-only input field
    And the URL contains the share token

  Scenario: Copy share link to clipboard
    Given the share modal is open
    When I click the "Kopeeri" button
    Then the share URL is copied to clipboard
    And I see a success notification

  Scenario: Close share modal
    Given the share modal is open
    When I close the modal
    Then the share modal disappears
`,

  'US-053-share-task-modal': `@ready @sharing @modal @US-053
Feature: Share task via modal with copy link (US-053)
  As a language teacher
  I want to share a task using a modal with a copy-link button
  So that I can easily distribute the share URL to students

  Scenario: Open share modal
    Given I am authenticated
    And I have a task with a share token
    When I click the share button on the task
    Then I see the share task modal

  Scenario: See share link in modal
    Given the share modal is open
    Then I see the share URL in a read-only input field
    And the URL contains the share token

  Scenario: Copy share link to clipboard
    Given the share modal is open
    When I click the "Kopeeri" button
    Then the share URL is copied to clipboard
    And I see a success notification

  Scenario: Close share modal
    Given the share modal is open
    When I close the modal
    Then the share modal disappears
`,

  'US-079-share-token-generation 2': `@ready @sharing @token @US-079
Feature: Share token generation and access (US-079)
  As a language teacher
  I want share tokens to be generated securely
  So that only people with the link can access my shared tasks

  Scenario: Generate unique share token
    Given I am authenticated
    And I have a task without a share token
    When I share the task
    Then a unique 16-character hex token is generated

  Scenario: Access task by share token
    Given a task has been shared with a token
    When someone opens the share URL with the token
    Then they can view the task without authentication

  Scenario: Invalid token returns not found
    Given I have a URL with a random invalid token
    When I try to access the shared task
    Then I see a "not found" error message

  Scenario: Task saved as unlisted on sharing
    Given I am authenticated
    When I share my task
    Then the task is saved as unlisted
    And it is accessible only via the share token
`,

  'US-079-share-token-generation': `@ready @sharing @token @US-079
Feature: Share token generation and access (US-079)
  As a language teacher
  I want share tokens to be generated securely
  So that only people with the link can access my shared tasks

  Scenario: Generate unique share token
    Given I am authenticated
    And I have a task without a share token
    When I share the task
    Then a unique 16-character hex token is generated

  Scenario: Access task by share token
    Given a task has been shared with a token
    When someone opens the share URL with the token
    Then they can view the task without authentication

  Scenario: Invalid token returns not found
    Given I have a URL with a random invalid token
    When I try to access the shared task
    Then I see a "not found" error message

  Scenario: Task saved as unlisted on sharing
    Given I am authenticated
    When I share my task
    Then the task is saved as unlisted
    And it is accessible only via the share token
`,

  'US-094-shared-task-audio-playback 2': `@ready @sharing @audio @US-094
Feature: Audio playback on shared task page (US-094)
  As a student accessing a shared task
  I want to play audio for entries on the shared page
  So that I can practice pronunciation from the teacher's materials

  Background:
    Given I am viewing a shared task with entries

  Scenario: Play individual entry audio
    When I click play on a shared entry
    Then the audio is synthesized and played
    And the play button shows playing state

  Scenario: Play all entries sequentially
    When I click the play all button
    Then entries are played one after another
    And the play all button shows active state

  Scenario: Stop playback on shared page
    Given audio is playing on the shared page
    When I click the play all button again
    Then playback stops
`,

  'US-094-shared-task-audio-playback': `@ready @sharing @audio @US-094
Feature: Audio playback on shared task page (US-094)
  As a student accessing a shared task
  I want to play audio for entries on the shared page
  So that I can practice pronunciation from the teacher's materials

  Background:
    Given I am viewing a shared task with entries

  Scenario: Play individual entry audio
    When I click play on a shared entry
    Then the audio is synthesized and played
    And the play button shows playing state

  Scenario: Play all entries sequentially
    When I click the play all button
    Then entries are played one after another
    And the play all button shows active state

  Scenario: Stop playback on shared page
    Given audio is playing on the shared page
    When I click the play all button again
    Then playback stops
`,
};
