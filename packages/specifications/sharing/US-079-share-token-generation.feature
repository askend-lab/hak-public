@sharing @token @US-079
Feature: Share token generation and access (US-079)
  As a language teacher
  I want share tokens to be generated securely
  So that only people with the link can access my shared tasks

  Scenario: Generate unique share token
    Given I am authenticated
    And I have a task without a share token
    When I share the task
    Then a unique 16-character hex token is generated

  Scenario: Access task by share token
    Given a task has been shared with a token
    When someone opens the share URL with the token
    Then they can view the task without authentication

  Scenario: Invalid token returns not found
    Given I have a URL with a random invalid token
    When I try to access the shared task
    Then I see a "not found" error message

  Scenario: Task saved as unlisted on sharing
    Given I am authenticated
    When I share my task
    Then the task is saved as unlisted
    And it is accessible only via the share token
