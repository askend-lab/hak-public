@misc @specs @US-051
Feature: View feature specifications and test results (US-051)
  As a developer or stakeholder
  I want to view Gherkin specifications with test status
  So that I can track feature coverage and test results

  Scenario: Navigate to specs page
    Given I am on the synthesis page
    When I navigate to the specs page
    Then I see the specs page with feature groups

  Scenario: Expand feature group
    Given I am on the specs page
    When I click on a feature group
    Then the group expands showing individual features

  Scenario: View feature details
    Given I am on the specs page
    When I select a feature
    Then I see the feature scenarios and their descriptions

  Scenario: See test status for scenarios
    Given I am on the specs page
    When I select a feature with test results
    Then I see pass or fail status for each scenario

  Scenario: Navigate back from specs
    Given I am on the specs page
    When I click the back button
    Then I return to the synthesis page
