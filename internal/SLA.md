# HAK Platform — Service Level Agreement (SLA)

**Version:** 0.2 (draft)
**Date:** 2026-03-06
**Author:** Kate (Askend-lab Development Team)
**Status:** Draft for client discussion

---

## Executive Summary

**Platform availability:** 99.5% (max ~3.5 hours downtime/month).

**Audio synthesis:** text → playable audio in under 15 seconds (single user). Up to 2 minutes under peak load (queue wait + worker scale-up).

**All endpoints behind login:** synthesis, morphology, lessons — only for authenticated users via ID-card, Mobile-ID, Smart-ID, or email.

**Per-user limits:** 10 synthesis requests/minute, 120/hour, 1000/day — sufficient for the most intensive lesson preparation.

**Auto-scaling:** system automatically adds workers when load increases (trigger: 3 messages in queue), and removes them when idle. Max 3 concurrent workers.

**Predictable cost:** ~$14/month base (1 worker 24/7). At full load (3 concurrent teachers): ~$42/month. Cost does not depend on number of generations within limits.

**Data durability:** 99.999999999% (AWS DynamoDB + S3). Recovery time <4 hours.

**24/7 monitoring:** 12 automated alarms notify the team in Slack on any issue.

---

## 1. Service Description

HAK is an Estonian language learning platform. The service includes:

| Component | Description |
|-----------|-------------|
| **Web Application** | React SPA served via CloudFront CDN |
| **Store API** | Lesson, user, and progress CRUD (Lambda + DynamoDB) |
| **TTS API** | Text-to-speech synthesis gateway (Lambda + SQS + ECS Fargate) |
| **Morphology API** | Estonian morphological analysis (Lambda + native binary) |
| **Auth** | Authentication via Estonian eID (TARA) and Cognito |

---

## 2. Availability

### 2.1 Target Availability

| Tier | Target | Max Downtime/Month | Scope |
|------|--------|--------------------|-------|
| **Platform** | 99.5% | ~3.6 hours | Web app loads, authenticated endpoints respond |
| **TTS Synthesis** | 99.0% | ~7.3 hours | Audio generation completes within SLA latency |
| **Auth (TARA eID)** | 99.0% | ~7.3 hours | Depends on external TARA service availability |

### 2.2 Exclusions

Downtime caused by the following is excluded from SLA calculations:

- AWS regional outages (us-east-1, eu-west-1)
- TARA (Estonian eID) service outages (external dependency)
- Scheduled maintenance (notified 48 hours in advance)
- Force majeure
- Client-initiated changes that cause failures

### 2.3 Measurement

Availability = (total minutes − downtime minutes) / total minutes × 100%

**Downtime** is defined as: >5% of requests returning 5xx errors over a 5-minute window, as measured by CloudWatch API Gateway metrics.

---

## 3. Latency

### 3.1 Response Time Targets

| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| **Store API** (GET /get, /query) | <200ms | <500ms | <1s |
| **Store API** (POST /save, /delete) | <300ms | <700ms | <1.5s |
| **TTS /synthesize** (cache hit) | <300ms | <500ms | <1s |
| **TTS /synthesize** (cache miss → queued) | <500ms | <1s | <2s |
| **TTS end-to-end** (text → playable audio) | <15s | <30s | <60s |
| **Morphology /analyze, /variants** | <500ms | <1s | <2s |
| **Auth flow** (login → token) | <2s | <5s | <10s |
| **Static assets** (CloudFront) | <100ms | <300ms | <500ms |

### 3.2 TTS Queue Processing

| Metric | Target |
|--------|--------|
| Queue message age | <5 minutes (alarm at 300s) |
| Queue depth | <50 messages (alarm at 50) |
| Dead letter queue | 0 messages (alarm at >0) |

---

## 4. Error Rates

| Metric | Target | Alarm Threshold |
|--------|--------|-----------------|
| API Gateway 5xx rate | <0.1% | >0 per 60s |
| Lambda error rate | <0.5% | >3 per 300s (store), >0 per 300s (TTS, auth, morphology) |
| DynamoDB throttling | 0 | >1 per 300s |

---

## 5. Capacity

### 5.1 Per-User Rate Limits (post-auth)

All limits are per authenticated user (tied to JWT `Authorization` header via AWS WAF custom aggregate keys).

