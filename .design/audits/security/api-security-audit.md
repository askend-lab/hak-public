# API Security Audit

**Scope:** API endpoints, authentication, authorization, rate limiting

## Authentication

- [ ] All API endpoints require authentication (except documented public endpoints)
- [ ] API keys stored securely (never in code or logs)
- [ ] JWT tokens used for stateless authentication
- [ ] JWT tokens signed with strong algorithm (RS256, ES256)
- [ ] JWT token expiration configured appropriately
- [ ] Refresh tokens implemented for long-lived sessions
- [ ] Refresh token rotation on use
- [ ] OAuth2/OIDC implemented correctly
- [ ] API key rotation process exists
- [ ] Bearer token transmitted only over HTTPS
- [ ] Basic auth not used without HTTPS

## Authorization

- [ ] Authorization checks on every endpoint
- [ ] User permissions verified before data access
- [ ] Role-based access control (RBAC) implemented
- [ ] Resource-level authorization enforced
- [ ] Ownership validation for user-specific resources
- [ ] Admin endpoints have additional authorization
- [ ] Service-to-service authentication implemented
- [ ] Authorization logic cannot be bypassed
- [ ] Insecure direct object references prevented
- [ ] Mass assignment vulnerabilities prevented

## Input Validation

- [ ] All input parameters validated
- [ ] Request body schema validation enforced
- [ ] Query parameters validated and sanitized
- [ ] Path parameters validated
- [ ] Header validation where required
- [ ] Content-Type validation enforced
- [ ] File upload validation (type, size, content)
- [ ] Maximum request size enforced
- [ ] Nested object depth limited
- [ ] Array length limits enforced
- [ ] Regex validation for string patterns

## Output Security

- [ ] Sensitive data filtered from responses
- [ ] Error messages don't expose system details
- [ ] Stack traces not returned to clients
- [ ] PII masked in responses where appropriate
- [ ] Response schema validated before sending
- [ ] Debug information disabled in production
- [ ] Database errors not exposed directly
- [ ] Internal IDs obfuscated or encrypted

## Rate Limiting

- [ ] Rate limiting implemented per endpoint
- [ ] Rate limits appropriate for endpoint purpose
- [ ] Rate limiting per user/IP/API key
- [ ] Burst protection implemented
- [ ] Rate limit headers returned (X-RateLimit-*)
- [ ] Rate limit exceeded returns 429 status
- [ ] Exponential backoff recommended to clients
- [ ] Rate limits monitored and adjusted
- [ ] Different limits for authenticated vs anonymous
- [ ] Administrative endpoints have stricter limits

## HTTPS/TLS

- [ ] All API endpoints accessible via HTTPS only
- [ ] HTTP requests redirected to HTTPS
- [ ] TLS 1.2+ enforced (older versions disabled)
- [ ] Strong cipher suites configured
- [ ] Certificate valid and not expired
- [ ] Certificate auto-renewal configured
- [ ] HSTS header configured
- [ ] Mixed content prevented

## CORS Configuration

- [ ] CORS policy explicitly configured
- [ ] Allowed origins explicitly listed (not *)
- [ ] Allowed methods restricted to required only
- [ ] Allowed headers restricted
- [ ] Credentials flag used carefully
- [ ] Preflight requests handled correctly
- [ ] CORS policy tested in browsers

## API Gateway Security

- [ ] API Gateway throttling configured
- [ ] WAF integrated with API Gateway
- [ ] Custom domain with SSL/TLS
- [ ] API keys managed through gateway
- [ ] Usage plans configured
- [ ] Request/response transformation secured
- [ ] Lambda authorizers secured
- [ ] API Gateway logging enabled

## Request Processing

- [ ] Request size limits enforced
- [ ] Request timeout configured
- [ ] Large payloads handled efficiently
- [ ] File uploads streamed (not buffered fully)
- [ ] Multipart requests validated
- [ ] Content-Type checked before parsing
- [ ] JSON parsing limits enforced
- [ ] XML external entity (XXE) attacks prevented

## SQL Injection Prevention

- [ ] Parameterized queries used exclusively
- [ ] ORM used correctly (no raw queries with user input)
- [ ] Input sanitization for database queries
- [ ] Stored procedures used where appropriate
- [ ] Database user has minimal privileges
- [ ] Query results validated

## NoSQL Injection Prevention

