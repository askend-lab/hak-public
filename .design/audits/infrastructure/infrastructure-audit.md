# Infrastructure Audit

**Scope:** AWS resources, Terraform configurations, cloud architecture

## AWS Account & Organization

- [ ] AWS account structure follows least privilege principles
- [ ] Multi-account strategy is implemented (dev/staging/prod separation)
- [ ] Root account has MFA enabled and is not used for daily operations
- [ ] IAM users have individual accounts (no shared credentials)
- [ ] Service Control Policies (SCPs) are configured appropriately
- [ ] AWS Organizations structure aligns with business needs
- [ ] Billing alerts and budgets are configured
- [ ] Cost allocation tags are consistently applied
- [ ] CloudTrail is enabled in all regions
- [ ] CloudTrail logs are stored in secure, separate account

## IAM & Access Control

- [ ] IAM policies follow least privilege principle
- [ ] No overly permissive wildcard permissions in policies
- [ ] IAM roles are used instead of long-term credentials where possible
- [ ] Cross-account access uses IAM roles, not access keys
- [ ] Service roles have appropriate trust relationships
- [ ] IAM password policy meets security requirements
- [ ] MFA is enforced for privileged users
- [ ] Access keys are rotated regularly (or not used)
- [ ] Unused IAM users and roles are removed
- [ ] IAM Access Analyzer findings are reviewed and addressed

## Terraform State Management

- [ ] Terraform state is stored in S3 with encryption
- [ ] S3 state bucket has versioning enabled
- [ ] S3 state bucket blocks public access
- [ ] DynamoDB table used for state locking
- [ ] State file access is restricted via IAM policies
- [ ] Backend configuration is consistent across environments
- [ ] No sensitive data is stored in plain text in state
- [ ] State file backups are configured

## Terraform Code Quality

- [ ] Terraform version is pinned in configuration
- [ ] Provider versions are pinned
- [ ] Module versions are pinned (no floating versions)
- [ ] Resources are properly organized into modules
- [ ] Module naming follows consistent conventions
- [ ] Variables have descriptions and types defined
- [ ] Outputs are documented and meaningful
- [ ] No hardcoded values (use variables/locals)
- [ ] Sensitive variables are marked as sensitive
- [ ] terraform fmt is applied consistently
- [ ] terraform validate passes without errors
- [ ] tflint or similar linting tool is used

## VPC & Networking

- [ ] VPC CIDR blocks are properly planned (no overlaps)
- [ ] Subnets are organized by purpose (public/private/data)
- [ ] Multi-AZ deployment for high availability
- [ ] NAT Gateways deployed in multiple AZs
- [ ] Route tables are correctly configured
- [ ] Network ACLs follow least privilege
- [ ] Security groups follow least privilege (no 0.0.0.0/0 ingress except necessary)
- [ ] VPC Flow Logs are enabled
- [ ] VPC endpoints used for AWS services where applicable
- [ ] Transit Gateway or VPC peering configured correctly (if used)

## Compute Resources

- [ ] EC2 instances use appropriate instance types
- [ ] Auto Scaling groups configured for resilience
- [ ] Launch templates/configurations are up to date
- [ ] AMIs are regularly updated and patched
- [ ] Instance metadata service v2 (IMDSv2) is enforced
- [ ] Detailed monitoring enabled for critical instances
- [ ] Unused or stopped instances are identified and removed
- [ ] Reserved instances or Savings Plans evaluated for cost optimization
- [ ] EBS volumes are encrypted
- [ ] Unattached EBS volumes are removed
- [ ] EBS snapshots have retention policies

## Lambda Functions

- [ ] Lambda functions use appropriate memory allocation
- [ ] Lambda timeout settings are appropriate
- [ ] Dead Letter Queues (DLQ) configured for async functions
- [ ] Environment variables don't contain secrets in plain text
- [ ] Lambda execution roles follow least privilege
- [ ] Reserved concurrency configured where needed
- [ ] VPC configuration is appropriate (or not used unnecessarily)
- [ ] Lambda layers are used for shared dependencies
- [ ] CloudWatch Logs retention configured
- [ ] X-Ray tracing enabled for debugging

## API Gateway

- [ ] API Gateway stages match environments (dev/staging/prod)
- [ ] Throttling and rate limiting configured
- [ ] API keys used where appropriate
- [ ] Custom domain names configured with SSL/TLS
- [ ] WAF rules applied (if needed)
- [ ] Request/response validation enabled
- [ ] Access logging enabled
- [ ] CloudWatch metrics configured
- [ ] CORS configured correctly
- [ ] API documentation kept up to date

## Databases

- [ ] RDS instances use appropriate instance types
- [ ] Multi-AZ enabled for production databases
- [ ] Automated backups configured with appropriate retention
- [ ] Backup restoration tested regularly
- [ ] Database encryption at rest enabled
- [ ] Database encryption in transit enforced
- [ ] Database parameter groups reviewed for best practices
- [ ] Performance Insights enabled
- [ ] Enhanced monitoring enabled
- [ ] DynamoDB tables use on-demand or provisioned capacity appropriately
- [ ] DynamoDB point-in-time recovery enabled for critical tables
- [ ] DynamoDB auto-scaling configured (if using provisioned)

