# Lambda/Serverless Audit

**Scope:** AWS Lambda functions, serverless architecture, configuration

## Function Configuration

- [ ] Function memory allocation optimized
- [ ] Function timeout appropriate for task
- [ ] Function description clear and maintained
- [ ] Runtime version current and supported
- [ ] Environment variables used for configuration
- [ ] Reserved concurrency configured where needed
- [ ] Provisioned concurrency for latency-sensitive functions
- [ ] Dead Letter Queue configured for async invocations
- [ ] Function tags applied for cost tracking
- [ ] Function naming convention followed

## Code Organization

- [ ] Handler function clear and focused
- [ ] Business logic separated from handler
- [ ] Dependencies bundled efficiently
- [ ] Code reuse through layers or shared packages
- [ ] Single Responsibility Principle followed
- [ ] Error handling comprehensive
- [ ] Logging structured and consistent
- [ ] Function size reasonable (<50MB zipped)
- [ ] Deployment package optimized

## Cold Start Optimization

- [ ] Initialization code minimized
- [ ] SDK clients initialized outside handler
- [ ] Connection pooling for databases
- [ ] Lazy loading for heavy dependencies
- [ ] Provisioned concurrency for critical functions
- [ ] Language runtime optimized (consider Java snapstart, etc.)
- [ ] Container reuse leveraged
- [ ] Cold start times monitored
- [ ] VPC configuration necessary (or removed)

## Performance

- [ ] Execution time optimized
- [ ] Memory allocation tuned (more memory = more CPU)
- [ ] Async operations used appropriately
- [ ] Batch processing for bulk operations
- [ ] Parallel execution where appropriate
- [ ] Database connection reuse
- [ ] API client reuse
- [ ] Performance metrics tracked
- [ ] Timeout set appropriately (not max by default)

## Layers

- [ ] Common dependencies extracted to layers
- [ ] Layer versions tracked
- [ ] Layer size reasonable (<50MB)
- [ ] Layers shared across functions where appropriate
- [ ] Runtime-specific layers
- [ ] Third-party layers from trusted sources
- [ ] Layer update strategy defined

## Environment Variables

- [ ] Environment variables used for configuration
- [ ] No secrets in plain text environment variables
- [ ] AWS Secrets Manager or Parameter Store for secrets
- [ ] Environment-specific variables
- [ ] Variable naming consistent
- [ ] Required variables documented
- [ ] Variables validated at function start

## IAM Permissions

- [ ] Execution role follows least privilege
- [ ] Permissions specific to function needs
- [ ] No wildcard permissions unless necessary
- [ ] Resource-level permissions where possible
- [ ] Cross-account access properly configured
- [ ] Assume role permissions appropriate
- [ ] Policy documents version controlled
- [ ] Permission changes reviewed

## Triggers & Event Sources

- [ ] Event source mappings configured correctly
- [ ] Batch size appropriate for processing
- [ ] Batch window configured (if applicable)
- [ ] Partial batch failure handling configured
- [ ] Event filtering used to reduce invocations
- [ ] DLQ configured for failed events
- [ ] Retry behavior configured appropriately
- [ ] Maximum age of record set
- [ ] Concurrent batches controlled

## Logging

- [ ] CloudWatch Logs configured
- [ ] Log retention period set
- [ ] Structured logging (JSON) implemented
- [ ] Log level configurable
- [ ] Request ID included in logs
- [ ] Errors logged with context
- [ ] No sensitive data logged
- [ ] Correlation IDs for tracing
- [ ] Log insights queries created for common issues

## Monitoring & Alerting

- [ ] CloudWatch metrics collected
- [ ] Custom metrics published
- [ ] Alarms configured for errors
- [ ] Alarms configured for throttling
- [ ] Alarms configured for duration
- [ ] Alarms configured for concurrent executions
- [ ] X-Ray tracing enabled
- [ ] Dashboards created for key metrics
- [ ] Anomaly detection configured

## Error Handling

- [ ] Exceptions caught and handled
- [ ] Error types distinguished
- [ ] Retryable vs non-retryable errors identified
- [ ] Error responses structured
- [ ] DLQ messages include error context
- [ ] Errors logged with stack traces
- [ ] Error metrics tracked
- [ ] Error alerting configured

## Asynchronous Processing

- [ ] Async invocations used appropriately
- [ ] Event payload validated
- [ ] Idempotency ensured
- [ ] DLQ configured for failures
- [ ] Retry policy configured
- [ ] Maximum event age set
- [ ] Destination configured (success/failure)
- [ ] Async processing monitored

## API Gateway Integration

- [ ] API Gateway configured correctly
- [ ] Lambda proxy integration used
- [ ] Request/response mapping appropriate
- [ ] API Gateway timeout considered (<29s)
- [ ] Throttling at API Gateway level
- [ ] Authorization configured
- [ ] CORS configured
- [ ] API Gateway logs enabled

## SQS Integration

- [ ] Batch size optimized
- [ ] Visibility timeout appropriate
- [ ] DLQ configured
- [ ] Partial batch failures handled
- [ ] Message attributes used appropriately
- [ ] Processing idempotent
- [ ] Backpressure handling
- [ ] FIFO queue ordering preserved (if applicable)

## DynamoDB Streams

- [ ] Batch size appropriate
- [ ] Starting position configured
- [ ] Parallel processing configured
- [ ] Tumbling window for aggregations
- [ ] Bisect batch on error configured
- [ ] Retry attempts configured
- [ ] Maximum record age set
- [ ] Stream processing idempotent

## EventBridge Integration

