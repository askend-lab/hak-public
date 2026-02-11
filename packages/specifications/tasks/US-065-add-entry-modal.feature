@ready @tasks @modal @US-065
Feature: Add new task entry via modal (US-065)
  As a language teacher
  I want to add new entries to a task via a modal form
  So that I can build exercise collections efficiently

  Scenario: Open add entry modal
    Given I am viewing a task detail
    When I click the "Add entry" button
    Then the add entry modal opens

  Scenario: Add entry successfully
    Given the add entry modal is open
    When I enter "Tere tulemast" in the title field
    And I enter a description
    And I click "Lisa"
    Then the entry is added to the task
    And the modal closes

  Scenario: Validation error for empty title
    Given the add entry modal is open
    When I leave the title field empty
    And I click "Lisa"
    Then I see "Pealkiri on kohustuslik" error

  Scenario: Show loading state during submission
    Given the add entry modal is open
    When I submit the form
    Then the button shows "Lisaan..." loading text
    And the form fields are disabled
