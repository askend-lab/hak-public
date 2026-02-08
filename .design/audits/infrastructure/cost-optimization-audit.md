# Cost Optimization Audit

**Scope:** AWS spending, resource utilization, cost efficiency

## Cost Visibility

- [ ] AWS Cost Explorer enabled and used regularly
- [ ] Cost allocation tags consistently applied
- [ ] Cost reports generated monthly
- [ ] Cost trends analyzed regularly
- [ ] Cost anomaly detection enabled
- [ ] Budget alerts configured
- [ ] Departmental cost tracking implemented
- [ ] Project-level cost tracking implemented
- [ ] Cost forecasting reviewed monthly

## Compute Optimization

- [ ] EC2 instances right-sized (not over-provisioned)
- [ ] Idle EC2 instances identified and terminated
- [ ] Reserved Instances evaluated and purchased where appropriate
- [ ] Savings Plans evaluated and purchased where appropriate
- [ ] Spot Instances used for non-critical workloads
- [ ] Auto Scaling configured to match demand
- [ ] Instance Scheduler used for dev/test environments
- [ ] Graviton instances evaluated for cost savings
- [ ] Lambda memory allocation optimized
- [ ] Lambda execution time optimized

## Storage Optimization

- [ ] EBS volumes right-sized
- [ ] Unattached EBS volumes removed
- [ ] EBS snapshots reviewed and old ones deleted
- [ ] S3 lifecycle policies implemented
- [ ] S3 Intelligent-Tiering enabled where appropriate
- [ ] Infrequent Access (IA) storage used for cold data
- [ ] Glacier used for archival data
- [ ] S3 versioning limited where not needed
- [ ] Incomplete multipart uploads cleaned up
- [ ] CloudFront used to reduce S3 data transfer costs

## Database Optimization

- [ ] RDS instances right-sized
- [ ] RDS Reserved Instances purchased where appropriate
- [ ] Aurora Serverless considered for variable workloads
- [ ] Database snapshots retention optimized
- [ ] DynamoDB capacity mode optimized (on-demand vs provisioned)
- [ ] DynamoDB auto-scaling configured
- [ ] DynamoDB backup retention optimized
- [ ] ElastiCache used to reduce database load

## Network Optimization

- [ ] Data transfer costs analyzed
- [ ] VPC endpoints used to avoid NAT Gateway costs
- [ ] CloudFront used to reduce data transfer costs
- [ ] Direct Connect evaluated for high-volume transfers
- [ ] Cross-region data transfer minimized
- [ ] NAT Gateway usage optimized (single vs multiple)
- [ ] Load balancer type optimized (ALB vs NLB vs CLB)

## Monitoring & Logging Costs

- [ ] CloudWatch Logs retention policies optimized
- [ ] Log data exported to S3 for long-term storage
- [ ] Detailed monitoring only enabled where necessary
- [ ] Custom metrics usage reviewed
- [ ] CloudWatch Logs Insights queries optimized
- [ ] Unnecessary log streams removed

## Reserved Capacity

- [ ] Reserved Instance utilization tracked
- [ ] Reserved Instance coverage analyzed
- [ ] Reserved Instance recommendations reviewed quarterly
- [ ] Savings Plans utilization tracked
- [ ] Reserved capacity for RDS, ElastiCache, etc. evaluated
- [ ] Convertible vs Standard RIs evaluated

## Serverless Optimization

- [ ] Lambda memory allocation matches actual usage
- [ ] Lambda timeout settings appropriate
- [ ] Lambda cold starts minimized
- [ ] API Gateway caching enabled where appropriate
- [ ] Step Functions used instead of Lambda orchestration where appropriate
- [ ] SQS/SNS used for decoupling instead of direct invocation

## Development & Testing Environments

- [ ] Dev/test environments shut down outside business hours
- [ ] Smaller instance types used in non-production
- [ ] Ephemeral environments cleaned up automatically
- [ ] Production snapshots used instead of running full copies
- [ ] Spot Instances used for CI/CD workloads

## License & Software Costs

- [ ] BYOL (Bring Your Own License) evaluated
- [ ] Open-source alternatives considered
- [ ] License utilization tracked
- [ ] Unused licenses removed
- [ ] Volume licensing discounts negotiated

## Third-Party Services

- [ ] SaaS costs tracked and reviewed
- [ ] Alternative providers evaluated periodically
- [ ] Usage-based pricing optimized
- [ ] Unused subscriptions canceled
- [ ] Volume discounts negotiated

## Tagging for Cost Allocation

- [ ] Cost allocation tags defined (Environment, Project, Owner, etc.)
- [ ] All resources tagged consistently
- [ ] Tag compliance enforced
- [ ] Untagged resources identified and tagged
- [ ] Cost reports grouped by tags

## Waste Identification

- [ ] Unused resources identified regularly
- [ ] Orphaned resources cleaned up
- [ ] Unused Elastic IPs released
- [ ] Old snapshots deleted
- [ ] Unused load balancers removed
- [ ] Idle RDS instances identified

## Rightsizing Recommendations

- [ ] AWS Compute Optimizer enabled
- [ ] Rightsizing recommendations reviewed monthly
- [ ] CloudWatch metrics used for rightsizing decisions
- [ ] CPU/memory utilization analyzed
- [ ] Performance impact considered when downsizing

## Commitment & Contracts

- [ ] Enterprise Support vs Business Support evaluated
- [ ] AWS credits tracked and utilized
- [ ] Contract negotiations scheduled before renewal
- [ ] Private Pricing Agreements (PPA) evaluated
- [ ] Volume discounts negotiated

## Automation

- [ ] Cost optimization automated where possible
- [ ] Automated shutdown/startup schedules implemented
- [ ] Automated cleanup scripts for old resources
- [ ] Cost alerts trigger automated actions where appropriate
- [ ] Infrastructure as Code prevents manual over-provisioning

## Cost Accountability

- [ ] Chargeback or showback model implemented
- [ ] Teams aware of their resource costs
- [ ] Cost optimization KPIs defined
- [ ] Cost reviews included in sprint planning
- [ ] Cost responsibility assigned to teams

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Current Monthly Cost:** $___________  
**Cost Trend:** ⬜ Increasing ⬜ Stable ⬜ Decreasing  

**Potential Savings Identified:** $___________  

**Quick Wins:**
- 

**Medium-term Opportunities:**
- 

**Action Items:**
- 
