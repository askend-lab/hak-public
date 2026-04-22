@ready
Feature: Observability — CloudWatch Alarms (US-121)

  Automated alerting with defined thresholds
  for all critical HAK platform services.

  Scenario: 1.1 API Gateway 5XX errors trigger alarms
    Given CloudWatch alarms for API Gateway 5XX errors
    When any API Gateway returns a 5XX error
    Then the alarm transitions to ALARM state
    And alarms exist for all four API services

  Scenario: 1.2 Lambda errors trigger critical alarms
    Given CloudWatch alarms for Lambda function errors
    When any Lambda function errors exceed the threshold
    Then the alarm transitions to ALARM state
    And alarms cover synthesize, status, auth, and vabamorf

  Scenario: 1.3 DynamoDB throttling triggers an alarm
    Given the CloudWatch alarm for DynamoDB throttling
    When throttled requests exceed 1 in 5 minutes
    Then the alarm transitions to ALARM state

  Scenario: 1.4 Merlin DLQ depth triggers critical alarm
    Given the CloudWatch alarm for the Merlin DLQ
    When any message appears in the dead-letter queue
    Then the alarm transitions to ALARM state immediately

  Scenario: 1.5 ECS zero tasks triggers alarm in prod
    Given the CloudWatch alarm for ECS running tasks
    When running tasks drop below 1 in production
    Then the alarm transitions to ALARM state

  Scenario: 1.6 WAF blocked requests spike triggers alarm
    Given the CloudWatch alarm for WAF blocked requests
    When blocked requests exceed 100 in 5 minutes
    Then the alarm transitions to ALARM state
