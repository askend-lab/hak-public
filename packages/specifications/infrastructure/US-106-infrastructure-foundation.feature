@ready
Feature: AWS Infrastructure Foundation (US-106)

  Terraform-managed AWS infrastructure that supports
  the frontend, APIs, authentication, and TTS processing.

  Scenario: 1.1 Infrastructure is managed by Terraform
    Given infrastructure must be reproducible
    Then all AWS resources are defined in infra/ directory
    And Terraform state is stored in a shared S3 backend
    And state locking uses a shared DynamoDB table

  Scenario: 1.2 Environments are separated
    Given dev and prod must not interfere with each other
    Then resources are prefixed with the environment name
    And each environment uses separate Terraform variables

  Scenario: 1.3 Frontend is hosted in S3
    Given the frontend is a static React SPA
    Then an S3 bucket stores the compiled frontend assets
    And the bucket is not publicly accessible directly
    And CloudFront uses Origin Access Control for S3

  Scenario: 1.4 User data is stored in DynamoDB
    Given the application needs fast key-value storage
    Then a DynamoDB table stores all user data
    And the table is named simplestore-{env}

  Scenario: 1.5 Audio files are stored in S3
    Given synthesized audio needs to be served to users
    Then generated WAV files are stored in S3
    And audio is accessible via CloudFront

  Scenario: 1.6 DNS is managed by Route53
    Given the application needs custom domain names
    Then Route53 manages DNS records for askend-lab.com
    And ACM certificates provide TLS for custom domains
