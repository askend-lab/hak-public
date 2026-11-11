@ready
Feature: Deployment Infrastructure (US-109)

  Deployment automation, artifact management,
  and environment promotion for reliable releases.

  Scenario: 1.1 Frontend deploys to S3 with cache invalidation
    Given the frontend is a static React SPA
    Then the build is synced to the website S3 bucket
    And a CloudFront cache invalidation is triggered after sync

  Scenario: 1.2 Lambda APIs deploy via Serverless Framework
    Given each API service has its own serverless.yml
    Then deployment uses the serverless deploy command
    And environment variables come from SSM Parameter Store

  Scenario: 1.3 Orphaned API Gateway domains are cleaned up
    Given all traffic flows through CloudFront
    Then the deploy workflow deletes orphaned custom domains
    And this prevents confusion about which URL to use

  Scenario: 1.4 Merlin worker deploys as ECS service update
    Given the TTS worker runs as ECS Fargate service
    Then deployment updates the ECS task definition
    And rolling deployment ensures zero downtime

  Scenario: 1.5 ECS worker auto-scales based on queue depth
    Given synthesis demand varies throughout the day
    Then ECS auto-scaling monitors the SQS queue depth
    And production maintains minimum 1 running task

  Scenario: 1.6 Smoke tests run after every deployment
    Given deployments must be verified in target environment
    Then bash and Jest smoke tests check all endpoints
    And smoke test failures are reported but do not roll back
