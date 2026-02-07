# AWS Well-Architected Framework — Checklist

> https://aws.amazon.com/architecture/well-architected/
> Format: [ ] **check** = verification exists · [ ] **done** = requirement satisfied

## Pillar 1: Operational Excellence
- [ ] check · [ ] done — Runbooks for deployment/rollback (`manual review`)
- [ ] check · [ ] done — CloudWatch dashboards for all Lambdas (`terraform validate`)
- [ ] check · [ ] done — Automated deployments via CI/CD (`GitHub Actions build.yml`)
- [ ] check · [ ] done — Infra changes reviewed before apply (`terraform plan` in PR)

## Pillar 2: Security
- [ ] check · [ ] done — IAM least privilege per-function roles (`tfsec`)
- [ ] check · [ ] done — Encryption at rest DynamoDB/S3 (`tfsec`)
- [ ] check · [ ] done — TLS 1.2+ for all endpoints (`tfsec` — CloudFront config)
- [ ] check · [ ] done — CloudTrail enabled for audit logging (`terraform validate`)
- [ ] check · [ ] done — GuardDuty enabled (`terraform validate`)

## Pillar 3: Reliability
- [ ] check · [ ] done — DynamoDB point-in-time recovery enabled (`tfsec`)
- [ ] check · [ ] done — Lambda retry + DLQ for async invocations (`terraform validate`)
- [ ] check · [ ] done — SQS DLQ for merlin-worker failures (`terraform validate`)
- [ ] check · [ ] done — Disaster recovery plan documented (`manual review`)

## Pillar 4: Performance Efficiency
- [ ] check · [ ] done — Lambda memory right-sized (`Lambda Power Tuning`)
- [ ] check · [ ] done — Lambda cold start minimized — small bundles (`size-limit` tool)
- [ ] check · [ ] done — DynamoDB no Scan operations (`run-tests` + code review)
- [ ] check · [ ] done — CloudFront caching for static assets (`terraform validate`)
- [ ] check · [ ] done — S3 audio cache prevents re-synthesis (`run-tests`)

## Pillar 5: Cost Optimization
- [ ] check · [ ] done — Lambda concurrency limits set (`terraform validate`)
- [ ] check · [ ] done — S3 lifecycle policies for audio cache (`terraform validate`)
- [ ] check · [ ] done — CloudWatch billing alarms configured (`terraform validate`)
- [ ] check · [ ] done — Cost allocation tags on all resources (`tfsec` tag check)

## Pillar 6: Sustainability
- [ ] check · [ ] done — Right-sized compute (`Lambda Power Tuning`)
- [ ] check · [ ] done — Caching reduces redundant computation (`run-tests`)
- [ ] check · [ ] done — Minimal deployment artifacts (`size-limit`)
