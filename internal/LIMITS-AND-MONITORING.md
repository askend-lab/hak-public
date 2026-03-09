# HAK Platform — Limits, Thresholds & Monitoring Registry

**Version:** 1.0
**Date:** 2026-03-09
**Author:** Kate (Askend-lab Development Team)
**Purpose:** Single source of truth for every hardcoded limit, scaling threshold, alarm trigger, and monitoring setting in the system.

---

## 1. WAF (CloudFront Level)

All WAF rules are in `infra/waf.tf`. Scope: CLOUDFRONT (us-east-1).

| Rule | Priority | Type | Limit | Action | Metric Name |
|------|----------|------|-------|--------|-------------|
| Per-IP general | 1 | Rate-based (IP) | **2000 req / 5 min** | BLOCK → 429 | `hak-{env}-rate-limit` |
| Per-IP /synthesize | 2 | Rate-based (IP) + path scope | **200 req / 5 min** | BLOCK → 429 | `hak-{env}-rate-limit-synthesize` |
| Geo-block /synthesize | 3 | Geo-match + path scope | Baltic/Nordic only | BLOCK → 403 | `hak-{env}-geo-restrict-synthesize` |
| Per-user /synthesize | 5 | Rate-based (Authorization header) | **10 req / 2 min** (5/min) | BLOCK → 429 | `hak-{env}-rate-limit-per-user-synthesize` |
| Per-user /analyze, /variants | 6 | Rate-based (Authorization header) | **20 req / 1 min** | BLOCK → 429 | `hak-{env}-rate-limit-per-user-morphology` |
| Per-user /status | 7 | Rate-based (Authorization header) | **100 req / 1 min** | BLOCK → 429 | `hak-{env}-rate-limit-per-user-status` |
| AWS Managed Common Rules | 10 | Managed rule group | AWSManagedRulesCommonRuleSet | override: none | `hak-{env}-common-rules` |

**Allowed countries (Rule 3):** EE, LV, LT, FI, SE, DE, PL, NO, DK

**⚠️ Assessment:**
- Rule 1 (2000/5min = 400/min): Very high. 1 worker processes ~12 gen/min. 400/min is 33× throughput.
- Rule 2 (200/5min = 40/min for /synthesize): Still high. 1 worker = 12/min. This allows 3.3× throughput per IP.

**WAF Logging:** `aws-waf-logs-hak-{env}`, retention **90 days**, logs only BLOCK + COUNT actions.

---

## 2. Per-User Rate Limits

**✅ IMPLEMENTED** via AWS WAF custom aggregate keys on `Authorization` header (`infra/waf.tf`).

| Operation | Limit | WAF Rule | Window | Effective | Source |
|-----------|-------|----------|--------|-----------|--------|
| Synthesis (/synthesize) | 10 req | Rule 5 (`rate-limit-per-user-synthesize`) | **2 min** | **5/min** | SLA §5.1 |
| Morphology (/analyze, /variants) | 20 req | Rule 6 (`rate-limit-per-user-morphology`) | **1 min** | **20/min** | SLA §5.1 |
| Status polling (/status) | 100 req | Rule 7 (`rate-limit-per-user-status`) | **1 min** | **100/min** | SLA §5.1 |

**How it works:** WAF aggregates requests by the `Authorization` header value (JWT token). Each unique token = separate rate limit bucket. When exceeded → **429** with JSON body `{"error":"RATE_LIMIT","message":"Too many requests"}`.

**Note:** WAF minimum rate limit is 10 per evaluation window. Synthesis uses 10 req/2min = 5/min effective.
JWT refresh (~1hr) resets the bucket — acceptable for 1-minute windows.

---

## 3. Lambda Concurrency

From `serverless.yml` files. `reservedConcurrency` = hard cap on simultaneous Lambda invocations.

| Service | Function | Dev | Prod | File |
|---------|----------|-----|------|------|
| **TTS API** (merlin-api) | synthesize | null (unlimited) | **25** | `packages/tts-api/serverless.yml:95` |
| **TTS API** (merlin-api) | status | null | **25** | `packages/tts-api/serverless.yml:106` |
| **TTS API** (merlin-api) | health | null | **5** | `packages/tts-api/serverless.yml:117` |
| **Morphology API** (vabamorf-api) | api | null | **25** | `packages/morphology-api/serverless.yml:67` |
| **Store API** (simplestore) | api | null | **50** | `packages/store/serverless.yml:65` |
| **Auth** (tara-auth) | func (all auth handlers) | null | **10** | `packages/auth/serverless.yml:89,98,107,129` |
| **Auth** (tara-auth) | health | null | **5** | `packages/auth/serverless.yml:120` |

