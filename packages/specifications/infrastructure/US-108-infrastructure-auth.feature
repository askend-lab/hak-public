@ready
Feature: Authentication Infrastructure (US-108)

  Cognito, TARA, and Secrets Manager infrastructure
  that powers Estonian national authentication.

  Scenario: 1.1 Cognito manages user sessions
    Given users need persistent sessions across requests
    Then a Cognito User Pool manages user accounts
    And custom attributes include personal_code
    And JWT tokens are validated by API Gateway authorizers

  Scenario: 1.2 TARA credentials are in Secrets Manager
    Given TARA client credentials must not be in source code
    Then client_id and client_secret are in Secrets Manager
    And the secret is named askend-lab/llm-keys
    And Lambda functions fetch secrets at runtime

  Scenario: 1.3 Docker images are stored in ECR
    Given Lambda and ECS services use container images
    Then vabamorf-api uses a Docker image from ECR
    And the Merlin TTS worker uses a Docker image from ECR
    And ECR repositories are defined in Terraform
