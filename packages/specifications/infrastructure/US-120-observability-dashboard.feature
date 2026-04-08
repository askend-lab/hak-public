@ready
Feature: Observability — CloudWatch Dashboard (US-120)

  Real-time monitoring dashboard that provides
  system health visibility for the HAK platform.

  Scenario: 1.1 Dashboard shows system health at a glance
    Given the hak-activity-{env} CloudWatch dashboard
    When an operator opens the dashboard
    Then alarm status timeline shows all critical alarms
    And CloudFront requests and error rates are visible

  Scenario: 1.2 Dashboard tracks synthesis pipeline
    Given the synthesis pipeline (Lambda, SQS, ECS)
    When the dashboard is reviewed
    Then SQS queue depth (waiting and in-flight) is visible
    And DLQ depth (failed generations) is visible
    And ECS running task count is visible

  Scenario: 1.3 Dashboard covers all API services
    Given the CloudWatch dashboard
    When metrics are reviewed
    Then merlin-api invocations and errors are tracked
    And vabamorf-api invocations, errors, duration are tracked
    And simplestore and tara-auth metrics are tracked

  Scenario: 1.4 Dashboard tracks infrastructure metrics
    Given the CloudWatch dashboard
    When infrastructure metrics are reviewed
    Then DynamoDB capacity and throttling are visible
    And CloudFront bandwidth is visible
    And WAF blocked requests are visible