**Note:** Dev has no concurrency limits (null = AWS account default, typically 1000 total).

---

## 4. Lambda Timeouts & Memory

| Service | Function | Timeout | Memory | File |
|---------|----------|---------|--------|------|
| **TTS API** | synthesize | **30s** | 128 (default) | `packages/tts-api/serverless.yml:94` |
| **TTS API** | status | **10s** | 128 (default) | `packages/tts-api/serverless.yml:105` |
| **TTS API** | health | **5s** | 128 (default) | `packages/tts-api/serverless.yml:116` |
| **Morphology API** | api | **30s** | **1024 MB** | `packages/morphology-api/serverless.yml:66,68` |
| **Store API** | api | **10s** | **512 MB** | `packages/store/serverless.yml:29-30` |
| **Auth** | all handlers | **15s** | 128 (default) | `packages/auth/serverless.yml:34` |

---

## 5. SQS Queue (TTS Synthesis)

From `infra/merlin/main.tf` and `packages/tts-api/src/sqs.ts`.

| Parameter | Value | Source |
|-----------|-------|--------|
| Queue name | `hak-merlin-{env}-queue` | `infra/merlin/main.tf:43` |
| **Max queue depth (app-level)** | **50 messages → 503** | `packages/tts-api/src/sqs.ts:15` (`MAX_QUEUE_DEPTH`) |
| Visibility timeout | **300s** (5 min) | `infra/merlin/main.tf:46` |
| Message retention | **86400s** (1 day) | `infra/merlin/main.tf:47` |
| Long polling wait | **20s** | `infra/merlin/main.tf:48` |
| Max receive count (→ DLQ) | **3** | `infra/merlin/main.tf:52` |
| DLQ retention | **1209600s** (14 days) | `infra/merlin/main.tf:38` |

**⚠️ Assessment:** MAX_QUEUE_DEPTH=50 is very high. 1 worker at 12 gen/min would take ~4 min to drain 50 messages. With 3 workers, ~1.4 min. But 50 queued = users waiting 1-4 minutes.

---

## 6. ECS Auto-Scaling (Merlin Workers)

From `infra/merlin/main.tf` and `infra/merlin/variables.tf`.

| Parameter | Value | Source |
|-----------|-------|--------|
| Min workers (prod) | **1** | `main.tf:377` |
| Min workers (dev) | **0** (disabled, uses prod) | `main.tf:377` |
| **Max workers** | **3** | `variables.tf:29` (`ecs_max_capacity`) |
| Scale-out target | **3 messages/worker** | `main.tf:394` |
| Scale-out cooldown | **30s** | `main.tf:408` |
| Scale-in cooldown | **600s** (10 min) | `main.tf:407` |
| CPU per task | **1024** (1 vCPU) | `variables.tf:34` (`merlin_cpu`) |
| Memory per task | **4096 MB** (4 GB) | `variables.tf:40` (`merlin_memory`) |
| Capacity provider | FARGATE_SPOT (100%) | `main.tf:186` |

**Scaling triggers:**
- Queue depth ≥ 3 per worker → add worker (30s cooldown)
- Queue idle → remove worker (10 min cooldown)
- At max capacity (3 workers): alarm triggers

**Throughput per worker:** ~12 gen/min (~5s per word, single-threaded model)

| Workers | Capacity | Concurrent Teachers |
|---------|----------|---------------------|
| 1 | 12 gen/min | 1–2 |
| 2 | 24 gen/min | 2–4 |
| 3 | 36 gen/min | 4–6 |

---

## 7. Application-Level Input Limits

### 7.1 TTS API

From `packages/tts-api/src/schemas.ts` and `packages/tts-api/src/handler.ts`.

