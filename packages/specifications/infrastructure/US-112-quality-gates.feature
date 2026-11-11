@ready
Feature: Quality Gates — Linting and Analysis (US-112)

  Automated quality enforcement across the codebase.
  Every merge to main must pass all gates.

  Scenario: 1.1 ESLint reports zero errors and warnings
    Given the TypeScript codebase across all packages
    When ESLint runs with --max-warnings=0
    Then zero errors and zero warnings are reported

  Scenario: 1.2 Gherkin feature files pass linting
    Given the Gherkin specifications
    When gherkin-lint runs on all .feature files
    Then zero linting violations are found

  Scenario: 1.3 SCSS styles pass linting
    Given the frontend stylesheets
    When stylelint runs on all .scss files
    Then zero style violations are found

  Scenario: 1.4 TypeScript type checking passes
    Given all TypeScript packages with tsconfig.json
    When tsc --noEmit runs in strict mode
    Then zero type errors are reported

  Scenario: 1.5 All unit tests pass
    Given the test suite across all packages
    When Jest runs with --passWithNoTests
    Then all test suites pass with zero failures

  Scenario: 1.6 Route consistency test catches mismatches
    Given CloudFront routes defined in locals.tf
    When the route consistency test runs
    Then every CloudFront route matches a serverless route
    And no serverless route starts with /api/ prefix
