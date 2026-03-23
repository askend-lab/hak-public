@ready
Feature: Quality Gates — Dependencies and Testing (US-113)

  Dependency health, mutation testing, and supply chain
  integrity enforcement for the HAK platform.

  Scenario: 1.1 No known vulnerabilities in JS dependencies
    Given the pnpm-lock.yaml lockfile
    When pnpm audit runs
    Then zero high or critical vulnerabilities are found

  Scenario: 1.2 Docker images are scanned for vulnerabilities
    Given Docker images for vabamorf-api and Merlin worker
    When images are scanned with Trivy
    Then zero critical vulnerabilities are found

  Scenario: 1.3 Lockfile integrity is maintained
    Given the pnpm-lock.yaml file in version control
    When pnpm install --frozen-lockfile runs in CI
    Then installation succeeds without lockfile changes

  Scenario: 1.4 Mutation tests validate test effectiveness
    Given critical packages have mutation test files
    When mutation tests run on auth, store, and api-client
    Then mutations in business logic are detected by tests

  Scenario: 1.5 Gherkin scenarios match implementation status
    Given all .feature files with @ready tags
    When tags are cross-referenced with step definitions
    Then scenarios tagged @ready have step implementations