| Parameter | Value | Source |
|-----------|-------|--------|
| **Max text length** | **100 characters** | `schemas.ts:6` (`MAX_TEXT_LENGTH`) |
| Min text length | 2 characters | `schemas.ts:14` |
| **Max request body** | **10 KB** (10,240 bytes) | `handler.ts:51` (`MAX_BODY_SIZE`) |
| Speed range | 0.5 – 2.0 | `schemas.ts:7` (`SPEED_RANGE`) |
| Pitch range | -500 – 500 (int) | `schemas.ts:8` (`PITCH_RANGE`) |
| Cache key format | SHA-256 hex (64 chars) | `schemas.ts:31` |

### 7.2 Morphology API

From `packages/morphology-api/src/schemas.ts` and `packages/morphology-api/src/vmetajson.ts`.

| Parameter | Value | Source |
|-----------|-------|--------|
| **Max text length** | **10,000 characters** | `schemas.ts:6` (`MAX_TEXT_LENGTH`) |
| **Vmetajson queue size** | **50 requests** | `vmetajson.ts:22` (`MAX_QUEUE_SIZE`) |
| **Vmetajson timeout** | **5000ms** (env: `VMETAJSON_TIMEOUT_MS`) | `vmetajson.ts:25` (`TIMEOUT_MS`) |

### 7.3 Store API

From `packages/store/src/core/types.ts` and `packages/store/src/core/validation.ts`.

| Parameter | Value | Source |
|-----------|-------|--------|
| **Max data size per item** | **350,000 bytes** (350 KB) | `types.ts:85` (`MAX_DATA_SIZE_BYTES`) |
| Max TTL | **31,536,000s** (1 year) | `types.ts:81` (`MAX_TTL_SECONDS`) |
| **Max query items** | **100** | `types.ts:88` (`MAX_QUERY_ITEMS`) |
| Max key length | **1024 characters** | `validation.ts:19` (`MAX_KEY_LENGTH`) |
| Key charset | `[a-zA-Z0-9._\-:@]` | `validation.ts:20` |
| Key delimiter | `#` | `types.ts:93` |
| **Max request body** | **400,000 bytes** (400 KB) | `lambda/handler.ts:99` (`MAX_BODY_SIZE`) |
| DynamoDB billing | PAY_PER_REQUEST (on-demand) | `store/serverless.yml:114` |
| DynamoDB PITR | Enabled | `store/serverless.yml:129` |

---

## 8. Frontend Polling

From `packages/frontend/src/features/synthesis/utils/synthesize.ts`.

| Parameter | Value | Source |
|-----------|-------|--------|
| **Poll interval (base)** | **2000ms** | `synthesize.ts:22` (`POLL_INTERVAL_MS`) |
| **Max poll attempts** | **30** | `synthesize.ts:23` (`MAX_POLL_ATTEMPTS`) |
| Polling backoff | exponential, capped at **8000ms** | `synthesize.ts:42-44` (`getPollingDelay`) |
| Max poll duration | ~90s (30 × avg 3s) | calculated |

---

## 9. CloudWatch Alarms

All alarms in `infra/cloudwatch-alarms.tf`. SNS topic: `hak-alerts-{env}` → Slack.

### 9.1 API Gateway Errors

| Alarm | Metric | Period | Threshold | Eval Periods | Scope |
|-------|--------|--------|-----------|--------------|-------|
| API 5XX (store) | 5XXError | 60s | **> 0** | 1 | simplestore |
| API 4XX (store) | 4XXError | 300s | **> 10** | 1 | simplestore |
| API high latency (store) | Latency p99 | 300s | **> 5000ms** | 3 | simplestore |
| TTS API 5XX | 5xx | 60s | **> 0** | 1 | merlin-api |
| Auth API 5XX | 5XXError | 60s | **> 0** | 1 | tara-auth |
| Morphology API 5XX | 5XXError | 60s | **> 0** | 1 | vabamorf-api |

### 9.2 Lambda Errors

| Alarm | Period | Threshold | Eval Periods | Function |
|-------|--------|-----------|--------------|----------|
| Store Lambda errors | 300s | **> 3** | 2 | simplestore-{env}-api |
| TTS synthesize errors | 300s | **> 0** | 1 | merlin-api-{env}-synthesize |
| TTS status errors | 300s | **> 0** | 1 | merlin-api-{env}-status |
| Auth errors (×4) | 300s | **> 0** | 2 | tara-auth-{env}-{handler} |
| Morphology errors | 300s | **> 0** | 1 | vabamorf-api-{env}-api |
| Slack notifier errors | 300s | **> 0** | 1 | hak-slack-notifier-{env} |

