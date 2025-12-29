@auth @redirect @US-028
Feature: US-028 Redirect to login for protected features
  As an unauthenticated user
  I want to be redirected to login when accessing protected features
  So that I understand authentication is required

  Scenario: Protected route access attempt
    Given I am not logged in
    When I try to access a protected page
    Then I am redirected to the login page

  Scenario: Informative message on redirect
    Given I am redirected to login
    When the login page loads
    Then I see a message explaining authentication is required

  Scenario: Return to intended page after login
    Given I was redirected from a protected page
    When I successfully log in
    Then I am redirected back to the original page

  Scenario: Disabled protected actions for guests
    Given I am not logged in
    When I view synthesis results
    Then the "Add to task" button shows login required
