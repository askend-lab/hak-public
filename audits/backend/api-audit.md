# API Audit

**Scope:** API endpoints, contracts, versioning, documentation

## API Design

- [ ] RESTful principles followed
- [ ] Resource naming consistent (plural nouns)
- [ ] HTTP methods used correctly (GET, POST, PUT, PATCH, DELETE)
- [ ] URL structure logical and hierarchical
- [ ] Query parameters for filtering/sorting
- [ ] Path parameters for resource identification
- [ ] API versioning strategy implemented
- [ ] HATEOAS considered (if applicable)
- [ ] Idempotency for unsafe methods
- [ ] Bulk operations supported where needed

## Endpoint Naming

- [ ] Endpoints use kebab-case or snake_case consistently
- [ ] Resource names are nouns (not verbs)
- [ ] Nested resources reflect relationships
- [ ] Endpoint depth reasonable (<3 levels)
- [ ] Action endpoints justified and documented
- [ ] Plural forms used for collections
- [ ] Singular forms used appropriately

## HTTP Methods

- [ ] GET used for retrieval (no side effects)
- [ ] POST used for creation
- [ ] PUT used for full replacement
- [ ] PATCH used for partial updates
- [ ] DELETE used for removal
- [ ] HEAD supported where useful
- [ ] OPTIONS supported for CORS
- [ ] Unsafe methods protected from CSRF

## Request Handling

- [ ] Request validation comprehensive
- [ ] Request body schema defined
- [ ] Query parameter validation
- [ ] Path parameter validation
- [ ] Header validation where needed
- [ ] Content-Type enforcement
- [ ] Request size limits enforced
- [ ] Malformed requests return 400
- [ ] Unsupported media types return 415

## Response Format

- [ ] Response format consistent (JSON, XML, etc.)
- [ ] Response structure documented
- [ ] Envelope format consistent (if used)
- [ ] Metadata included where appropriate
- [ ] Links to related resources (HATEOAS)
- [ ] Response compression enabled
- [ ] Content-Type header set correctly
- [ ] Character encoding specified (UTF-8)

## Status Codes

- [ ] HTTP status codes used correctly
- [ ] 200 OK for successful GET/PUT/PATCH
- [ ] 201 Created for POST with Location header
- [ ] 204 No Content for successful DELETE
- [ ] 400 Bad Request for validation errors
- [ ] 401 Unauthorized for authentication failures
- [ ] 403 Forbidden for authorization failures
- [ ] 404 Not Found for missing resources
- [ ] 409 Conflict for concurrent modification
- [ ] 422 Unprocessable Entity for semantic errors
- [ ] 429 Too Many Requests for rate limiting
- [ ] 500 Internal Server Error for server errors
- [ ] 503 Service Unavailable for maintenance

## Error Handling

- [ ] Error response format consistent
- [ ] Error codes defined and documented
- [ ] Error messages helpful (not cryptic)
- [ ] Stack traces not exposed in production
- [ ] Validation errors detailed
- [ ] Error correlation IDs included
- [ ] Error documentation comprehensive
- [ ] Retry-After header for rate limits

## Pagination

- [ ] Pagination implemented for collections
- [ ] Limit/offset or cursor-based pagination
- [ ] Page size limits enforced
- [ ] Default page size reasonable
- [ ] Total count included (or discouraged if expensive)
- [ ] Links to next/previous pages
- [ ] Pagination metadata in response
- [ ] Empty collections handled gracefully

## Filtering & Sorting

- [ ] Filtering parameters documented
- [ ] Filter syntax consistent
- [ ] Complex filters supported
- [ ] Sorting parameters documented
- [ ] Multi-column sorting supported
- [ ] Default sorting defined
- [ ] Filter/sort validation enforced

## API Versioning

- [ ] Versioning strategy chosen (URL, header, query)
- [ ] Version format consistent (v1, v2, etc.)
- [ ] Multiple versions supported concurrently
- [ ] Deprecated versions marked
- [ ] Sunset headers used for deprecation
- [ ] Migration guides for version changes
- [ ] Breaking changes only in major versions
- [ ] Version negotiation handled

## Authentication

- [ ] Authentication method consistent
- [ ] JWT or OAuth2 tokens used
- [ ] API keys for service-to-service
- [ ] Token expiration enforced
- [ ] Refresh tokens supported
- [ ] Authentication errors clear (401)
- [ ] Token validation on every request
- [ ] Secure token storage recommended in docs

