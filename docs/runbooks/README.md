# Runbooks

Runbooks for HAK CloudWatch alarms. Each alarm links here.

## How to use

1. Get alarm notification in Slack
2. Find the alarm name below
3. Follow the runbook steps

## Alarm Index

| Alarm | Severity | Runbook |
|-------|----------|---------|
| `hak-{env}-api-5xx-errors` | CRITICAL | [API 5XX](#api-5xx-errors) |
| `hak-{env}-merlin-api-5xx` | CRITICAL | [Merlin API 5XX](#merlin-api-5xx) |
| `hak-{env}-tara-auth-5xx` | CRITICAL | [Auth 5XX](#auth-5xx) |
| `hak-{env}-vabamorf-api-5xx` | CRITICAL | [Morphology 5XX](#morphology-5xx) |
| `hak-{env}-merlin-dlq-depth` | CRITICAL | [DLQ Depth](#dlq-depth) |
| `hak-{env}-merlin-sqs-age` | CRITICAL | [SQS Age](#sqs-message-age) |
| `hak-{env}-merlin-ecs-zero-tasks` | CRITICAL | [ECS Zero Tasks](#ecs-zero-tasks) |
| `hak-{env}-merlin-sqs-depth` | CRITICAL | [SQS Depth](#sqs-queue-depth) |
| `hak-{env}-merlin-ecs-high-tasks` | WARNING | [ECS High Tasks](#ecs-high-tasks) |
| `hak-{env}-waf-blocked-high` | WARNING | [WAF Blocked](#waf-blocked) |
| `hak-{env}-slack-notifier-errors` | CRITICAL | [Slack Notifier](#slack-notifier-errors) |
| `hak-{env}-frontend-unhealthy` | CRITICAL | [Frontend Down](#frontend-unhealthy) |
| `hak-{env}-backend-unhealthy` | CRITICAL | [Backend Down](#backend-unhealthy) |
| Lambda error alarms | CRITICAL | [Lambda Errors](#lambda-errors) |

---

## API 5XX Errors

**Alarm:** `hak-{env}-api-5xx-errors` (SimpleStore API Gateway)

1. Check CloudWatch Logs Insights → "Lambda Errors (all services)"
2. Check if specific endpoint is failing: `/api/save`, `/api/get`, etc.
3. Check DynamoDB throttling in dashboard Row 4
4. If DynamoDB throttled → check table capacity settings
5. If Lambda error → check Lambda logs for stack trace

## Merlin API 5XX

**Alarm:** `hak-{env}-merlin-api-5xx`

1. Check Logs Insights → "Lambda Errors"
2. Check if `/synthesize` or `/status` is failing
3. If `/synthesize` → check SQS queue, ECS workers
4. If `/status` → check S3 bucket access, audio file exists
5. Check if Lambda concurrency limit reached

## Auth 5XX

**Alarm:** `hak-{env}-tara-auth-5xx`

1. Check Lambda logs for `tara-auth-{env}-*` functions
2. Check if TARA (ria.ee) external service is responding
3. Check Cognito User Pool status in AWS console
4. Check VPC connectivity (auth Lambda runs in VPC)
5. Check Secrets Manager access for TARA credentials

## Morphology 5XX

**Alarm:** `hak-{env}-vabamorf-api-5xx`

1. Check Lambda logs for `vabamorf-api-{env}-api`
2. Check if ECR image is accessible
3. Check Lambda memory usage (container image = larger footprint)
4. Check Logs Insights → "Slow Lambdas" for timeout issues

## DLQ Depth

**Alarm:** `hak-{env}-merlin-dlq-depth` — user will NOT receive audio

1. **Immediate:** Messages in DLQ = failed audio generation
2. Check ECS worker logs → "Merlin Worker Errors"
3. Check if worker is running: `aws ecs describe-services --cluster hak-merlin-{env} --services merlin-worker`
4. Check if S3 bucket is writable
5. **Recovery:** Redrive DLQ messages after fixing root cause:
   `aws sqs start-message-move-task --source-arn {dlq-arn} --destination-arn {queue-arn}`

## SQS Message Age

**Alarm:** `hak-{env}-merlin-sqs-age` — messages stuck > 5 min

1. Check ECS worker running count (should be ≥ 1)
2. If 0 workers → check ECS service events for launch failures
3. If workers running → check worker logs for processing errors
4. Check if worker is polling but failing silently

## ECS Zero Tasks

**Alarm:** `hak-{env}-merlin-ecs-zero-tasks` (prod only)

1. **CRITICAL:** No workers = no audio generation
2. Check ECS service events: `aws ecs describe-services --cluster hak-merlin-{env} --services merlin-worker`
3. Common causes: ECR image pull failure, task role issues, health check failure
4. Try force new deployment: `aws ecs update-service --cluster hak-merlin-{env} --service merlin-worker --force-new-deployment`
5. Check CloudTrail for recent infrastructure changes

## SQS Queue Depth

**Alarm:** `hak-{env}-merlin-sqs-depth` — queue > 50 messages

1. Check if ECS workers are processing (running task count)
2. Check for traffic spike (CloudFront requests in dashboard)
3. If abuse → check WAF logs, consider rate limiting
4. If legitimate traffic → consider scaling ECS service

## ECS High Tasks

**Alarm:** `hak-{env}-merlin-ecs-high-tasks` — at max capacity

1. Check SQS queue depth — if growing, need more capacity
2. Check if this is a traffic spike or sustained load
3. Consider increasing `max_capacity` in Terraform
4. Monitor for timeouts on synthesis requests

## WAF Blocked

**Alarm:** `hak-{env}-waf-blocked-high` — > 100 blocks in 5 min

1. Check WAF logs in CloudWatch (us-east-1): `aws-waf-logs-hak-{env}`
2. Identify blocked IPs and request patterns
3. If legitimate traffic blocked → adjust WAF rules
4. If attack → consider adding IP block rules
5. Check CloudFront error rate for user impact

## Slack Notifier Errors

**Alarm:** `hak-{env}-slack-notifier-errors`

1. **META-ALARM:** If this fires, Slack alerts are broken
2. Check Lambda logs: Logs Insights → "Slack Notifier Errors"
3. Check if `SLACK_WEBHOOK_URL` is valid (not expired/rotated)
4. Test webhook manually: `curl -s -X POST "$URL" -d '{"text":"test"}'`
5. Check if Slack API is down: https://status.slack.com

## Frontend Unhealthy

**Alarm:** `hak-{env}-frontend-unhealthy`

1. Check CloudFront distribution status in AWS console
2. Check S3 website bucket — files exist and accessible
3. Check Route53 DNS resolution
4. Check ACM certificate validity
5. Try accessing site directly via CloudFront domain

## Backend Unhealthy

**Alarm:** `hak-{env}-backend-unhealthy`

1. Check `/api/health` endpoint manually
2. Check merlin-api Lambda health function logs
3. Check API Gateway HTTP API status
4. Check CloudFront → API Gateway origin configuration
5. If 5XX → follow Merlin API 5XX runbook above

## Lambda Errors

Covers all Lambda error alarms per service.

1. Check specific function logs in CloudWatch
2. Use Logs Insights → "Lambda Errors (all services)"
3. Check for cold start timeouts (increase timeout/memory)
4. Check IAM permissions (role may be missing permissions)
5. Check X-Ray traces for detailed execution path
