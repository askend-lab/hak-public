@ready
Feature: Observability — Logging and Tracing (US-119)

  Structured logging, request tracing, and log retention
  policies for the HAK platform.

  Scenario: 1.1 Lambda functions emit structured JSON logs
    Given any Lambda function in the HAK platform
    When the function executes and logs a message
    Then the log entry uses the shared logger utility
    And it includes timestamp, level, and contextual data

  Scenario: 1.2 Auth Lambda logs include request tracing
    Given the TARA auth Lambda functions
    When authentication events are processed
    Then log entries include the request ID and auth stage
    And state validation failures are logged as warnings

  Scenario: 1.3 Sensitive data is never logged
    Given log output from all Lambda functions
    When logs are inspected for sensitive patterns
    Then no TARA client secrets or JWT tokens appear

  Scenario: 1.4 Log retention follows defined policy
    Given CloudWatch log groups for all functions
    When retention settings are inspected
    Then log groups have explicit retention configured
    And WAF logs are retained for 90 days

  Scenario: 1.5 CloudFront adds correlation IDs
    Given the CloudFront Function for request rewriting
    When a request passes through CloudFront
    Then an x-request-id header is added with a UUID

  Scenario: 1.6 X-Ray tracing is enabled for Lambda
    Given the Serverless Framework configurations
    When tracing configuration is inspected
    Then X-Ray active tracing is enabled for Lambdas
