@ready
Feature: CI/CD Pipeline (US-110)

  Continuous integration, build, and deployment pipeline
  that ensures code quality and automates releases.

  Scenario: 1.1 Main branch is protected
    Given the main branch is the source of truth
    Then direct commits to main are blocked
    And all changes must go through pull requests
    And CI checks must pass before merging

  Scenario: 1.2 CI runs on every pull request
    Given pull requests must be validated automatically
    Then GitHub Actions runs lint, typecheck, and test
    And the PR cannot be merged if CI fails

  Scenario: 1.3 CI runs CodeQL security analysis
    Given code must be scanned for security vulnerabilities
    Then GitHub CodeQL runs on every PR
    And JavaScript/TypeScript code is analyzed

  Scenario: 1.4 Build workflow produces deployment artifacts
    Given deployments need reproducible artifacts
    Then the build workflow compiles all packages
    And Lambda packages and Docker images are created

  Scenario: 1.5 Dev deploys automatically on merge to main
    Given the dev environment should reflect the latest code
    Then merging to main triggers an automatic build and deploy
    And Terraform applies infra changes before code deployment

  Scenario: 1.6 Production deployment requires manual trigger
    Given production changes must be deliberate
    Then production deployment is triggered via workflow dispatch
    And the deployer selects a specific build ID to deploy
