@ready
Feature: AWS Compute and Networking (US-107)

  Lambda, ECS, SQS, and CloudFront networking infrastructure
  that powers the HAK platform services.

  Scenario: 1.1 API services run on Lambda
    Given APIs must scale to zero when idle
    Then merlin-api, vabamorf-api, simplestore, and tara-auth run on Lambda
    And each service has its own serverless.yml configuration

  Scenario: 1.2 TTS worker runs on ECS Fargate
    Given speech synthesis requires long-running compute
    Then the Merlin TTS worker runs as ECS Fargate service
    And the ECS cluster is named hak-merlin-{env}
    And prod runs 24/7 with minimum 1 task

  Scenario: 1.3 Synthesis jobs flow through SQS
    Given synthesis requests must be decoupled from processing
    Then an SQS queue connects merlin-api to the ECS worker
    And a dead-letter queue captures failed synthesis jobs

  Scenario: 1.4 CloudFront is the single entry point
    Given all traffic must flow through one domain
    Then CloudFront serves both static assets and API requests
    And a CloudFront Function rewrites path prefixes

  Scenario: 1.5 API routes are defined declaratively
    Given CloudFront needs to route to the correct backend
    Then API routes are defined in locals.tf as a list
    And each route specifies path, origin, rewrite, and auth

  Scenario: 1.6 TARA auth Lambda runs in a VPC
    Given TARA requires a fixed outbound IP
    Then tara-auth Lambda runs in a VPC with private subnets
    And a NAT Gateway provides a fixed Elastic IP
