@sharing @US-022
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
