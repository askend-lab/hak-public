@ready
Feature: Testing Strategy (US-105)

  Smoke tests, route consistency, and deployment verification
  that ensure the system works end-to-end.

  Scenario: 1.1 Smoke tests verify deployments
    Given deployments must be validated in target environment
    Then bash smoke tests check all API endpoint reachability
    And Jest smoke tests verify CloudFront routing
    And smoke tests accept 401 for auth-required endpoints

  Scenario: 1.2 Route consistency tests prevent 404 errors
    Given CloudFront rewrites paths before forwarding
    Then a test verifies every CloudFront route matches serverless
    And the test catches /api/ prefix bugs in serverless routes
    And the test runs in CI on every PR

  Scenario: 1.3 Smoke tests use CloudFront URLs
    Given all backend APIs are only via CloudFront
    Then smoke tests use the CloudFront domain as base URL
    And health endpoints return 200 with status ok
    And auth-required endpoints accept 401 as valid routing

  Scenario: 1.4 Specifications follow naming convention
    Given feature files must be discoverable and organized
    Then every feature file is named US-{number}-{slug}.feature
    And feature files are grouped into domain directories

  Scenario: 1.5 Shared package provides common utilities
    Given multiple packages need consistent utilities
    Then the shared package exports logging and error handling
    And all backend packages depend on the shared package
