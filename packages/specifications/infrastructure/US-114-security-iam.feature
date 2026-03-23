@ready
Feature: Security — IAM and Secrets (US-114)

  IAM least privilege, secrets management, and
  credential handling for the HAK platform.

  Scenario: 1.1 Lambda functions have scoped IAM roles
    Given the Serverless Framework configurations
    When IAM roles are inspected
    Then each Lambda has IAM statements scoped to its needs
    And no policy uses "Resource": "*" with write actions

  Scenario: 1.2 GitHub Actions uses OIDC, not static keys
    Given the CI/CD workflow configuration
    When AWS credential setup is inspected
    Then OIDC role assumption is used
    And no static AWS access keys are stored as secrets

  Scenario: 1.3 Agent access is read-only
    Given the agent-readonly IAM user
    When IAM policies are inspected
    Then the agent has only DynamoDB read permissions
    And no write permissions are granted

  Scenario: 1.4 No secrets are hardcoded in source code
    Given the entire codebase including configuration
    When source files are inspected for secret patterns
    Then no API keys or credentials are found in code
    And TARA credentials are in AWS Secrets Manager

  Scenario: 1.5 Secrets are resolved at runtime
    Given Lambda functions that need API keys
    When the function initializes
    Then secrets are fetched from AWS Secrets Manager
    And secrets are cached in memory for the lifecycle

  Scenario: 1.6 Cognito config uses SSM Parameter Store
    Given API Gateway authorizers need Cognito config
    When authorizer configuration is inspected
    Then User Pool ID and Client ID come from SSM parameters
