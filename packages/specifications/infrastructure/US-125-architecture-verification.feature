@ready
Feature: Architecture Verification (US-125)

  Automated checks that verify the project configuration
  matches the declared architecture. These scenarios parse
  real Terraform, Serverless, and package files.

  Scenario: 1.1 CloudFront routes match serverless routes
    Given CloudFront API routes are defined in locals.tf
    When each route is rewritten as the CloudFront Function does
    Then every rewritten path has a matching serverless.yml route

  Scenario: 1.2 No serverless route starts with /api/ prefix
    Given all serverless.yml files for backend APIs
    When HTTP event paths are extracted
    Then no route path starts with "/api/"

  Scenario: 1.3 Protected endpoints require Cognito authorizer
    Given the synthesis and morphology API configurations
    When endpoint authorizer settings are inspected
    Then /synthesize requires cognitoAuthorizer
    And /analyze requires cognitoAuthorizer
    And /variants requires cognitoAuthorizer

  Scenario: 1.4 WAF rate limit rules are configured
    Given the WAF configuration in waf.tf
    When rate limit rules are parsed
    Then a general per-IP rate limit of 2000 exists
    And a /api/synthesize per-IP rate limit of 200 exists

  Scenario: 1.5 Every Lambda function has a CloudWatch alarm
    Given the CloudWatch alarm definitions in Terraform
    And the Lambda functions defined in serverless.yml files
    When alarms are matched to Lambda function names
    Then every API Lambda function has at least one alarm
