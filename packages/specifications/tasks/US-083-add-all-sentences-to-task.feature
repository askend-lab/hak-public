@ready @tasks @bulk @US-083
Feature: Add all playlist sentences to a task (US-083)
  As a language teacher
  I want to add all current playlist sentences to a task at once
  So that I can quickly save my work as a reusable exercise

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have multiple sentences with text

  Scenario: See add all to task button
    Then I see a "Lisa ülesandesse" button

  Scenario: Add all sentences to existing task
    When I click "Lisa ülesandesse"
    And I select an existing task from the dropdown
    Then all sentences are added to that task
    And I see a success notification

  Scenario: Create new task from all sentences
    When I click "Lisa ülesandesse"
    And I click "Loo uus ülesanne"
    Then a new task is created with all sentences
    And I am redirected to the tasks view

  Scenario: Button disabled when no text entered
    Given all sentence inputs are empty
    Then the "Lisa ülesandesse" button is disabled