### 9.3 Synthesis Pipeline

| Alarm | Metric | Period | Threshold | Description |
|-------|--------|--------|-----------|-------------|
| DLQ depth | ApproximateNumberOfMessagesVisible | 60s | **> 0** | Failed audio generation |
| SQS age | ApproximateAgeOfOldestMessage | 60s | **> 300s** (5 min) | Worker not processing |
| SQS depth | ApproximateNumberOfMessagesVisible | 60s | **> 50** | Possible abuse / stuck workers |
| ECS zero tasks (prod) | RunningTaskCount | 300s | **< 1** | No workers running |
| ECS high tasks | RunningTaskCount | 300s | **≥ 3** | At max capacity |

### 9.4 Infrastructure

| Alarm | Metric | Period | Threshold |
|-------|--------|--------|-----------|
| DynamoDB throttling | ThrottledRequests | 300s | **> 1** |
| WAF blocked high | BlockedRequests | 300s | **> 100** |

---

## 10. Budget & Cost

From `infra/budgets.tf` and `infra/variables.tf`.

| Parameter | Value | Source |
|-----------|-------|--------|
| Monthly budget | **$100 USD** | `variables.tf:51` (`monthly_budget_limit`) |
| Alert at 70% | $70 | `budgets.tf:20` |
| Alert at 90% | $90 | `budgets.tf:29` |
| Alert at 100% | $100 | `budgets.tf:37` |
| Forecasted > 100% | alert | `budgets.tf:46` |

---

## 11. Log Retention & Data Lifecycle

| Resource | Retention | Source |
|----------|-----------|--------|
| Lambda logs (all services) | **30 days** | `serverless.yml` (`logRetentionInDays: 30`) |
| ECS worker logs | **90 days** | `infra/merlin/main.tf:286` |
| WAF logs | **90 days** | `infra/waf.tf:167` |
| CloudTrail logs | **365 days** (90d → STANDARD_IA) | `infra/cloudtrail.tf:41,45` |
| Audio cache (S3) | **30 days** (cache/ prefix) | `infra/merlin/main.tf:80` |
| SQS messages | **1 day** | `infra/merlin/main.tf:47` |
| SQS DLQ messages | **14 days** | `infra/merlin/main.tf:38` |
| DynamoDB TTL | Per-item (max 1 year) | `store/serverless.yml:126` |

---

## 12. CloudFront Cache

From `infra/cloudfront.tf`.

| Behavior | min_ttl | default_ttl | max_ttl |
|----------|---------|-------------|---------|
| API routes (all `/api/*`, `/auth/*`) | 0 | 0 | **0** (no caching) |
| Static assets (default) | 0 | **3600s** (1h) | **86400s** (24h) |
| SPA 404 fallback | 0 | — | — |

---

## 13. Authentication

| Parameter | Value | Source |
|-----------|-------|--------|
| JWT Authorizer (TTS) | Cognito, `$request.header.Authorization` | `tts-api/serverless.yml:38-44` |
| JWT Authorizer (Morphology) | Cognito, `$request.header.Authorization` | `morphology-api/serverless.yml:23-29` |
| Cognito Authorizer (Store) | COGNITO_USER_POOLS (REST API) | `store/serverless.yml:71-73` |
| Open endpoints | `/health` (all), `/get-shared`, `/get-public`, `/auth/tara/*` | various |

---

## 14. Summary: What Needs Attention

| # | Issue | Current | Recommended | Priority |
|---|-------|---------|-------------|----------|
| 1 | ~~Per-user rate limits not implemented~~ | ✅ WAF Rules 5-7 | 5/min synth, 20/min morph, 100/min status | ✅ Done |
| 2 | WAF general rate too high | 2000/5min (400/min) | Consider 500/5min (100/min) | 🟡 Medium |
| 3 | WAF /synthesize rate too high | 200/5min (40/min) | Consider 50/5min (10/min) matches per-user | 🟡 Medium |
| 4 | SQS queue depth cap too high | 50 | Consider 20 | 🟡 Medium |
| 5 | ~~SLA §5.1 values outdated~~ | ✅ WAF enforces 5/min | SLA values match WAF rules | ✅ Done |
