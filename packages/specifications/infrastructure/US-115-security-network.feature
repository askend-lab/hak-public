@ready
Feature: Security — Network and WAF (US-115)

  WAF protection, rate limiting, geo-blocking, and CORS
  policies that defend the HAK platform.

  Scenario: 1.1 WAF protects all CloudFront traffic
    Given the CloudFront distribution for all traffic
    When WAF association is inspected
    Then a WAF v2 Web ACL is attached to CloudFront
    And AWS Managed Rules block SQLi and XSS

  Scenario: 1.2 Per-IP rate limiting prevents abuse
    Given the WAF rate-limiting rules
    When request rates are evaluated
    Then general traffic is limited to 2000 req/5min per IP
    And /api/synthesize is limited to 200 req/5min per IP

  Scenario: 1.3 Per-user rate limiting enforces fair usage
    Given authenticated users with JWT tokens
    When per-user rate limits are evaluated
    Then synthesis is limited to 10 req/2min per user
    And morphology is limited to 20 req/min per user

  Scenario: 1.4 Geo-blocking restricts synthesis region
    Given the /api/synthesize endpoint
    When requests come from outside allowed countries
    Then requests from non-allowed countries are blocked
    And allowed countries include EE, LV, LT, FI, SE, DE

  Scenario: 1.5 API Gateway enforces CORS policy
    Given the API Gateway configurations for all services
    When CORS headers are inspected
    Then only CloudFront domains are in allowed origins
    And wildcard origins are not permitted

  Scenario: 1.6 API Gateway enforces JWT authentication
    Given protected API endpoints
    When requests without a valid JWT are sent
    Then the API Gateway authorizer rejects with 401
    And public endpoints do not require auth
