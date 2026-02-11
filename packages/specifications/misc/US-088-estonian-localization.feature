@misc @i18n @US-088
Feature: Estonian language localization (US-088)
  As an Estonian-speaking user
  I want the entire UI to be in Estonian
  So that I can use the application in my native language

  Scenario: Navigation labels are in Estonian
    Given I am on the synthesis page
    Then the navigation shows "Tekst kõneks" and "Ülesanded"

  Scenario: Button labels are in Estonian
    Given I am on the synthesis page
    Then the buttons show Estonian text like "Mängi kõik"
    And "Lisa ülesandesse" is displayed correctly

  Scenario: Error messages are in Estonian
    Given an error occurs in the application
    Then the error message is displayed in Estonian

  Scenario: Form labels and placeholders in Estonian
    Given I am creating a new task
    Then form fields show Estonian placeholders
    And validation messages are in Estonian
