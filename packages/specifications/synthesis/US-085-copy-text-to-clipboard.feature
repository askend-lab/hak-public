@ready @synthesis @clipboard @US-085
Feature: Copy synthesized text to clipboard (US-085)
  As a language learner
  I want to copy sentence text to the system clipboard
  So that I can paste it into other applications

  Scenario: Copy text from sentence menu
    Given I am on the synthesis page
    And I have a sentence "Tere tulemast"
    When I copy the sentence text via the menu
    Then the text is in my clipboard
    And I see a success notification

  Scenario: Copy text from task entry
    Given I am viewing a task with entries
    When I copy an entry's text
    Then the text is in my clipboard
    And I see "Tekst kopeeritud!" notification

  Scenario: Handle clipboard permission denied
    Given the browser denies clipboard access
    When I try to copy text
    Then I see an error notification
