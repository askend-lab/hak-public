# Proposal: Securing Public API Endpoints with Authentication

**Date:** 2026-02-22
**Author:** Bob (Askend-lab Development Team)
**Status:** Draft for client discussion

---

## 1. Current Situation

### 1.1 System Overview

HAK is an Estonian language learning platform. Teachers create interactive lessons with text-to-speech (TTS) audio, and students complete them. The system runs on AWS with a serverless architecture.

Key components in scope:

- **Merlin API** (`/synthesize`) — accepts text, queues a speech synthesis task, returns a tracking key
- **Merlin API** (`/status/{cacheKey}`) — allows tracking audio file readiness
- **Vabamorf API** (`/analyze`, `/variants`) — Estonian morphological analysis (stress patterns, pronunciation variants)
- **Merlin Worker** — speech synthesis engine (Docker container on AWS ECS Fargate), processes tasks from queue

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
| **Firewall** | AWS WAF v2 | Per-IP rate limiting: 100 requests / 5 minutes per IP |
| **Firewall** | AWS Managed Rules | Protection against SQL injection, XSS, and common attack vectors |
| **API** | API Gateway throttling | Merlin API: 2 req/s, burst 4 |
| **Application** | Input validation | Text <= 1000 chars, body <= 10 KB, Zod schemas |
| **Application** | Cache-first architecture | Repeated request with same text served from S3 without new synthesis |
| **CORS** | Origin restriction | Only `hak-dev.*.com` and `hak.*.com` domains |
| **Monitoring** | CloudWatch | WAF logs (BLOCK + COUNT), 90-day retention |

### 2.2 Why This Is Not Enough

All listed mechanisms are **rate limits**, not **access controls**. They slow down an attacker but do not stop them. Issues:

1. **WAF per-IP limit is bypassable** — an attacker with a proxy pool or botnet gets 100 requests per IP. 10 IP addresses = 1,000 requests in 5 minutes. VPN services, TOR, and cloud providers offer thousands of IP addresses.

2. **API Gateway throttle is shared** — the 2 req/s limit is not per-user. This means a single aggressive client **blocks access for everyone else**. Legitimate users receive 429 (Too Many Requests) errors.

3. **CORS does not protect against server-side requests** — CORS only works in browsers. Any script, curl command, or server-side code bypasses CORS entirely.

4. **Cache does not help with unique requests** — cache deduplication is effective only if the attacker sends **identical** text. Generating random text (up to 1,000 characters) each time bypasses the cache and triggers a full synthesis cycle.

### 2.3 Additional Measures Required If Public Access Is Retained

If the client decides to keep the endpoints open, an extensive list of additional security measures is required: budget limits, scaling caps, anomaly monitoring, geo-blocking, bot-detection, and full testing of all the above (see Appendix A).

For comparison: adding authentication is significantly less work and solves most of these problems.

---

## 3. Threat Scenarios

### Scenario A: Cost Exhaustion Attack

**Mechanism:** An attacker sends a continuous stream of requests with unique text. Each request enters SQS, triggers synthesis on ECS Fargate (~5 seconds CPU), and the result is stored in S3.

**Calculation at current limits:**

| Parameter | Value |
|-----------|-------|
| API Gateway throttle | 2 req/s |
| Requests per hour | up to 7,200 |
| Synthesis time per request | ~5 sec |
| Throughput of 1 worker | ~720 requests/hour |
| Fargate (1 vCPU, 4GB) | ~$0.05/hour |
| Fargate 24/7 per month | ~$36 |

With a single worker, attack cost is capped at ~$36/month. **However**: if auto-scaling is enabled (which is required for normal operation with multiple users), the system will spin up additional workers.

With 5 concurrent workers: **~$180/month on Fargate alone**, plus SQS, S3, API Gateway.

With a budget of <= EUR 100/month — **a single aggressive bot can exhaust the entire monthly budget within days**.

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
|-----------|--------|-----------------|
| AWS Cognito User Pool | ✅ Working | None |
| TARA (Estonian eID) | ✅ Working | None |
| Social login | ✅ Working | None |
| JWT tokens + refresh | ✅ Working | None |
| API Gateway authorizer | ✅ Working (SimpleStore) | Connect to merlin-api and vabamorf-api |
| Frontend LoginModal | ✅ Working | None |

**Scope of work:** add `AuthorizationType: JWT` in `serverless.yml` for merlin-api and vabamorf-api + ensure the frontend sends the `Authorization: Bearer` header with these requests (the frontend **already** sends this header for synthesis — the code exists, the backend simply ignores it).

