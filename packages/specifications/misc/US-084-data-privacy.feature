@ready @misc @privacy @US-084
Feature: Data privacy and API authorization (US-084)
  As a user of the application
  I want my data to be protected by proper authorization
  So that only I can access my private tasks and content

  Scenario: Private tasks require authentication
    Given I am not authenticated
    When I try to load user tasks via API
    Then the request is rejected with authorization error

  Scenario: Shared tasks are accessible without login
    Given a task is shared as unlisted
    When an unauthenticated user accesses the share link
    Then the task content is returned

  Scenario: Private data uses Bearer token
    Given I am authenticated
    When I make an API request to a private endpoint
    Then the Authorization header contains the Bearer token

  Scenario: Privacy notice is shown on login
    Given I see the login modal
    Then I see privacy terms notice at the bottom