## Authorization

- [ ] Authorization checked on every endpoint
- [ ] Role-based access control (RBAC)
- [ ] Resource-level permissions enforced
- [ ] Ownership verification for user resources
- [ ] Admin endpoints properly protected
- [ ] Authorization errors return 403
- [ ] Permissions documented per endpoint

## Rate Limiting

- [ ] Rate limiting implemented
- [ ] Limits appropriate per endpoint
- [ ] Per-user or per-IP limits
- [ ] Rate limit headers returned (X-RateLimit-*)
- [ ] 429 status for exceeded limits
- [ ] Retry-After header included
- [ ] Burst allowance configured
- [ ] Rate limits documented

## Caching

- [ ] Cache-Control headers configured
- [ ] ETag support for conditional requests
- [ ] Last-Modified headers where appropriate
- [ ] 304 Not Modified responses
- [ ] Cache invalidation strategy
- [ ] Private vs public caching distinguished
- [ ] Cache duration appropriate per endpoint
- [ ] Vary header used correctly

## API Documentation

- [ ] OpenAPI/Swagger specification maintained
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Authentication documented
- [ ] Error responses documented
- [ ] Rate limits documented
- [ ] Deprecation notices included
- [ ] Changelog maintained
- [ ] Interactive API explorer available
- [ ] Code examples in multiple languages

## Backward Compatibility

- [ ] Breaking changes avoided in minor versions
- [ ] New fields added as optional
- [ ] Deprecated fields marked but not removed
- [ ] Deprecation timeline communicated
- [ ] Migration paths documented
- [ ] Old clients continue to work
- [ ] Graceful degradation for unknown fields

## Data Validation

- [ ] Input validation comprehensive
- [ ] Data types validated
- [ ] Required fields enforced
- [ ] Field constraints enforced (min/max, length)
- [ ] Format validation (email, URL, date)
- [ ] Enum values validated
- [ ] Nested object validation
- [ ] Array validation (length, item types)
- [ ] Custom validation rules implemented

## Performance

- [ ] Response times tracked
- [ ] Slow endpoints identified
- [ ] N+1 query problems eliminated
- [ ] Database queries optimized
- [ ] Unnecessary data not returned
- [ ] Pagination prevents large responses
- [ ] Caching reduces database load
- [ ] Async processing for heavy operations

## Security

- [ ] SQL injection prevented
- [ ] NoSQL injection prevented
- [ ] XSS prevention in responses
- [ ] CSRF protection for state changes
- [ ] Input sanitization implemented
- [ ] Output encoding applied
- [ ] Mass assignment protection
- [ ] Sensitive data filtered from responses
- [ ] Security headers configured

## Monitoring & Logging

- [ ] All requests logged
- [ ] Response times logged
- [ ] Errors logged with context
- [ ] Authentication failures logged
- [ ] Rate limit violations logged
- [ ] API metrics collected
- [ ] Correlation IDs for request tracing
- [ ] Alerting for anomalies

## Testing

- [ ] Unit tests for business logic
- [ ] Integration tests for endpoints
- [ ] Contract tests for API contracts
- [ ] Security tests included
- [ ] Performance tests run
- [ ] Test coverage acceptable
- [ ] Automated testing in CI/CD

## GraphQL (if applicable)

- [ ] Schema well-designed
- [ ] Query depth limiting
- [ ] Query complexity analysis
- [ ] N+1 problem solved (DataLoader)
- [ ] Pagination for lists
- [ ] Error handling consistent
- [ ] Introspection disabled in production
- [ ] Persisted queries considered

## Webhooks (if applicable)

- [ ] Webhook payload format documented
- [ ] Webhook signatures for verification
- [ ] Retry logic with exponential backoff
- [ ] Webhook event types documented
- [ ] Idempotency keys used
- [ ] Timeout configured
- [ ] Webhook failures logged

## API Gateway

- [ ] API Gateway configured
- [ ] Request routing configured
- [ ] Request/response transformation documented
- [ ] Rate limiting at gateway level
- [ ] API key management
- [ ] Usage plans configured
- [ ] Monitoring integrated

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**API Statistics:**
- Total Endpoints: _____
- Average Response Time: _____ ms
- Error Rate: _____%

**Issues Found:**
- 

**Recommendations:**
- 

**Action Items:**
- 
