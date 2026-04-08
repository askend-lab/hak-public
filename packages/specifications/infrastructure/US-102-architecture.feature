@ready
Feature: HAK System Architecture (US-102)

  HAK is an Estonian text-to-speech web application
  that converts text to natural speech using the Merlin TTS engine.

  Scenario: 1.1 Frontend is React with TypeScript
    Given the application serves Estonian language professionals
    Then the frontend is a React single-page application
    And all code is written in TypeScript with strict mode

  Scenario: 1.2 Backend APIs run on AWS Lambda
    Given the system must scale to zero when idle
    Then each API service runs as Lambda functions
    And Lambda functions are deployed via Serverless Framework v3

  Scenario: 1.3 TTS worker runs on AWS ECS
    Given speech synthesis requires long-running compute
    Then the Merlin TTS worker runs as an ECS Fargate service
    And the worker processes synthesis jobs from an SQS queue

  Scenario: 1.4 Infrastructure is serverless on AWS
    Given the system must minimize operational overhead
    Then compute uses Lambda and ECS Fargate
    And all infrastructure is in the eu-west-1 region

  Scenario: 1.5 Data is stored in DynamoDB
    Given the application needs fast key-value lookups
    Then DynamoDB is the primary data store for user data
    And the table uses a single-table design via SimpleStore

  Scenario: 1.6 Codebase is a pnpm monorepo
    Given multiple packages must evolve together
    Then the codebase is organized as a monorepo
    And package management uses pnpm workspaces
