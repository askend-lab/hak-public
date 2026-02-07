# AWS Well-Architected Framework — Checklist

> https://aws.amazon.com/architecture/well-architected/
> 6 pillars applied to HAK's serverless architecture.

## Pillar 1: Operational Excellence
- [ ] Runbooks for common operations (deployment, rollback, incident response)
- [ ] CloudWatch dashboards for all Lambda functions (invocations, errors, duration)
- [ ] Automated deployments via CI/CD (GitHub Actions → Terraform → AWS)
- [ ] Infrastructure changes reviewed before apply (`terraform plan` in PR)
- [ ] Deployment strategy documented (blue/green, canary, or all-at-once)

## Pillar 2: Security
- [ ] IAM roles follow least privilege (per-function roles, no `*` resources)
- [ ] Encryption at rest for DynamoDB, S3 (AWS managed keys or CMK)
- [ ] Encryption in transit: TLS 1.2+ for all endpoints (CloudFront config)
- [ ] Security groups and VPC configuration reviewed (if Lambdas in VPC)
- [ ] CloudTrail enabled for audit logging
- [ ] AWS Config rules for compliance monitoring
- [ ] GuardDuty enabled for threat detection

## Pillar 3: Reliability
- [ ] Multi-AZ deployment for critical services (DynamoDB global tables or backups)
- [ ] Lambda retry and dead-letter queue configuration for async invocations
- [ ] SQS dead-letter queue for merlin-worker message failures
- [ ] Backup strategy for DynamoDB data (point-in-time recovery enabled)
- [ ] Disaster recovery plan documented (RPO/RTO targets)

## Pillar 4: Performance Efficiency
- [ ] Lambda memory right-sized (use AWS Lambda Power Tuning)
- [ ] Lambda cold start minimized (small bundles, lazy imports)
- [ ] DynamoDB access patterns optimized (no Scan operations, proper GSI design)
- [ ] CloudFront caching configured for static assets and API responses where appropriate
- [ ] S3 audio cache prevents redundant TTS synthesis

## Pillar 5: Cost Optimization
- [ ] Lambda concurrency limits set to prevent runaway costs
- [ ] DynamoDB on-demand vs provisioned capacity evaluated
- [ ] S3 lifecycle policies for audio cache (transition to IA, expire old files)
- [ ] CloudWatch billing alarms configured
- [ ] Cost allocation tags on all resources (`Project: hak`, `Environment: dev/prod`)
- [ ] Monthly cost review process documented

## Pillar 6: Sustainability
- [ ] Right-sized compute (Lambda memory, ECS task sizes for merlin-worker)
- [ ] Caching reduces redundant computation (S3 audio cache)
- [ ] Efficient data transfer (CloudFront edge caching)
- [ ] Minimal deployment artifact sizes (tree-shaking, production-only deps)
