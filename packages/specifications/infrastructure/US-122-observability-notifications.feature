@ready
Feature: Observability — Slack Notifications (US-122)

  SNS-to-Slack alert routing and meta-monitoring
  for the HAK platform alerting pipeline.

  Scenario: 1.1 All alarms notify via SNS to Slack
    Given the SNS topic hak-alerts-{env}
    When any CloudWatch alarm fires
    Then a notification is sent to the SNS topic
    And a Slack notifier Lambda sends the alert to Slack

  Scenario: 1.2 OK transitions also send notifications
    Given a CloudWatch alarm that was previously in ALARM state
    When the alarm transitions back to OK
    Then a recovery notification is sent to Slack

  Scenario: 1.3 Slack notifier has meta-monitoring
    Given the Slack notifier Lambda function
    When the notifier Lambda itself fails
    Then a CloudWatch alarm fires for the notifier
    And the alarm is visible in the dashboard

  Scenario: 1.4 SQS queue depth alarm detects backlog
    Given the CloudWatch alarm for Merlin SQS queue depth
    When queue depth exceeds 50 messages
    Then the alarm indicates possible abuse or stuck workers

  Scenario: 1.5 SQS message age alarm detects stale jobs
    Given the CloudWatch alarm for SQS oldest message age
    When the oldest message exceeds 5 minutes
    Then the alarm indicates the worker is not processing
