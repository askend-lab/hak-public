# OWASP Serverless Top 10 — Checklist

> https://owasp.org/www-project-serverless-top-10/
> Security risks specific to serverless architectures (Lambda, API Gateway, DynamoDB).

## SAS-1: Function Event-Data Injection
- [ ] All Lambda handler `event.body` is parsed and validated before use
- [ ] Query string parameters are validated (type, length, allowed values)
- [ ] Path parameters are validated against expected patterns
- [ ] No shell injection via `child_process` (vmetajson uses argument array)
- [ ] JSON parsing wrapped in try-catch with proper error response

## SAS-2: Broken Authentication
- [ ] API Gateway Cognito authorizer configured on all protected endpoints
- [ ] Token validation happens at API Gateway level (not in Lambda code)
- [ ] Public endpoints explicitly documented and justified
- [ ] No API keys or secrets in Lambda environment variables (use Secrets Manager)

## SAS-3: Insecure Serverless Deployment Configuration
- [ ] Lambda functions have minimal IAM permissions (per-function roles)
- [ ] No `Resource: "*"` in IAM policies — specific ARNs for each resource
- [ ] Lambda timeout configured appropriately (not default 3s or max 900s)
- [ ] Memory allocation right-sized for each function
- [ ] Reserved concurrency set to prevent runaway invocations

## SAS-4: Over-Privileged Function Permissions
- [ ] Each Lambda has its own IAM role (not shared across functions)
- [ ] DynamoDB access limited to specific tables and actions (GetItem, PutItem, Query)
- [ ] S3 access limited to specific buckets and prefixes
- [ ] SQS access limited to specific queues
- [ ] No `iam:*`, `s3:*`, or `dynamodb:*` wildcards

## SAS-5: Inadequate Function Monitoring and Logging
- [ ] CloudWatch Logs enabled for all Lambda functions
- [ ] Structured JSON logging (not plain text console.log)
- [ ] Request IDs included in all log entries for tracing
- [ ] CloudWatch Alarms for error rates, throttles, duration spikes
- [ ] X-Ray tracing enabled for distributed request tracing

## SAS-6: Insecure Third-Party Dependencies
- [ ] `pnpm audit` runs in CI with zero high/critical vulnerabilities
- [ ] Dependabot auto-creates PRs for vulnerable dependencies
- [ ] Lambda deployment packages exclude devDependencies
- [ ] Docker images scanned with Trivy before deployment

## SAS-7: Insecure Application Secrets Storage
- [ ] No secrets in Lambda environment variables (use AWS Secrets Manager or SSM)
- [ ] No secrets in Terraform state (use sensitive variables + remote state encryption)
- [ ] No secrets committed to git (gitleaks enforced)
- [ ] Cognito client secret (if any) stored in Secrets Manager

## SAS-8: Denial of Service / Financial Resource Exhaustion
- [ ] API Gateway throttling configured (requests per second limit)
- [ ] Lambda reserved concurrency prevents unlimited scaling
- [ ] DynamoDB on-demand has cost alerts configured
- [ ] S3 lifecycle policies prevent unbounded storage growth
- [ ] CloudWatch billing alarms set

## SAS-9: Serverless Function Execution Flow Manipulation
- [ ] SQS message validation before processing (merlin-worker)
- [ ] DynamoDB stream events validated before processing
- [ ] No user-controlled data in function invocation chains
- [ ] Step functions (if any) have proper error handling

## SAS-10: Improper Exception Handling and Verbose Error Messages
- [ ] Lambda error responses return generic messages (not stack traces)
- [ ] HTTP 500 responses contain error code, not implementation details
- [ ] Validation errors (400) describe what's wrong without revealing internals
- [ ] Unhandled exceptions caught by top-level handler with safe response