| Operation | Per Minute | Enforcement | WAF Rule |
|-----------|-----------|-------------|----------|
| Synthesis (/synthesize) | **5** | 10 req / 2 min window | Rule 5 (`rate-limit-per-user-synthesize`) |
| Morphology (/analyze, /variants) | **20** | 20 req / 1 min window | Rule 6 (`rate-limit-per-user-morphology`) |
| Status polling (/status) | **100** | 100 req / 1 min window | Rule 7 (`rate-limit-per-user-status`) |

**Enforcement:** AWS WAF rate-based rules with `CUSTOM_KEYS` aggregate on `Authorization` header. When exceeded → HTTP 429 with JSON `{"error":"RATE_LIMIT","message":"Too many requests"}`.

**Rationale:** A teacher preparing lessons generates 3–5 synthesis requests/minute in bursts. 5/min is sufficient for normal use. WAF minimum limit is 10 per evaluation window; synthesis uses 10 req/2min = 5/min effective.

### 5.2 System Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| TTS text input | 100 characters per request | Zod-validated |
| TTS concurrent workers | 3 (ECS max_capacity) | Auto-scales from 1–3 |
| SQS queue depth cap | 50 messages → 503 | Application-level |
| WAF rate limit (general) | 2000 req/5min per IP | CloudFront WAF |
| WAF rate limit (/synthesize) | 200 req/5min per IP | Path-specific rule |
| WAF geo-blocking (/synthesize) | Baltic/Nordic region only | EE, LV, LT, FI, SE, DE, PL, NO, DK |
| DynamoDB | On-demand (auto-scaling) | No pre-provisioned capacity |

### 5.3 Auto-Scaling

| Parameter | Value | Description |
|-----------|-------|-------------|
| Trigger | 3 messages in SQS | Scale out when queue depth ≥3 per worker |
| Scale-out cooldown | 30 seconds | Time before adding another worker |
| Scale-in cooldown | 600 seconds (10 min) | Time before removing idle worker |
| Min workers (prod) | 1 | Always-on baseline |
| Max workers | 3 | Hard cap to control cost |

**Capacity per worker:** ~12 generations/minute (1 generation = ~5 seconds, single-threaded model).

| Workers | Capacity (gen/min) | Concurrent Teachers |
|---------|-------------------|---------------------|
| 1 | 12 | 1–2 |
| 2 | 24 | 2–4 |
| 3 | 36 | 4–6 |

### 5.4 Expected Load (post-auth)

| Metric | Expected | Peak |
|--------|----------|------|
| Concurrent teachers preparing lessons | 1–3 | 6 |
| Synthesis requests/hour | 50–200 | 500 |
| Store API requests/hour | 200–1000 | 3000 |

---

## 6. Data

### 6.1 Durability

| Data Type | Storage | Durability |
|-----------|---------|------------|
| User data, lessons, progress | DynamoDB | 99.999999999% (11 nines, AWS SLA) |
| Audio files | S3 | 99.999999999% (11 nines, AWS SLA) |
| Audit logs | CloudTrail → S3 (Object Lock, 365 days) | Immutable |

### 6.2 Backup & Recovery

| Aspect | Current State |
|--------|---------------|
| DynamoDB backups | Point-in-time recovery (PITR) — TBD |
| S3 versioning | Enabled on website and CloudTrail buckets |
| RTO (Recovery Time Objective) | <4 hours (infrastructure redeployable via Terraform + CI/CD) |
| RPO (Recovery Point Objective) | <1 hour (DynamoDB continuous backup if PITR enabled) |

---

## 7. Security

### 7.1 Commitments

| Control | Status |
|---------|--------|
| HTTPS everywhere (TLS 1.2+) | ✅ Enforced |
| HSTS with preload | ✅ 1 year, includeSubDomains |
| WAF (SQLi, XSS, rate limiting) | ✅ AWS Managed Rules |
| Authentication (Cognito + TARA eID) | ✅ All endpoints (after SEC-01 fix) |
| Secret scanning (gitleaks) | ✅ Pre-commit hook |
| Dependency scanning (pnpm audit + Trivy) | ✅ CI/CD |
| CodeQL SAST | ✅ On every PR |
| GuardDuty threat detection | ✅ S3 data events |
| Audit trail | ✅ CloudTrail with Object Lock |

### 7.2 Incident Response