## Storage (S3)

- [ ] S3 buckets block public access by default
- [ ] S3 bucket policies follow least privilege
- [ ] Server-side encryption enabled (SSE-S3, SSE-KMS, or SSE-C)
- [ ] Versioning enabled for critical buckets
- [ ] Lifecycle policies configured for cost optimization
- [ ] MFA Delete enabled for critical buckets
- [ ] S3 access logging enabled
- [ ] CloudTrail data events configured for sensitive buckets
- [ ] Cross-region replication configured where needed
- [ ] Object Lock configured for compliance requirements (if applicable)

## CDN & Caching (CloudFront)

- [ ] CloudFront distributions use HTTPS/TLS
- [ ] Origin access identity (OAI) or OAC used for S3 origins
- [ ] Cache behaviors configured appropriately
- [ ] TTL settings optimized for content type
- [ ] Custom error pages configured
- [ ] Geographic restrictions applied if needed
- [ ] WAF integrated for security
- [ ] Access logs enabled
- [ ] Field-level encryption used where appropriate

## DNS (Route 53)

- [ ] Health checks configured for critical endpoints
- [ ] Failover routing policies implemented where needed
- [ ] DNSSEC enabled for domain security
- [ ] Query logging enabled
- [ ] Hosted zones properly organized
- [ ] NS and SOA records correct
- [ ] TTL values appropriate for record types

## Monitoring & Logging

- [ ] CloudWatch alarms configured for critical metrics
- [ ] Alarm actions are set up (SNS notifications, Auto Scaling, etc.)
- [ ] Log groups have retention policies
- [ ] Logs are centralized (CloudWatch Logs, S3, or external)
- [ ] Metric filters defined for important application events
- [ ] CloudWatch dashboards created for key metrics
- [ ] AWS Config enabled for resource tracking
- [ ] AWS Config rules configured for compliance checks
- [ ] EventBridge rules set up for automation

## Secrets Management

- [ ] AWS Secrets Manager or Parameter Store used for secrets
- [ ] Secrets rotation enabled and functioning
- [ ] Secrets are not stored in code or environment variables
- [ ] KMS keys used for encrypting secrets
- [ ] KMS key policies follow least privilege
- [ ] KMS key rotation enabled
- [ ] Access to secrets is logged and monitored

## Backup & Disaster Recovery

- [ ] AWS Backup configured for critical resources
- [ ] Backup plans cover all production data
- [ ] Backup retention meets compliance requirements
- [ ] Cross-region backups configured for critical data
- [ ] Backup restoration procedures documented
- [ ] Disaster recovery plan documented
- [ ] RTO and RPO defined and tested
- [ ] Regular DR drills conducted

## Tagging Strategy

- [ ] Tagging policy defined and documented
- [ ] All resources have required tags (Environment, Owner, Project, etc.)
- [ ] Cost allocation tags used consistently
- [ ] Tag compliance monitored
- [ ] Automated tagging implemented where possible

## Compliance & Governance

- [ ] AWS Config conformance packs applied
- [ ] Security Hub enabled and monitored
- [ ] GuardDuty enabled in all regions
- [ ] Inspector scans running for vulnerabilities
- [ ] Trusted Advisor checks reviewed regularly
- [ ] Compliance requirements documented (GDPR, HIPAA, etc.)
- [ ] Regular compliance audits scheduled

## High Availability & Resilience

- [ ] Critical services deployed across multiple AZs
- [ ] Auto Scaling configured for dynamic workloads
- [ ] Load balancers distribute traffic appropriately
- [ ] Health checks configured for all load balancer targets
- [ ] Circuit breaker patterns implemented where appropriate
- [ ] Graceful degradation strategies in place
- [ ] Chaos engineering practices considered

## Resource Optimization

- [ ] Right-sizing analysis performed regularly
- [ ] Idle resources identified and terminated
- [ ] Reserved Instances or Savings Plans evaluated
- [ ] Spot instances used where appropriate
- [ ] S3 Intelligent-Tiering or lifecycle policies reduce storage costs
- [ ] CloudFront reduces data transfer costs
- [ ] Lambda memory and timeout optimized
- [ ] Cost anomaly detection enabled

## Infrastructure as Code Best Practices

- [ ] All infrastructure defined in Terraform (no manual changes)
- [ ] Terraform workspaces or separate state files per environment
- [ ] Change management process for infrastructure changes
- [ ] Terraform plan reviewed before apply
- [ ] Infrastructure changes tracked in version control
- [ ] Terraform modules reused across projects
- [ ] Remote state locking prevents concurrent modifications
- [ ] Terraform provider credentials not hardcoded

## Documentation

- [ ] Architecture diagrams up to date
- [ ] Network diagrams documented
- [ ] Infrastructure runbooks available
- [ ] Terraform module documentation complete
- [ ] Incident response procedures documented
- [ ] Escalation paths defined
- [ ] On-call rotation documented
- [ ] Disaster recovery procedures documented

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Critical Issues:**
- 

**Medium Issues:**
- 

**Recommendations:**
- 

**Action Items:**
- 
