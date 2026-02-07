# OWASP ASVS Level 2 — Checklist

> https://owasp.org/www-project-application-security-verification-standard/
> Application Security Verification Standard — Level 2 (standard applications).

## V1: Architecture, Design and Threat Modeling
- [ ] Document application architecture with trust boundaries
- [ ] Create threat model for each API endpoint (STRIDE methodology)
- [ ] All components are identified and have defined security controls
- [ ] Input validation strategy is centralized and documented

## V2: Authentication
- [ ] Authentication via Cognito/TARA uses standard OIDC protocol
- [ ] PKCE code verifier has sufficient entropy (min 43 characters, RFC 7636)
- [ ] Tokens have appropriate expiration (access: short, refresh: longer)
- [ ] Account lockout or rate limiting after failed attempts (Cognito config)
- [ ] No credentials stored in application code or client-side storage

## V3: Session Management
- [ ] Session tokens are cryptographically random (Cognito JWT)
- [ ] Session timeout configured (idle and absolute)
- [ ] Logout properly invalidates tokens on server side
- [ ] Session fixation protection (new tokens after authentication)

## V4: Access Control
- [ ] Every API endpoint has explicit access control checks
- [ ] Users can only access their own resources (userId in partition key)
- [ ] Shared resources have explicit access control (share token validation)
- [ ] Admin functions (if any) require elevated authorization
- [ ] Deny by default — resources are private unless explicitly shared

## V5: Validation, Sanitization and Encoding
- [ ] All input validated: type, length, range, format
- [ ] Output encoding appropriate for context (HTML, JSON, URL)
- [ ] File uploads (if any) validated for type, size, content
- [ ] Text inputs enforce `MAX_TEXT_LENGTH` server-side
- [ ] API responses use `Content-Type: application/json` consistently

## V6: Stored Cryptography
- [ ] DynamoDB encryption at rest enabled (AWS managed or CMK)
- [ ] S3 server-side encryption enabled
- [ ] No custom cryptography — use AWS managed services
- [ ] Hash functions use SHA-256 or better (verified in `@hak/shared`)

## V7: Error Handling and Logging
- [ ] Errors logged with sufficient context for debugging
- [ ] Error responses to clients contain no sensitive information
- [ ] All security-relevant events logged (auth, access control, input validation failures)
- [ ] Logs do not contain PII, tokens, or credentials

## V8: Data Protection
- [ ] Sensitive data classified and documented
- [ ] PII (user IDs, names) protected in transit and at rest
- [ ] Data retention policies defined and implemented
- [ ] No sensitive data cached in browser (Cache-Control headers)

## V9: Communication
- [ ] All external communication over TLS 1.2+ (CloudFront config)
- [ ] HSTS headers configured
- [ ] Certificate validation not disabled anywhere
- [ ] Internal AWS service communication uses VPC endpoints or TLS

## V10: Malicious Code
- [ ] No backdoors or debug endpoints in production code
- [ ] `DebugPage.tsx` is removed or disabled in production builds
- [ ] No eval, Function constructor, or dynamic code execution
- [ ] Dependencies scanned for known malicious packages

## V11: Business Logic
- [ ] Text length limits enforced consistently (client + server)
- [ ] Rate limiting prevents abuse of TTS synthesis (expensive operation)
- [ ] Task sharing has proper authorization checks
- [ ] API responses have appropriate size limits

## V12: Files and Resources
- [ ] S3 upload policies restrict file types and sizes
- [ ] Audio files served via CloudFront (not direct S3 access)
- [ ] No path traversal possible in file operations
- [ ] Temporary files cleaned up after processing

## V13: API and Web Service
- [ ] All API endpoints documented with expected inputs/outputs
- [ ] API versioning strategy defined
- [ ] Request size limits configured at API Gateway level
- [ ] Proper HTTP methods used (GET for read, POST for write)

## V14: Configuration
- [ ] All secrets externalized from code (env vars, Secrets Manager)
- [ ] Default configurations are secure (no debug mode in production)
- [ ] Security headers configured at CloudFront level
- [ ] CORS policy is restrictive (specific origins, not `*`)
