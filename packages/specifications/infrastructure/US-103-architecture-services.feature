@ready
Feature: HAK Service Architecture (US-103)

  Service boundaries, authentication, and async processing
  architecture for the HAK platform.

  Scenario: 1.1 All traffic flows through CloudFront
    Given the system needs a single entry point
    Then CloudFront serves the frontend SPA from S3
    And CloudFront routes API requests to backend Lambdas
    And no backend API has a public custom domain

  Scenario: 1.2 Four backend API services exist
    Given the system has distinct functional domains
    Then merlin-api handles TTS synthesis and status polling
    And vabamorf-api handles morphological text analysis
    And simplestore handles task and data persistence
    And tara-auth handles Estonian national authentication

  Scenario: 1.3 Authentication uses TARA and Cognito
    Given users must authenticate with Estonian national eID
    Then TARA provides the OAuth2 authentication flow
    And Cognito manages user sessions and JWT tokens
    And the frontend stores tokens in secure cookies

  Scenario: 1.4 Synthesis uses async queue-based processing
    Given TTS generation takes several seconds per sentence
    Then merlin-api enqueues synthesis jobs to SQS
    And ECS workers poll the queue and generate audio
    And the frontend polls a status endpoint until ready

  Scenario: 1.5 Packages are organized by domain
    Given the system has distinct functional areas
    Then packages include frontend, auth, tts-api, store
    And infrastructure code lives in the infra/ directory
    And Gherkin specifications live in packages/specifications
