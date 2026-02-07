# CIS AWS Foundations Benchmark — Checklist

> https://www.cisecurity.org/benchmark/amazon_web_services
> Security configuration best practices for AWS services used by HAK.

## Identity and Access Management
- [ ] No root account usage for daily operations
- [ ] MFA enabled on root account and all IAM users
- [ ] IAM policies use least privilege (no `Action: "*"` or `Resource: "*"`)
- [ ] Lambda execution roles scoped to specific resources (table ARN, bucket ARN, queue ARN)
- [ ] No inline IAM policies — use managed policies attached to roles
- [ ] IAM Access Analyzer enabled to detect unintended access

## Logging & Monitoring
- [ ] CloudTrail enabled in all regions with log file validation
- [ ] CloudTrail logs delivered to S3 with server-side encryption
- [ ] CloudWatch Log Groups have retention policies (not infinite)
- [ ] API Gateway access logging enabled
- [ ] CloudWatch Alarms for: unauthorized API calls, root account usage, IAM changes

## Networking
- [ ] Default VPC security groups restrict all inbound traffic
- [ ] S3 buckets block public access (unless intentionally public for frontend)
- [ ] CloudFront distributions use TLS 1.2 minimum
- [ ] API Gateway endpoints use regional or edge-optimized (not private unless needed)

## Storage
- [ ] S3 bucket versioning enabled for data recovery
- [ ] S3 bucket access logging enabled for audit trail
- [ ] DynamoDB point-in-time recovery enabled
- [ ] DynamoDB encryption at rest enabled (default AWS managed key or CMK)
- [ ] S3 lifecycle policies for cost management (audio cache expiry)

## Compute
- [ ] Lambda functions use latest supported runtime version (Node.js 20)
- [ ] Lambda environment variables do not contain secrets (use Secrets Manager)
- [ ] ECS tasks use Fargate (no EC2 instances to manage)
- [ ] ECS task definitions specify CPU and memory limits
- [ ] ECR image scanning enabled for merlin-worker images

## Terraform Verification
- [ ] Run `tfsec` on all Terraform files — zero high findings
- [ ] Run `checkov` on all Terraform files — zero critical findings
- [ ] Terraform state encrypted at rest (S3 + DynamoDB backend ✓)
- [ ] Terraform state access restricted via IAM policies
