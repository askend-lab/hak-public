# ADR 002: Serverless Architecture on AWS

**Status:** Accepted  
**Date:** 2024-12

## Context

We needed a hosting strategy for multiple backend services (REST APIs, audio processing, TTS synthesis) with variable load and minimal operational overhead.

## Decision

Use **AWS Lambda** for APIs and processing, with **DynamoDB** for storage, **S3** for static files and audio, and **API Gateway** as the entry point. Infrastructure managed with **Terraform**.

## Consequences

- **Positive:** No server management, auto-scaling, pay-per-use
- **Positive:** Each service deploys independently
- **Positive:** Terraform provides reproducible infrastructure
- **Negative:** Cold starts affect latency (mitigated with provisioned concurrency for critical paths)
- **Negative:** Merlin TTS worker needs Docker/ECS due to large model size and long processing time
- **Negative:** Local development requires DynamoDB Local or localstack
