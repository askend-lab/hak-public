@ready
Feature: Development Workflow (US-104)

  Development practices and tooling that ensure
  consistent quality across the team.

  Scenario: 1.1 Development environment uses DevBox
    Given every developer must have a reproducible setup
    Then the environment is managed by DevBox
    And all system dependencies are declared in devbox.json

  Scenario: 1.2 Gherkin specifications drive development
    Given every user-facing requirement must be verifiable
    Then requirements are expressed as Gherkin scenarios
    And scenarios are organized by domain directories
    And automated step definitions exist in the frontend

  Scenario: 1.3 Git hooks enforce code quality
    Given broken code must not reach the repository
    Then pre-commit hooks run linters and formatters
    And pre-push hooks run the full test suite
    And hooks are in the .githooks directory

  Scenario: 1.4 ESLint enforces zero warnings
    Given code quality standards must be enforced
    Then ESLint runs with max-warnings=0
    And the sonarjs plugin catches code smells
    And Gherkin files are linted with gherkin-lint

  Scenario: 1.5 Unit tests use Jest
    Given every package needs automated tests
    Then Jest is the test runner for all TypeScript packages
    And each package has its own Jest configuration

  Scenario: 1.6 Mutation testing validates test quality
    Given tests must actually catch bugs
    Then mutation tests run on critical packages
    And mutation test files are named *.mutations.test.ts
