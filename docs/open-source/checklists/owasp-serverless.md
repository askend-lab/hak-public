# OWASP Serverless Top 10 — Checklist

> https://owasp.org/www-project-serverless-top-10/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## SAS-1: Function Event-Data Injection
- [ ] check · [ ] done — All `event.body` parsed and validated (`run-tests` — input tests)
- [ ] check · [ ] done — Query params validated (`run-tests`)
- [ ] check · [ ] done — No shell injection via child_process (`run-lint` + code review)
- [ ] check · [ ] done — JSON parsing in try-catch (`run-tests` — error tests)

## SAS-2: Broken Authentication
- [ ] check · [ ] done — Cognito authorizer on all protected endpoints (`terraform validate`)
- [ ] check · [ ] done — Token validation at API Gateway level (`terraform validate`)
- [ ] check · [ ] done — Public endpoints documented and justified (`manual review`)

## SAS-3: Insecure Deployment Configuration
- [ ] check · [ ] done — Lambda functions have minimal IAM (`tfsec`)
- [ ] check · [ ] done — No `Resource: "*"` in IAM policies (`tfsec`)
- [ ] check · [ ] done — Lambda timeout configured appropriately (`terraform validate`)
- [ ] check · [ ] done — Reserved concurrency set (`terraform validate`)

## SAS-4: Over-Privileged Function Permissions
- [ ] check · [ ] done — Each Lambda has own IAM role (`tfsec`)
- [ ] check · [ ] done — DynamoDB access limited to specific tables (`tfsec`)
- [ ] check · [ ] done — S3 access limited to specific buckets (`tfsec`)
- [ ] check · [ ] done — No wildcard actions (`tfsec`)

## SAS-5: Inadequate Monitoring and Logging
- [ ] check · [ ] done — CloudWatch Logs enabled for all Lambdas (`terraform validate`)
- [ ] check · [ ] done — Structured JSON logging (`run-lint` — no-console hook)
- [ ] check · [ ] done — Request IDs in all log entries (`run-tests`)
- [ ] check · [ ] done — CloudWatch Alarms for errors/throttles (`terraform validate`)

## SAS-6: Insecure Third-Party Dependencies
- [ ] check · [ ] done — `pnpm audit` zero high/critical (`security-audit` hook)
- [ ] check · [ ] done — Dependabot auto-creates PRs (`GitHub settings`)
- [ ] check · [ ] done — Lambda packages exclude devDeps (`run-build` verification)

## SAS-7: Insecure Application Secrets Storage
- [ ] check · [ ] done — No secrets in Lambda env vars (`secret-detection` hook)
- [ ] check · [ ] done — No secrets in Terraform state (`tfsec`)
- [ ] check · [ ] done — No secrets in git (`secret-detection` hook — full history)

## SAS-8: DoS / Financial Resource Exhaustion
- [ ] check · [ ] done — API Gateway throttling configured (`terraform validate`)
- [ ] check · [ ] done — Lambda reserved concurrency set (`terraform validate`)
- [ ] check · [ ] done — CloudWatch billing alarms (`terraform validate`)

## SAS-9: Execution Flow Manipulation
- [ ] check · [ ] done — SQS message validation (`run-tests` — merlin-worker tests)
- [ ] check · [ ] done — No user-controlled data in invocation chains (`code review`)

## SAS-10: Improper Exception Handling
- [ ] check · [ ] done — No stack traces in error responses (`run-tests` — error tests)
- [ ] check · [ ] done — Validation errors generic (`run-tests`)
- [ ] check · [ ] done — Top-level handler catches unhandled exceptions (`run-tests`)
