@ready
Feature: Performance — Lambda and Synthesis (US-117)

  Performance targets for Lambda cold starts,
  synthesis throughput, and ECS worker scaling.

  Scenario: 1.1 API Lambda cold starts are under 3 seconds
    Given the API Lambda functions
    When a function is invoked after a cold start
    Then initialization completes in under 3 seconds

  Scenario: 1.2 Vabamorf container cold start is under 10 seconds
    Given the vabamorf-api Lambda runs as Docker container
    When the function is invoked after a cold start
    Then initialization completes in under 10 seconds

  Scenario: 1.3 Sentence synthesis completes in under 30 seconds
    Given the Merlin TTS worker processing a sentence
    When the sentence is synthesized
    Then audio generation completes in under 30 seconds

  Scenario: 1.4 SQS queue depth stays bounded
    Given a steady stream of synthesis requests
    When the ECS worker processes the queue
    Then the queue depth remains below 50 messages
    And the oldest message age stays under 5 minutes

  Scenario: 1.5 ECS auto-scaling responds to demand
    Given synthesis demand increases beyond one worker
    When the SQS queue depth exceeds the threshold
    Then additional ECS tasks launch within 2 minutes
