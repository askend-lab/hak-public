# Database Audit

**Scope:** Database schema, queries, indexing, migrations, performance

## Schema Design

- [ ] Schema normalized to appropriate level
- [ ] Primary keys defined on all tables
- [ ] Foreign keys enforce referential integrity
- [ ] Data types appropriate for columns
- [ ] NULL constraints defined appropriately
- [ ] Default values defined where appropriate
- [ ] Check constraints validate data
- [ ] Unique constraints prevent duplicates
- [ ] Composite keys used appropriately
- [ ] Schema documentation maintained

## Table Design

- [ ] Table names descriptive and consistent
- [ ] Column names descriptive and consistent
- [ ] Naming conventions followed (snake_case, camelCase, etc.)
- [ ] Reserved words avoided in names
- [ ] Timestamps (created_at, updated_at) on relevant tables
- [ ] Soft delete columns (deleted_at) where appropriate
- [ ] Version columns for optimistic locking
- [ ] Audit columns for tracking changes
- [ ] Table size manageable (partitioning for large tables)

## Indexes

- [ ] Primary key indexes exist
- [ ] Foreign key columns indexed
- [ ] Frequently queried columns indexed
- [ ] Composite indexes for multi-column queries
- [ ] Index selectivity considered
- [ ] Covering indexes used where appropriate
- [ ] Partial indexes for filtered queries
- [ ] Unused indexes identified and removed
- [ ] Index maintenance scheduled
- [ ] Index fragmentation monitored

## Relationships

- [ ] One-to-many relationships defined correctly
- [ ] Many-to-many relationships use junction tables
- [ ] Foreign key constraints enforced
- [ ] Cascade delete configured appropriately
- [ ] Orphaned records prevented
- [ ] Circular dependencies avoided
- [ ] Relationship cardinality appropriate

## Data Integrity

- [ ] Referential integrity enforced
- [ ] Data validation at database level
- [ ] Transactions used for multi-step operations
- [ ] ACID properties maintained
- [ ] Constraints prevent invalid data
- [ ] Triggers used judiciously
- [ ] Data consistency checked regularly

## Query Performance

- [ ] Slow queries identified and logged
- [ ] Query execution plans reviewed
- [ ] N+1 query problems eliminated
- [ ] Unnecessary joins avoided
- [ ] Subqueries optimized
- [ ] Query result caching implemented
- [ ] Query timeout configured
- [ ] Explain/analyze used for optimization
- [ ] Query patterns documented

## Stored Procedures & Functions

- [ ] Stored procedures used appropriately
- [ ] Procedure/function naming consistent
- [ ] Input validation in procedures
- [ ] Error handling in procedures
- [ ] Procedures documented
- [ ] Procedures versioned with schema
- [ ] Security context appropriate (SECURITY DEFINER/INVOKER)
- [ ] Procedures tested

## Views

- [ ] Views used for complex queries
- [ ] View naming consistent
- [ ] Views documented
- [ ] Materialized views for expensive queries
- [ ] View refresh strategy defined
- [ ] View permissions configured
- [ ] Views don't hide performance issues

## Migrations

- [ ] Migration system in place (Flyway, Liquibase, etc.)
- [ ] Migrations version controlled
- [ ] Migrations tested before production
- [ ] Rollback procedures defined
- [ ] Migration naming convention followed
- [ ] Migrations idempotent where possible
- [ ] Data migrations handled carefully
- [ ] Migration history tracked
- [ ] Schema changes backward compatible

## Connection Management

- [ ] Connection pooling configured
- [ ] Pool size appropriate for load
- [ ] Connection timeout configured
- [ ] Idle connection timeout set
- [ ] Connection leaks prevented
- [ ] Connection limits monitored
- [ ] Connection errors logged

## Performance Monitoring

- [ ] Query performance monitored
- [ ] Slow query log enabled
- [ ] Query execution times tracked
- [ ] Database metrics collected (CPU, memory, I/O)
- [ ] Connection pool metrics tracked
- [ ] Lock contention monitored
- [ ] Deadlocks tracked and analyzed
- [ ] Performance baselines established

## Backup & Recovery

- [ ] Automated backups configured
- [ ] Backup frequency appropriate
- [ ] Backup retention policy defined
- [ ] Backups tested regularly
- [ ] Point-in-time recovery possible
- [ ] Backup encryption enabled
- [ ] Backup storage secured
- [ ] Disaster recovery plan documented
- [ ] RTO and RPO defined
- [ ] Backup monitoring and alerting

## Security

- [ ] Database user permissions follow least privilege
- [ ] No shared database accounts
- [ ] Application uses dedicated database user
- [ ] Admin access restricted
- [ ] SQL injection prevented (parameterized queries)
- [ ] Sensitive data encrypted at rest
- [ ] Connections encrypted (TLS/SSL)
- [ ] Database audit logging enabled
- [ ] Privileged operations logged
- [ ] Database firewall rules configured

## Data Privacy

- [ ] PII identified and protected
- [ ] Data masking in non-production environments
- [ ] Data retention policies implemented
- [ ] Data deletion procedures exist
- [ ] Right to be forgotten implemented (GDPR)
- [ ] Data access logged for compliance
- [ ] Data export capabilities exist
- [ ] Privacy by design principles followed

