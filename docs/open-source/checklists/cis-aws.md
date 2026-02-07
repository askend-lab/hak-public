# CIS AWS Foundations Benchmark — Checklist

> https://www.cisecurity.org/benchmark/amazon_web_services
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Identity and Access Management
- [ ] check · [ ] done — No root account for daily operations (`AWS Security Hub`)
- [ ] check · [ ] done — MFA on root and all IAM users (`AWS Security Hub`)
- [ ] check · [ ] done — IAM policies least privilege, no `*` (`tfsec`)
- [ ] check · [ ] done — Lambda roles scoped to specific resources (`tfsec`)
- [ ] check · [ ] done — No inline IAM policies (`tfsec`)
- [ ] check · [ ] done — IAM Access Analyzer enabled (`terraform validate`)

## Logging & Monitoring
- [ ] check · [ ] done — CloudTrail enabled in all regions (`tfsec`)
- [ ] check · [ ] done — CloudTrail logs encrypted in S3 (`tfsec`)
- [ ] check · [ ] done — CloudWatch Log retention policies set (`terraform validate`)
- [ ] check · [ ] done — API Gateway access logging enabled (`terraform validate`)
- [ ] check · [ ] done — Alarms for unauthorized calls, root usage (`terraform validate`)

## Networking
- [ ] check · [ ] done — Default VPC security groups restrict inbound (`tfsec`)
- [ ] check · [ ] done — S3 buckets block public access (`tfsec`)
- [ ] check · [ ] done — CloudFront uses TLS 1.2 minimum (`tfsec`)

## Storage
- [ ] check · [ ] done — S3 versioning enabled (`tfsec`)
- [ ] check · [ ] done — S3 access logging enabled (`tfsec`)
- [ ] check · [ ] done — DynamoDB point-in-time recovery (`tfsec`)
- [ ] check · [ ] done — DynamoDB encryption at rest (`tfsec`)
- [ ] check · [ ] done — S3 lifecycle policies for cost management (`terraform validate`)

## Compute
- [ ] check · [ ] done — Lambda uses latest Node.js runtime (`terraform validate`)
- [ ] check · [ ] done — Lambda env vars contain no secrets (`secret-detection` hook)
- [ ] check · [ ] done — ECS tasks use Fargate (`terraform validate`)
- [ ] check · [ ] done — ECR image scanning enabled (`terraform validate`)

## Terraform Verification
- [ ] check · [ ] done — `tfsec` zero high findings (`tfsec` in CI)
- [ ] check · [ ] done — `checkov` zero critical findings (`checkov` in CI)
- [ ] check · [ ] done — Terraform state encrypted (`tfsec`)
- [ ] check · [ ] done — Terraform state access restricted (`tfsec`)
