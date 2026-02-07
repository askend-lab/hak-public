# OWASP Top 10 (2021) — Checklist

> https://owasp.org/www-project-top-ten/
> Top 10 most critical web application security risks.

## A01: Broken Access Control
- [ ] All API endpoints enforce authentication via Cognito authorizer
- [ ] Users can only access their own data (partition key includes userId)
- [ ] Shared/unlisted tasks enforce proper access control (share token validation)
- [ ] No CORS misconfiguration (`Access-Control-Allow-Origin` is not `*` in production)
- [ ] API Gateway resource policies restrict access appropriately

## A02: Cryptographic Failures
- [ ] All data in transit uses TLS (HTTPS enforced via CloudFront)
- [ ] DynamoDB encryption at rest is enabled
- [ ] S3 bucket encryption is enabled (SSE-S3 or SSE-KMS)
- [ ] No sensitive data in URLs or query parameters
- [ ] Audio cache keys use secure hash (SHA-256 via `@hak/shared`)

## A03: Injection
- [ ] All Lambda handler inputs are validated (type, length, format)
- [ ] DynamoDB queries use parameterized expressions (no string concatenation)
- [ ] No `eval()`, `Function()`, or dynamic code execution
- [ ] `vmetajson` process spawning uses argument array (not shell string)
- [ ] Frontend sanitizes user input before rendering (React escapes by default)

## A04: Insecure Design
- [ ] Threat model exists for each API endpoint
- [ ] Rate limiting is configured on API Gateway
- [ ] Business logic abuse scenarios identified and mitigated
- [ ] Text length limits enforced server-side (not just client-side)

## A05: Security Misconfiguration
- [ ] No default credentials or API keys in codebase
- [ ] All AWS resources have least-privilege IAM policies
- [ ] Error responses do not leak stack traces or internal details
- [ ] CloudFront custom error pages configured (no default AWS error pages)
- [ ] Security headers set: X-Content-Type-Options, X-Frame-Options, CSP

## A06: Vulnerable and Outdated Components
- [ ] All 16 npm vulnerabilities resolved (9 high, 4 moderate, 3 low)
- [ ] Dependabot enabled and configured for all package ecosystems
- [ ] Docker base images are up-to-date and scanned
- [ ] No deprecated dependencies in use

## A07: Identification and Authentication Failures
- [ ] PKCE flow implementation follows RFC 7636 strictly
- [ ] Token storage is secure (not in localStorage for sensitive tokens)
- [ ] Session timeout is configured appropriately
- [ ] Failed login attempts are rate-limited (Cognito handles this)

## A08: Software and Data Integrity Failures
- [ ] CI/CD pipeline has integrity checks (signed commits, protected branches)
- [ ] Dependencies are pinned to exact versions
- [ ] SLSA Level 2+ supply chain security
- [ ] No deserialization of untrusted data without validation

## A09: Security Logging and Monitoring Failures
- [ ] All authentication events are logged
- [ ] All API access is logged (API Gateway access logs)
- [ ] CloudWatch alarms for suspicious activity patterns
- [ ] Log retention policies configured
- [ ] No sensitive data in logs (PII, tokens, credentials)

## A10: Server-Side Request Forgery (SSRF)
- [ ] No user-controlled URLs used in server-side HTTP requests
- [ ] Lambda functions in VPC have restricted outbound access (if applicable)
- [ ] S3 presigned URLs have short expiration and restricted permissions