## Replication

- [ ] Replication configured for high availability
- [ ] Read replicas for read-heavy workloads
- [ ] Replication lag monitored
- [ ] Failover procedures documented
- [ ] Automatic failover configured (if appropriate)
- [ ] Replication conflicts handled
- [ ] Replica consistency validated

## Partitioning

- [ ] Large tables partitioned appropriately
- [ ] Partition strategy appropriate (range, list, hash)
- [ ] Partition maintenance automated
- [ ] Old partitions archived/dropped
- [ ] Query performance improved by partitioning
- [ ] Partition pruning working correctly

## Sharding (if applicable)

- [ ] Sharding strategy defined
- [ ] Shard key chosen appropriately
- [ ] Cross-shard queries minimized
- [ ] Shard rebalancing strategy exists
- [ ] Distributed transactions handled
- [ ] Shard failures handled gracefully

## Transaction Management

- [ ] Transaction isolation level appropriate
- [ ] Transactions kept short
- [ ] Long-running transactions avoided
- [ ] Nested transactions handled correctly
- [ ] Savepoints used appropriately
- [ ] Transaction rollback tested
- [ ] Deadlock handling implemented

## Data Types

- [ ] Appropriate data types used
- [ ] VARCHAR lengths appropriate
- [ ] TEXT used for long strings
- [ ] DECIMAL used for money (not FLOAT)
- [ ] TIMESTAMP with timezone for dates
- [ ] UUID vs INT for primary keys justified
- [ ] ENUM vs VARCHAR evaluated
- [ ] JSON/JSONB used appropriately
- [ ] Array types used appropriately

## Normalization

- [ ] Schema normalized to reduce redundancy
- [ ] Denormalization justified for performance
- [ ] No repeating groups
- [ ] No transitive dependencies
- [ ] Update anomalies prevented
- [ ] Normalization level appropriate (1NF, 2NF, 3NF)

## Data Consistency

- [ ] Referential integrity maintained
- [ ] Data validation at insert/update
- [ ] Constraint violations handled
- [ ] Data cleanup procedures exist
- [ ] Orphaned records identified and removed
- [ ] Data quality checks automated
- [ ] Inconsistencies logged and alerted

## Capacity Planning

- [ ] Database growth rate tracked
- [ ] Storage capacity monitored
- [ ] Capacity alerts configured
- [ ] Scaling strategy defined
- [ ] Archive strategy for old data
- [ ] Table bloat monitored
- [ ] Vacuum/analyze scheduled (PostgreSQL)

## Testing

- [ ] Database tests exist
- [ ] Migration tests automated
- [ ] Test database mirrors production schema
- [ ] Test data generation automated
- [ ] Performance tests include database
- [ ] Rollback procedures tested
- [ ] Backup restoration tested

## Documentation

- [ ] Schema documented (ER diagrams)
- [ ] Table purposes documented
- [ ] Column purposes documented
- [ ] Relationships documented
- [ ] Migration history documented
- [ ] Backup procedures documented
- [ ] Disaster recovery procedures documented
- [ ] Query optimization guidelines documented

## DynamoDB Specific (if applicable)

- [ ] Partition key distributes load evenly
- [ ] Sort key supports access patterns
- [ ] GSI/LSI used appropriately
- [ ] Hot partition avoidance
- [ ] Capacity mode appropriate (on-demand vs provisioned)
- [ ] Auto-scaling configured (provisioned mode)
- [ ] Point-in-time recovery enabled
- [ ] DynamoDB Streams for change capture
- [ ] Item size within limits (<400KB)
- [ ] Batch operations used where appropriate

## PostgreSQL Specific (if applicable)

- [ ] Vacuum and analyze scheduled
- [ ] Extensions used appropriately
- [ ] JSONB indexed correctly (GIN indexes)
- [ ] Full-text search configured
- [ ] Partitioning using declarative syntax
- [ ] Parallel query execution enabled
- [ ] Statistics configured appropriately

## MySQL/MariaDB Specific (if applicable)

- [ ] InnoDB engine used for transactional tables
- [ ] Character set UTF-8 (utf8mb4)
- [ ] Query cache evaluated (deprecated in MySQL 8.0)
- [ ] Binary logging enabled for replication
- [ ] Slow query log enabled
- [ ] Table statistics updated

## NoSQL Specific (if applicable)

- [ ] Data model fits NoSQL paradigm
- [ ] Access patterns designed upfront
- [ ] Denormalization strategy defined
- [ ] Consistency model appropriate
- [ ] Indexing strategy defined
- [ ] Query patterns optimized

## Review & Audit

**Date:** ___________  
**Auditor:** ___________  
**Status:** ⬜ Pass ⬜ Pass with Issues ⬜ Fail  
**Next Review:** ___________  

**Database Statistics:**
- Total Tables: _____
- Database Size: _____ GB
- Average Query Time: _____ ms
- Slow Queries: _____
- Index Usage: _____%

**Issues Found:**
- 

**Recommendations:**
- 

**Action Items:**
- 