- [ ] Event patterns defined correctly
- [ ] Event schemas defined
- [ ] Event versioning strategy
- [ ] Event filtering used
- [ ] Dead Letter Queue configured
- [ ] Retry policy configured
- [ ] Event archive configured (if needed)
- [ ] Cross-account events configured securely

## VPC Configuration

- [ ] VPC access necessary (many functions don't need VPC)
- [ ] Subnets configured correctly
- [ ] Security groups configured
- [ ] NAT Gateway for internet access (if needed)
- [ ] ENI creation time considered for cold starts
- [ ] Hyperplane ENIs used (newer Lambda feature)
- [ ] VPC endpoints for AWS services

## Security

- [ ] Secrets stored in Secrets Manager/Parameter Store
- [ ] Secrets retrieved at runtime (not in environment variables)
- [ ] Input validation implemented
- [ ] Output sanitization implemented
- [ ] Encryption in transit
- [ ] Encryption at rest
- [ ] Function URLs authenticated (if used)
- [ ] Resource-based policies reviewed
- [ ] Code scanning for vulnerabilities

## Deployment

- [ ] Deployment automated via CI/CD
- [ ] Infrastructure as Code (Terraform, SAM, Serverless Framework)
- [ ] Function versioning used
- [ ] Aliases for environments (dev, staging, prod)
- [ ] Weighted aliases for canary deployments
- [ ] Rollback procedures documented
- [ ] Blue-green deployment strategy
- [ ] Deployment notifications configured

## Versioning & Aliases

- [ ] Function versions published
- [ ] Aliases point to specific versions
- [ ] $LATEST not used in production
- [ ] Version descriptions maintained
- [ ] Alias routing for gradual rollouts
- [ ] Old versions cleaned up
- [ ] Version history tracked

## Testing

- [ ] Unit tests for business logic
- [ ] Integration tests with AWS services
- [ ] Local testing with SAM or LocalStack
- [ ] Load testing performed
- [ ] Mock event payloads for testing
- [ ] Test coverage acceptable
- [ ] Automated testing in CI/CD
- [ ] Canary deployment testing

## Cost Optimization

- [ ] Function memory right-sized
- [ ] Execution time optimized
- [ ] Unused functions identified and removed
- [ ] Function duration under 15 minutes (or moved to Fargate)
- [ ] Reserved concurrency prevents runaway costs
- [ ] Cost allocation tags applied
- [ ] Cost monitored and alerted
- [ ] Savings Plan considered for consistent usage

## Concurrency Management

- [ ] Concurrent execution limits understood
- [ ] Reserved concurrency for critical functions
- [ ] Account-level concurrency monitored
- [ ] Throttling handled gracefully
- [ ] Burst concurrency limits known
- [ ] Provisioned concurrency for predictable load

## Dependencies

- [ ] Minimal dependencies included
- [ ] Dependencies audited for vulnerabilities
- [ ] Dependency versions pinned
- [ ] Dependencies shared via layers
- [ ] Native dependencies compiled for Lambda runtime
- [ ] Dependency size optimized
- [ ] Unused dependencies removed

## State Management

- [ ] Functions designed to be stateless
- [ ] State stored in external services (DynamoDB, S3, etc.)
- [ ] Temporary files cleaned up
- [ ] /tmp directory size limits understood (<512MB)
- [ ] Long-running state managed externally
- [ ] Step Functions used for complex workflows

## Step Functions Integration (if applicable)

- [ ] State machine design follows best practices
- [ ] Error handling in state machine
- [ ] Retries configured appropriately
- [ ] Timeouts set for each state
- [ ] State machine versioned
- [ ] Input/output filtering used
- [ ] Parallel execution where appropriate
- [ ] Choice states for conditional logic
- [ ] Wait states for delays

## Documentation

- [ ] Function purpose documented
- [ ] Input/output format documented
- [ ] Event payload structure documented
- [ ] Dependencies documented
- [ ] Configuration documented
- [ ] Error handling documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

## Observability

- [ ] Distributed tracing with X-Ray
- [ ] Custom X-Ray annotations
- [ ] X-Ray sampling rules configured
- [ ] Service map available
- [ ] Trace analysis automated
- [ ] Performance insights from traces
- [ ] Error correlation with traces

## Limits & Quotas

- [ ] AWS Lambda limits understood
- [ ] Account quotas monitored
- [ ] Request for limit increases if needed
- [ ] Payload size limits respected (6MB sync, 256KB async)
- [ ] Execution timeout limits understood (<15 min)
- [ ] /tmp storage limits understood (<10GB)
- [ ] Deployment package limits understood

## Serverless Framework (if used)

- [ ] serverless.yml well-organized
- [ ] Plugins used appropriately
- [ ] Stage variables used
- [ ] Custom domains configured
- [ ] Packaging optimized
- [ ] Provider configuration appropriate
- [ ] Service name follows convention

## SAM (if used)

- [ ] SAM template well-organized
- [ ] Globals section used for common settings
- [ ] Parameters for environment-specific values
- [ ] Outputs defined
- [ ] SAM CLI used for local testing
- [ ] SAM policy templates used

## Compliance

- [ ] Data residency requirements met
- [ ] Audit logging enabled
- [ ] Compliance requirements documented
- [ ] Function tags for compliance tracking
- [ ] Data retention policies enforced

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Lambda Statistics:**
- Total Functions: _____
- Average Duration: _____ ms
- Average Memory Used: _____ MB
- Cold Start Rate: _____%
- Error Rate: _____%
- Throttle Rate: _____%

**Issues Found:**
- 

**Optimization Opportunities:**
- 

**Action Items:**
- 
