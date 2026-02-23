# Proposal: Securing Public API Endpoints with Authentication

**Date:** 2026-02-22 (updated 2026-02-23)
**Author:** Bob (Askend-lab Development Team), reviewed by Kate
**Status:** Revised draft for client discussion

---

## 1. Current Situation

### 1.1 System Overview

HAK is an Estonian language learning platform. Teachers create interactive lessons with text-to-speech (TTS) audio, and students complete them. The system runs on AWS with a serverless architecture.

Key components in scope:

- **TTS API** (`/synthesize`) — accepts text, queues a speech synthesis task, returns a tracking key
- **TTS API** (`/status/{cacheKey}`) — allows tracking audio file readiness
- **Morphology API** (`/analyze`, `/variants`) — Estonian morphological analysis (stress patterns, pronunciation variants)
- **TTS Worker** — speech synthesis engine (Docker container on AWS ECS Fargate), processes tasks from queue

### 1.2 How It Works Today

All listed endpoints are **fully open** — anyone on the internet can access them without any authentication. This was a deliberate decision during development, driven by the client's requirement: speech synthesis should work without login.

Current configuration:

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/synthesize` | POST | **None** | Request speech synthesis |
| `/status/{cacheKey}` | GET | **None** | Check synthesis status |
| `/analyze` | POST | **None** | Morphological text analysis |
| `/variants` | POST | **None** | Word pronunciation variants |

Meanwhile, the system **already has a fully implemented** authentication infrastructure:

- AWS Cognito (User Pool) — fully configured and operational
- TARA (Estonian eID) — integration with ID-card, Mobile-ID, Smart-ID
- Social login via Cognito Hosted UI
- JWT tokens, refresh tokens in httpOnly cookies
- API Gateway authorizer for protected endpoints (SimpleStore already uses it)

In other words: **all technical infrastructure for authentication already exists and works** — it is simply not applied to the speech synthesis and morphology endpoints.

---

## 2. Existing Security Mechanisms and Their Limits

### 2.1 What Is Currently Configured

| Protection Layer | Mechanism | Parameters |
|-----------------|-----------|------------|
| **Network** | AWS CloudFront | All traffic goes through CDN, no direct API Gateway access |
| **Firewall** | AWS WAF v2 | General per-IP rate limiting: 100 requests / 5 minutes per IP |
| **Firewall** | AWS WAF v2 | Per-path rate limit for `/api/synthesize`: 20 requests / 5 minutes per IP |
| **Firewall** | AWS WAF v2 | Geo-blocking on `/api/synthesize`: only EE, LV, LT, FI, SE, DE, PL, NO, DK |
| **Firewall** | AWS Managed Rules | Protection against SQL injection, XSS, and common attack vectors |
| **Application** | Input validation | Text <= 100 chars, body <= 10 KB, Zod schemas |
| **Application** | SQS queue depth cap | Queue > 50 messages → 503 Service Unavailable |
| **Application** | Cache-first architecture | Repeated request with same text served from S3 without new synthesis |
| **Infrastructure** | ECS max capacity | Hard cap on concurrent TTS workers via auto-scaling `max_capacity` |
| **Infrastructure** | AWS Budgets | Alerts at 70%, 90%, 100% thresholds via SNS |
| **Monitoring** | CloudWatch Alarms | SQS queue depth, ECS task count, WAF blocks, API errors, Lambda errors, latency |
| **CORS** | Origin restriction | Only `hak-dev.*.com` and `hak.*.com` domains |
| **Monitoring** | CloudWatch Logs | WAF logs (BLOCK + COUNT), 90-day retention |

### 2.2 Why This Is Not Enough

All listed mechanisms are **rate limits**, not **access controls**. They slow down an attacker but do not stop them. Issues:

1. **WAF per-IP limit is bypassable** — an attacker with a proxy pool or botnet gets 100 requests per IP (or 20 per IP for `/synthesize`). 10 IP addresses = 200 synthesize requests in 5 minutes. VPN services, TOR, and cloud providers offer thousands of IP addresses.

2. **Geo-blocking is imprecise** — legitimate users traveling abroad are blocked; attackers in allowed countries are not. Geo-blocking reduces attack surface but is not access control.

3. **CORS does not protect against server-side requests** — CORS only works in browsers. Any script, curl command, or server-side code bypasses CORS entirely.

4. **Cache does not help with unique requests** — cache deduplication is effective only if the attacker sends **identical** text. Generating random text (up to 100 characters) each time bypasses the cache and triggers a full synthesis cycle.

5. **Queue depth cap is reactive** — the SQS queue depth cap (50 messages → 503) prevents unlimited accumulation but still allows 50 synthesis tasks per burst. This is damage limitation, not prevention.

### 2.3 Additional Measures Required If Public Access Is Retained

Many protective measures have already been implemented (see Section 2.1 and Appendix A). However, all of them are **reactive** — they limit damage after an attack starts, but cannot prevent unauthorized access. Additional measures still needed without auth include: anomaly detection with auto-ban, bot-detection/proof-of-work, request fingerprinting, and comprehensive load/attack testing (see Appendix A).

For comparison: adding authentication is significantly less work and solves most of these problems at the root — by ensuring only registered users can access the endpoints.

---

## 3. Threat Scenarios

### Scenario A: Cost Exhaustion Attack

**Mechanism:** An attacker sends a continuous stream of requests with unique text. Each request enters SQS, triggers synthesis on ECS Fargate (~5 seconds CPU), and the result is stored in S3.

**Calculation at current limits:**

| Parameter | Value |
|-----------|-------|
| WAF rate limit for `/synthesize` | 20 req / 5 min per IP |
| SQS queue depth cap | 50 messages (then 503) |
| Requests per hour (single IP) | up to 240 |
| Requests per hour (10 IPs via proxy) | up to 2,400 |
| Synthesis time per request | ~5 sec |
| Throughput of 1 worker | ~720 requests/hour |
| Fargate (1 vCPU, 4GB) | ~$0.05/hour |
| Fargate 24/7 per month | ~$36 |

With current WAF limits, a single IP can trigger 240 synthesis requests per hour. A proxy pool of 10 IPs raises this to 2,400/hour. ECS max capacity caps the workers, but the queue fills and legitimate users get 503 errors.

With a budget of <= EUR 100/month — **a coordinated bot attack from multiple IPs can still exhaust the monthly budget and degrade service for real users**.

### Scenario B: Denial of Service

**Mechanism:** If we set strict limits to protect the budget (e.g., max 1 worker, strict throttle), then:

- Under a request flood (even legitimate), the SQS queue grows
- Synthesis wait time increases from seconds to minutes
- Users see endless "loading..." or timeouts
- **Service quality degrades**

**Dilemma:** we are forced to choose between:
- **Allow auto-scaling** -> budget at risk
- **Restrict auto-scaling** -> service quality at risk

With authentication, this dilemma disappears: we know who is making the request and can apply **per-user limits** without affecting others.

### Scenario C: Resource Abuse

**Mechanism:** A public TTS service can be used by third parties for their own purposes: generating voiceovers for videos, podcasts, bots, commercial products. This is legitimate API usage that is impossible to distinguish from normal use without authentication.

The contractor (our team) is responsible for system operation for one year. The AWS budget is finite. Resource usage by third parties is direct financial damage to the project.

---

## 4. Proposal: Secure Endpoints with Authentication

### 4.1 Summary

Move endpoints `/synthesize`, `/status/{cacheKey}`, `/analyze`, and `/variants` behind authentication via the existing AWS Cognito. The user must log in once, after which they receive an access token used with every API request.

### 4.2 Technical Implementation

All components **already exist** in the system:

| Component | Status | Action Required |
|-----------|--------|------------------|
| AWS Cognito User Pool | ✅ Working | None |
| TARA (Estonian eID) | ✅ Working | None |
| Social login | ✅ Working | None |
| JWT tokens + refresh | ✅ Working | None |
| API Gateway authorizer | ✅ Working (SimpleStore uses REST API v1 + Cognito User Pools) | Add JWT authorizer for tts-api and morphology-api (HTTP API v2) |
| Frontend LoginModal | ✅ Working | None |
| Frontend Bearer token for `/synthesize` | ✅ Already sends `Authorization: Bearer` | None (backend currently ignores it) |
| Frontend Bearer token for `/analyze`, `/variants` | ❌ Not implemented | Add `Authorization: Bearer` header to morphology requests |

**Scope of work:**

1. **Backend (tts-api):** Add JWT authorizer in `serverless.yml` for HTTP API v2. Note: tts-api uses `httpApi` (API Gateway v2), which requires a JWT authorizer configuration — different from SimpleStore's REST API v1 Cognito User Pools authorizer. The `AuthorizationType: NONE` override in CloudFormation resources must also be removed.
2. **Backend (morphology-api):** Same JWT authorizer setup for HTTP API v2.
3. **Frontend:** Add `Authorization: Bearer` header to morphology API requests (`/analyze`, `/variants`). The synthesis path already sends the token.
4. **Shared access:** Users accessing shared lesson links will need to log in. S3 audio files (already generated) remain publicly accessible — no auth required for playback.

The scope of changes is small but not trivial — the HTTP API v2 JWT authorizer setup differs from the existing REST API v1 pattern in SimpleStore.

### 4.3 Impact on User Experience

- User logs in **once** via TARA (ID-card, Smart-ID, Mobile-ID) or via email/password
- Access token lives for 1 hour, then automatically refreshes via refresh token (httpOnly cookie)
- Refresh token has a long lifetime — user may not need to log in again for months
- **From the user's perspective:** log in once — and everything works as before

Important: the system already has protected endpoints (SimpleStore: `/save`, `/get`, `/delete`, `/query`). Teachers and students **already log in** to work with lessons. Adding authentication to TTS and morphology is extending the existing model, not a new requirement.

### 4.4 What This Achieves

| Before (current) | After (with auth) |
|-------------------|-------------------|
| Anyone on the internet can generate speech | Only registered users |
| Rate limit is shared across the entire service | Per-user limits (e.g., 10 requests/minute per user) |
| Impossible to track abuse | Full attribution: who, when, how much |
| Budget is not protected from bots | Strong barrier: TARA (eID) or Google account required (see note below) |
| Cannot block a specific abuser | Can disable a specific user in Cognito |
| Auto-scaling = financial risk | Auto-scaling is safer: load correlates with real users |

**Note on bot protection:** The system uses only TARA (Estonian eID: ID-card, Mobile-ID, Smart-ID) and Google social login — there is no username/password registration. This makes automated account creation extremely difficult: TARA requires physical identity documents, and Google login requires a real Google account with CAPTCHA and anti-bot protections. This is a fundamentally different class of attack compared to bypassing WAF rate limits with a proxy pool. Even if an attacker obtains a valid token, it is traceable to a specific identity and can be individually revoked.

---

## 5. Contractor Responsibility

Our team is responsible for operating the system for one year. Public endpoints create a situation where we **cannot guarantee**:

1. **Cost predictability** — the AWS budget can be exhausted by external factors beyond our control
2. **Service availability** — with strict limits, a bot or traffic spike causes degradation for all users
3. **Quality of service** — without the ability to distinguish users, we cannot prioritize legitimate traffic

With authentication, all three problems are resolved:
- Costs are proportional to the number of real users
- Per-user limits isolate users from each other
- Monitoring and access management become possible

---

## 6. Summary

| Aspect | Current State | With Authentication |
|--------|---------------|---------------------|
| Scope of changes | — | Minimal |
| UX impact | No login | One-time login, then transparent |
| Budget protection | Limited (WAF + queue cap) | Strong (only registered users) |
| Per-user limits | Impossible | Yes |
| Abuser blocking | IP-only | Per-user |
| Monitoring | Anonymous traffic | Per-user attribution |
| SLA guarantees | Questionable | Ensured |

**Recommendation:** Move all speech synthesis and morphological analysis endpoints behind authentication via the existing AWS Cognito. Technical readiness is 100%. Client decision required.

---

*Document prepared based on analysis of the HAK project codebase, security audits (internal and external by Mikk Merimaa), architectural documentation, and current AWS infrastructure configuration.*

---

## Appendix A: Checklist of Mandatory Measures If Public Access Is Retained

If the client decides to keep endpoints open, all items below are mandatory for minimally responsible operation. Without them, we cannot guarantee system reliability and cost predictability.

> **Note (2026-02-23):** Items marked with [x] have already been implemented. Remaining unchecked items represent additional work still required if public access is retained.

### A.1 Cost and Scaling Limits

- [x] **AWS Budgets** (CRITICAL) — ✅ Configured with alerts at 70%, 90%, 100% thresholds via SNS. Note: automatic shutdown (ECS scale-to-zero) is not yet implemented — only alerts.
- [x] **ECS max capacity (Hard Cap)** (CRITICAL) — ✅ `max_capacity` set on ECS auto-scaling target. CloudWatch alarm on high task count.
- [ ] **Lambda concurrency limits** (DEFERRED) — `reservedConcurrentExecutions` was configured but caused deployment failure (AWS requires minimum 10 unreserved concurrency across account). Reverted. Lambda uses default account-level concurrency (1000 shared). With auth, this is less critical.
- [x] **SQS queue depth cap** (HIGH) — ✅ `checkQueueDepth()` checks `ApproximateNumberOfMessagesVisible`, returns 503 when queue > 50 messages. CloudWatch alarm on queue depth.
- [x] **Reduce MAX_TEXT_LENGTH** (HIGH) — ✅ Reduced to 100 characters (tts-api Zod schema + frontend `maxLength={100}`).

### A.2 Monitoring and Attack Detection

- [x] **CloudWatch alerts** (HIGH) — ✅ Alarms configured for: SQS queue depth, ECS task count, WAF blocked requests, API 5xx/4xx errors, Lambda errors, DynamoDB throttling, API latency. All send to SNS.
- [ ] **Anomaly detection + auto-ban** (HIGH) — Detect bot patterns: (1) >20 unique texts from one IP in 10 min, (2) >50% of requests at MAX_TEXT_LENGTH, (3) POST /synthesize without GET /status. Response: temporary IP ban via WAF IP set. Implementation: Lambda + EventBridge cron every 5 min.
- [ ] **Audit and forensics** (MEDIUM) — CloudWatch Logs Insights queries: Top-10 IPs per day, hourly distribution, atypical User-Agents. Saved queries for rapid incident investigation.

### A.3 Attack Surface Reduction

- [x] **Per-path WAF rate limit for /synthesize** (HIGH) — ✅ WAF rule `rate-limit-synthesize`: 20 requests / 5 min per IP for `/api/synthesize`.
- [x] **Geo-blocking** (MEDIUM) — ✅ WAF rule `geo-restrict-synthesize`: `/api/synthesize` restricted to EE, LV, LT, FI, SE, DE, PL, NO, DK.
- [ ] **Bot-detection / Proof-of-Work** (MEDIUM) — Options: honeypot field in form, proof-of-work before request, AWS WAF Bot Control (~$10/month).
- [ ] **Request fingerprinting** (MEDIUM) — Device fingerprint (canvas, screen, timezone) as header + session token with 30 min TTL. Does not replace authentication but allows tracking devices beyond IP.

### A.4 Storage and Lifecycle

- [ ] **S3 audio lifecycle** (LOW) — Ensure audio files are automatically deleted after 30-90 days. Limits storage cost growth.

### A.5 Testing and Verification

- [ ] **Load testing** (CRITICAL) — Normal load script (10 users, 3-5 requests each) and attack script (100+ req/min with unique text). Measure: response time, queue depth, ECS task count, cost.
- [ ] **Auto-scaling testing** (CRITICAL) — Verify ECS max_capacity, behavior at maximum, processing time at full load.
- [ ] **Lambda concurrency testing** (DEFERRED) — reservedConcurrentExecutions was reverted; test if/when re-implemented.
- [ ] **Alert testing** (HIGH) — Simulate each alert, verify Slack delivery. Detection latency < 5 minutes.
- [ ] **Budget limit testing** (HIGH) — Verify AWS Budget alarm triggers + automatic action (reduce ECS count).
- [ ] **SQS queue depth testing** (HIGH) — Fill queue to threshold, verify 503 response. Verify recovery.

**For comparison:** adding authentication via existing Cognito is significantly less work and solves most of the above problems. Some measures (budget alerts, monitoring, ECS cap) are useful even with authentication, but their number and criticality are greatly reduced.
