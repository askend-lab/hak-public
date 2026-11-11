@auth @US-026
Feature: View user profile (US-026)
  As an authenticated user
  I want to view my profile information
  So that I can see my account details and settings

  Background:
    Given I am logged in

  Scenario: Access profile via user icon
    When I click on my user icon
    Then I see my profile dropdown

  Scenario: See profile information
    When I view my profile
    Then I see my name
    And I see my account creation date

  Scenario: See task statistics
    When I view my profile
    Then I see number of tasks created
    And I see total entries count

  Scenario: See recent activity
    When I view my profile
    Then I see my recent tasks