| Severity | Response Time | Resolution Target |
|----------|---------------|-------------------|
| **Critical** (service down, data breach) | <1 hour | <4 hours |
| **High** (degraded service, security vulnerability) | <4 hours | <24 hours |
| **Medium** (non-critical bug, performance degradation) | <24 hours | <1 week |
| **Low** (cosmetic, minor improvement) | <1 week | Next release |

---

## 8. Monitoring & Alerting

### 8.1 Active Alarms

| Alarm | Severity | Condition |
|-------|----------|-----------|
| API 5xx errors | CRITICAL | >0 in 60s |
| Lambda errors (all services) | CRITICAL | >0 in 300s |
| DLQ depth (failed audio) | CRITICAL | >0 messages |
| SQS message age | CRITICAL | >5 min oldest message |
| SQS queue depth | CRITICAL | >50 messages |
| ECS zero tasks (prod) | CRITICAL | <1 running task |
| DynamoDB throttling | WARNING | >1 in 300s |
| API high latency | WARNING | p99 >5s over 3 periods |
| WAF blocked requests | WARNING | >100 in 300s |
| ECS high tasks | WARNING | ≥3 (max capacity) |
| API 4xx errors | WARNING | >10 in 300s |
| Slack notifier errors | CRITICAL | >0 (meta-monitoring) |

### 8.2 Alert Channel

All alarms → SNS → Slack notification Lambda → Slack channel.

CloudWatch Dashboard: `hak-activity-{env}` with real-time metrics for all services.

---

## 9. Maintenance Windows

| Type | Schedule | Notice |
|------|----------|--------|
| Planned maintenance | Weekdays 08:00–10:00 EET | 48 hours advance notice |
| Emergency patches | As needed | Best-effort notification |
| Infrastructure updates (Terraform) | Via CI/CD on merge to main | Automatic |

---

## 10. Support

| Channel | Hours | Response |
|---------|-------|----------|
| Slack (development team) | Business hours (EET) | <4 hours |
| GitHub Issues | Async | <24 hours |
| Critical alerts (automated) | 24/7 | Automatic Slack notification |

---

## 11. Cost Breakdown

### 11.1 Base Cost (always-on)

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| 1 Fargate Spot worker (1 vCPU, 4 GB, 24/7) | ~$14 | Min capacity, runs even with 0 requests |
| DynamoDB (on-demand) | ~$5–10 | Depends on read/write volume |
| Lambda (all functions) | ~$1–3 | Free tier covers most |
| S3 (audio storage) | ~$1–5 | Depends on cache size |
| CloudFront | ~$1–5 | Depends on traffic |
| **Total base** | **~$22–37** | |

### 11.2 Per-Generation Cost

| Resource | Per Generation | Notes |
|----------|---------------|-------|
| Worker time (5 sec Spot) | ~$0.003 | Marginal cost on top of 24/7 worker |
| S3 storage (~1 MB WAV) | ~$0.00002 | |
| SQS message | ~$0.0000004 | |
| Lambda invocation | ~$0.0000002 | |
| **Total per generation** | **~$0.003** | Effectively free on top of base cost |

### 11.3 Scaling Scenarios

| Scenario | Workers | Monthly Cost |
|----------|---------|-------------|
| Idle (no teachers) | 1 | ~$22–37 |
| Normal (1–2 teachers, 500 gen/day) | 1 | ~$22–37 |
| Busy (3–4 teachers, 2000 gen/day) | 1–2 | ~$36–51 |
| Peak (5–6 teachers, 5000 gen/day) | 2–3 | ~$50–65 |

Additional workers spin up automatically and shut down after 10 minutes of idle. Cost increase is ~$14/month per worker if active 24/7, proportionally less for burst usage.

---

## 12. Open Items for Discussion

1. **Availability tier** — 99.5% vs 99.9%? Higher tiers require multi-region setup and significantly increase cost.
2. **TTS end-to-end latency** — 15s target is for warm worker. Cold start (scale-up event) adds 30–60s. Acceptable?
3. **DynamoDB PITR** — enable point-in-time recovery? Adds ~20% to DynamoDB cost.
4. **RTO/RPO targets** — are 4h/1h acceptable or does the client need tighter guarantees?
5. **Per-user limits** — are 10/min, 120/hour, 1000/day appropriate for the expected teacher workflow?
6. **SLA penalties** — does the client expect service credits for SLA breaches? If so, what structure?
7. **Max workers** — 3 workers supports ~6 concurrent teachers. Is this sufficient for launch?
