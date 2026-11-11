@ready @tasks @bulk @US-101
Feature: Append or replace sentences when adding to existing task (US-101)
  As a language teacher
  I want to choose between appending and replacing sentences when adding to an existing task
  So that I can either extend the task or start fresh with new content

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have multiple sentences with text
    And there is an existing task "ccc" with 1 sentence

  Scenario: See append and replace options when task has entries
    When I click "Lisa ülesandesse"
    And I select the existing task "ccc"
    Then I see the task has 1 existing sentence
    And I see a "Lisa juurde" button
    And I see a "Asenda olemasolevad" button

  Scenario: Append sentences to existing task
    When I click "Lisa ülesandesse"
    And I select the existing task "ccc"
    And I click "Lisa juurde"
    Then the new sentences are added after existing ones
    And the task now has both old and new sentences
    And I see a success notification

  Scenario: Replace sentences in existing task
    When I click "Lisa ülesandesse"
    And I select the existing task "ccc"
    And I click "Asenda olemasolevad"
    Then all existing sentences are removed
    And only the new sentences remain in the task
    And I see a success notification

  Scenario: Append preserves sentence order
    When I append 2 sentences to a task with 1 existing sentence
    Then the existing sentence keeps order 1
    And the new sentences have orders 2 and 3

  Scenario: Replace resets sentence order
    When I replace sentences in a task with 2 new sentences
    Then the new sentences have orders 1 and 2

  Scenario: Default behavior is append
    When I add sentences to a task without specifying mode
    Then the sentences are appended to the existing ones