- [ ] NoSQL query parameters validated
- [ ] User input not concatenated into queries
- [ ] MongoDB operators filtered from input
- [ ] DynamoDB expressions parameterized
- [ ] Input type checking enforced

## API Versioning

- [ ] API versioning strategy implemented (URL, header, or query)
- [ ] Deprecated versions documented
- [ ] Sunset headers used for deprecation
- [ ] Old versions maintained for transition period
- [ ] Breaking changes only in major versions
- [ ] Version migration guides provided

## Error Handling

- [ ] Consistent error response format
- [ ] Error codes documented
- [ ] Error messages safe for clients
- [ ] Error logging includes request context
- [ ] 4xx status codes for client errors
- [ ] 5xx status codes for server errors
- [ ] Validation errors return 400 with details
- [ ] Authentication failures return 401
- [ ] Authorization failures return 403
- [ ] Rate limit exceeded returns 429

## Logging & Monitoring

- [ ] All API requests logged
- [ ] Request/response times tracked
- [ ] Failed authentication attempts logged
- [ ] Authorization failures logged
- [ ] Error rates monitored
- [ ] API usage patterns monitored
- [ ] Suspicious patterns detected and alerted
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] Correlation IDs used for tracing
- [ ] API metrics available in dashboard

## Data Validation

- [ ] Email addresses validated with regex
- [ ] Phone numbers validated
- [ ] URLs validated and sanitized
- [ ] Date formats validated
- [ ] Numeric ranges validated
- [ ] Enum values validated against whitelist
- [ ] Boolean values strictly checked
- [ ] UUID format validated

## Session Management

- [ ] Session tokens cryptographically secure
- [ ] Session expiration configured
- [ ] Idle timeout implemented
- [ ] Session tokens invalidated on logout
- [ ] Concurrent session limits enforced
- [ ] Session fixation prevented
- [ ] Session hijacking mitigated
- [ ] CSRF tokens used for state-changing operations

## Third-Party Integration Security

- [ ] Third-party API keys stored securely
- [ ] Third-party API calls timeout configured
- [ ] Third-party failures handled gracefully
- [ ] Third-party responses validated
- [ ] Circuit breaker pattern implemented
- [ ] Fallback mechanisms exist
- [ ] Third-party data sanitized before use
- [ ] Third-party rate limits respected

## Webhook Security

- [ ] Webhook signatures verified
- [ ] Webhook payloads validated
- [ ] Replay attacks prevented (nonce/timestamp)
- [ ] Webhook endpoints authenticated
- [ ] Webhook retries configured with backoff
- [ ] Webhook failures logged
- [ ] Webhook timeout configured

## GraphQL Security (if applicable)

- [ ] Query depth limiting enforced
- [ ] Query complexity analysis enabled
- [ ] Query cost calculated and limited
- [ ] Introspection disabled in production
- [ ] Field-level authorization implemented
- [ ] N+1 query problem mitigated
- [ ] Batching limits enforced
- [ ] Pagination required for lists

## REST Best Practices

- [ ] Proper HTTP methods used (GET, POST, PUT, DELETE, PATCH)
- [ ] Idempotency keys used for POST requests where appropriate
- [ ] Pagination implemented for list endpoints
- [ ] Filtering/sorting parameters validated
- [ ] Resource relationships handled correctly
- [ ] HATEOAS links used (if applicable)
- [ ] Content negotiation supported (if needed)

## API Documentation

- [ ] OpenAPI/Swagger documentation maintained
- [ ] Authentication requirements documented
- [ ] Rate limits documented
- [ ] Error responses documented
- [ ] Example requests/responses provided
- [ ] Security requirements documented
- [ ] Deprecation notices included
- [ ] Changelog maintained

## Testing

- [ ] Security testing included in CI/CD
- [ ] Authentication bypass tests
- [ ] Authorization bypass tests
- [ ] Input validation tests
- [ ] Rate limiting tests
- [ ] OWASP API Top 10 tested
- [ ] Fuzzing performed
- [ ] Penetration testing scheduled

## Compliance

- [ ] API meets GDPR requirements (if applicable)
- [ ] Data privacy policies enforced
- [ ] User consent managed appropriately
- [ ] Data retention policies implemented
- [ ] Right to deletion implemented
- [ ] Audit logs meet compliance requirements

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Critical Issues:**
- 

**Security Gaps:**
- 

**Action Items:**
- 
