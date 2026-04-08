@ready
Feature: CI/CD Configuration (US-111)

  Repository configuration, authentication, and automation
  settings for the CI/CD pipeline.

  Scenario: 1.1 CI uses OIDC authentication for AWS
    Given long-lived AWS credentials are a security risk
    Then CI authenticates via OIDC role assumption
    And no static AWS access keys are stored in GitHub secrets

  Scenario: 1.2 Auto-merge is enabled for approved PRs
    Given manual merge clicks waste developer time
    Then PRs with passing CI and approval are auto-merged
    And branches are deleted after merge

  Scenario: 1.3 CI concurrency prevents parallel runs
    Given parallel CI runs on the same branch waste resources
    Then the CI workflow uses concurrency groups
    And in-progress runs are cancelled on new push

  Scenario: 1.4 Git hooks are installed automatically
    Given developers must not forget to install hooks
    Then .githooks directory contains pre-commit and pre-push
    And hooks are activated via git config core.hooksPath

  Scenario: 1.5 Docker images use multi-stage builds
    Given container images must be small and secure
    Then Dockerfiles use multi-stage builds
    And production images do not contain build tools
