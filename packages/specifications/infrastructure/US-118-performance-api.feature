@ready
Feature: Performance — API Response Times (US-118)

  Response time targets and rate limits as SLA
  for the HAK platform APIs.

  Scenario: 1.1 Morphology API responds in under 1 second
    Given the vabamorf-api Lambda behind CloudFront
    When text analysis requests are sent
    Then p99 latency is under 1 second for warm invocations

  Scenario: 1.2 SimpleStore API responds in under 500ms
    Given the simplestore Lambda behind CloudFront
    When CRUD operations are performed on tasks
    Then p99 latency is under 500ms for warm invocations

  Scenario: 1.3 Frontend loads in under 3 seconds
    Given the frontend SPA served via CloudFront from S3
    When a user loads the application
    Then Time to First Byte is under 200ms
    And the initial page load completes in under 3 seconds

  Scenario: 1.4 Per-user synthesis rate is 5 req/min
    Given the WAF per-user rate limit for /api/synthesize
    When a user exceeds 10 requests in 2 minutes
    Then subsequent requests receive HTTP 429

  Scenario: 1.5 Per-user morphology rate is 20 req/min
    Given the WAF per-user rate limit for morphology APIs
    When a user exceeds 20 requests in 1 minute
    Then subsequent requests receive HTTP 429

  Scenario: 1.6 Status polling rate is 100 req/min
    Given the WAF per-user rate limit for /api/status
    When a user exceeds 100 requests in 1 minute
    Then subsequent requests receive HTTP 429
