@ready @tasks @search @US-048
Feature: Search and filter tasks in sentence menu (US-048)
  As a language learner with many tasks
  I want to search for specific tasks in the sentence menu
  So that I can quickly find and add sentences to the right task

  Background:
    Given I am authenticated
    And I am on the synthesis page
    And I have a sentence "Tere"

  Scenario: See search input in task menu
    When I click the three-dots menu on a sentence
    Then I see a search input field for tasks

  Scenario: Filter tasks by name
    When I click the three-dots menu on a sentence
    And I type "Harjutus" in the search input
    Then I see only tasks matching "Harjutus"

  Scenario: No results for search query
    When I click the three-dots menu on a sentence
    And I type "nonexistent" in the search input
    Then I see no matching tasks

  Scenario: Create new task from menu
    When I click the three-dots menu on a sentence
    And I click "Loo uus ülesanne"
    Then a new task is created with the sentence
