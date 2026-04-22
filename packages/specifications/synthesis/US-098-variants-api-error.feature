@ready @synthesis @variants @US-098
Feature: Handle variants API errors gracefully (US-098)
  As a language learner
  I want the variants panel to handle API errors
  So that I can continue using the app even when variants fail

  Scenario: Show error when variants API fails
    Given I am on the synthesis page
    When I click a word tag to view variants
    And the variants API returns an error
    Then I see an error message in the variants panel

  Scenario: Retry after variants API failure
    Given the variants panel shows an error
    When I close and reopen the variants panel
    Then a new API request is made

  Scenario: Show loading state while fetching variants
    When I click a word tag to view variants
    Then the variants panel shows a loading indicator