The scope of changes is minimal.

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
| Rate limit is shared across the entire service (2 req/s) | Per-user limits (e.g., 10 requests/minute per user) |
| Impossible to track abuse | Full attribution: who, when, how much |
| Budget is not protected from bots | Bots cannot obtain a valid JWT token |
| Cannot block a specific abuser | Can disable a specific user in Cognito |
| Auto-scaling = financial risk | Auto-scaling is safe: load = real users |

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
| Budget protection | Limited (WAF + throttle) | Full (only real users) |
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

### A.1 Cost and Scaling Limits

- [ ] **AWS Budgets + automatic shutdown** (CRITICAL) — Configure AWS Budgets: warning at 70% of budget -> Slack, critical at 90% -> reduce ECS desired count to 0, ceiling at 100% -> disable non-critical services. Without this, a single incident can lead to unlimited expenses.
- [ ] **ECS max capacity (Hard Cap)** (CRITICAL) — Set `max_capacity` on ECS auto-scaling: no more than 2-3 concurrent workers. CloudWatch alarm when maximum is reached. Without a cap, auto-scaling can spin up dozens of workers.
- [ ] **Lambda concurrency limits** (CRITICAL) — Set `reservedConcurrentExecutions: 10-20` for merlin-api and vabamorf-api. Without this, Lambda scales to thousands of concurrent invocations, can exhaust the account-level limit (1000), and block other Lambdas (SimpleStore, tara-auth).
- [ ] **SQS queue depth cap** (HIGH) — Before sending to SQS, check `ApproximateNumberOfMessagesVisible`. If queue has > 50 messages, return 503 Service Unavailable. CloudWatch alarm on queue depth. Prevents accumulation of processing "debt" during an attack.
- [ ] **Reduce MAX_TEXT_LENGTH** (HIGH) — Reduce from 1000 to 100-200 characters (merlin-api Zod schema + worker Python + frontend). Typical sentence for TTS: 50-150 characters. Reduces cost per request.

### A.2 Monitoring and Attack Detection

- [ ] **CloudWatch alerts** (HIGH) — Alerts on: anomalous request growth to `/synthesize` (>50 req/min), SQS queue depth growth, ECS task count growth. Dashboard: req/min, queue depth, workers, cost/day. Slack notifications for all alerts.
- [ ] **Anomaly detection + auto-ban** (HIGH) — Detect bot patterns: (1) >20 unique texts from one IP in 10 min, (2) >50% of requests at MAX_TEXT_LENGTH, (3) POST /synthesize without GET /status. Response: temporary IP ban via WAF IP set. Implementation: Lambda + EventBridge cron every 5 min.
- [ ] **Audit and forensics** (MEDIUM) — CloudWatch Logs Insights queries: Top-10 IPs per day, hourly distribution, atypical User-Agents. Saved queries for rapid incident investigation.

### A.3 Attack Surface Reduction

- [ ] **Per-path WAF rate limit for /synthesize** (HIGH) — Separate WAF rule: 20 requests / 5 min per IP specifically for `/api/synthesize` (the most expensive endpoint). The general WAF limit of 100/5min is too generous for TTS.
- [ ] **Geo-blocking** (MEDIUM) — Restrict access to `/synthesize` by geography (WAF geo-match): Estonia, Latvia, Lithuania, Finland, Sweden. Significantly reduces attack surface.
- [ ] **Bot-detection / Proof-of-Work** (MEDIUM) — Options: honeypot field in form, proof-of-work before request, AWS WAF Bot Control (~$10/month).
- [ ] **Request fingerprinting** (MEDIUM) — Device fingerprint (canvas, screen, timezone) as header + session token with 30 min TTL. Does not replace authentication but allows tracking devices beyond IP.

### A.4 Storage and Lifecycle

- [ ] **S3 audio lifecycle** (LOW) — Ensure audio files are automatically deleted after 30-90 days. Limits storage cost growth.

### A.5 Testing and Verification

- [ ] **Load testing** (CRITICAL) — Normal load script (10 users, 3-5 requests each) and attack script (100+ req/min with unique text). Measure: response time, queue depth, ECS task count, cost.
- [ ] **Auto-scaling testing** (CRITICAL) — Verify ECS max_capacity, behavior at maximum, processing time at full load.
- [ ] **Lambda concurrency testing** (CRITICAL) — Verify reservedConcurrentExecutions, ensure 429 (not 500) at limit, verify isolation from other Lambdas.
- [ ] **Alert testing** (HIGH) — Simulate each alert, verify Slack delivery. Detection latency < 5 minutes.
- [ ] **Budget limit testing** (HIGH) — Verify AWS Budget alarm triggers + automatic action (reduce ECS count).
- [ ] **SQS queue depth testing** (HIGH) — Fill queue to threshold, verify 503 response. Verify recovery.

**For comparison:** adding authentication via existing Cognito is significantly less work and solves most of the above problems. Some measures (budget alerts, monitoring, ECS cap) are useful even with authentication, but their number and criticality are greatly reduced.
