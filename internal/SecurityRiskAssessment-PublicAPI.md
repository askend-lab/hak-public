# Security Risk Assessment: Public API Endpoints (Finding 12.1)

## Context

The Mikk Merimaa code review flagged `/synthesize` endpoint as HIGH severity — unauthenticated public endpoint. The client requires TTS to work without login. This document assesses the actual risk, catalogs existing mitigations, and proposes additional hardening.

Note: The `/warmup` endpoint is being removed entirely (Finding 15.1) and is not covered in this assessment.

---

## 1. What's Already in Place

### 1.1 AWS WAF v2 (infra/waf.tf)

| Rule | Action | Description |
|------|--------|-------------|
| Per-IP rate limiting | BLOCK | 100 requests per 5 minutes per IP |
| AWS Managed Common Rules | BLOCK | SQL injection, XSS, and common attack vectors |
| CloudWatch logging | LOG | Blocked and counted requests logged, 90-day retention |

**Assessment:** Strong foundation. Per-IP limiting catches most simple abuse. AWS Managed Rules protect against injection attacks. Logging enables forensic analysis.

### 1.2 API Gateway Throttling (merlin-api/serverless.yml)

| Setting | Value |
|---------|-------|
| Rate limit | 2 requests/second |
| Burst limit | 4 requests |

**Assessment:** Very conservative — 2 req/s is a hard cap at the API Gateway level. Even without WAF, an attacker can only send 2 requests per second. This limits financial damage significantly.

### 1.3 CloudFront (infra/cloudfront.tf)

- All APIs are behind CloudFront — **no public DNS for API Gateway directly**
- Comment in config: `"Merlin API origin (no public DNS — only reachable through CloudFront)"`
- Security headers: CSP, HSTS (with preload), X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy: no-referrer
- TLS 1.2 minimum, HTTPS-only
- Access logging to S3 bucket

**Assessment:** Excellent. Attackers cannot bypass WAF by hitting API Gateway directly. All traffic must traverse CloudFront → WAF → API Gateway.

### 1.4 CORS Restrictions (merlin-api/serverless.yml)

```yaml
cors:
  allowedOrigins:
    - https://hak-dev.DOMAIN
    - https://hak.DOMAIN
```

**Assessment:** Browser-based abuse from third-party websites is blocked by CORS. However, CORS does NOT protect against server-side or curl-based requests. This is a defense against casual browser-based abuse only.

### 1.5 Input Validation (merlin-api/src/handler.ts + worker.py)

| Check | Location | Value |
|-------|----------|-------|
| Body size limit | handler.ts | 10 KB (MAX_BODY_SIZE) |
| Text length | handler.ts + worker.py | Max 1000 characters |
| Speed range | handler.ts + worker.py | 0.5 – 2.0 |
| Pitch range | handler.ts + worker.py | -500 – 500 |
| JSON validation | handler.ts | Returns 400 on invalid JSON |
| cacheKey format | handler.ts (s3.ts) | Must match `/^[a-f0-9]{64}$/` |

**Assessment:** Good. Double validation (API + Worker) prevents malformed requests from consuming compute resources. Text limit caps the per-request cost.

### 1.6 SQS Dead Letter Queue (infra/merlin/main.tf)

- Failed messages go to DLQ after 3 retries
- 14-day retention on DLQ
- SQS visibility timeout: 300 seconds (prevents duplicate processing)

**Assessment:** Good. Failed requests don't loop infinitely, and DLQ provides audit trail.

### 1.7 S3 Audio Lifecycle (infra/merlin/main.tf)

- Audio files have lifecycle expiration policy
- Limits storage cost growth over time

### 1.8 Cache-First Architecture (handler.ts)

```typescript
const cached = await checkS3Cache(cacheKey);
if (cached) {
  return createResponse(HTTP_STATUS.OK, { status: "ready", cacheKey, audioUrl });
}
```

**Assessment:** Identical requests are served from S3 cache without hitting SQS/Worker. This is a significant cost mitigation — repeated abuse with the same text costs almost nothing.

---

## 2. Attack Scenarios and Current Coverage

### 2.1 Simple DDoS / High-Volume Abuse

| Layer | Protection | Limit |
|-------|-----------|-------|
| CloudFront | Edge caching, global PoPs | Absorbs GET floods |
| WAF | Per-IP rate limiting | 100 req / 5 min per IP |
| API Gateway | Throttling | 2 req/s, burst 4 |
| SQS | Queue depth | Bounded by maxReceiveCount |
| ECS Fargate | Task count | Bounded by service max |

**Risk: LOW.** An attacker from a single IP can send max 100 requests in 5 minutes. Each request generates max 1000 chars of speech. At 2 req/s API Gateway throttle, sustained abuse is effectively capped.

**Gap:** Distributed DDoS from many IPs could bypass per-IP WAF limits. API Gateway throttle (2 req/s) is the hard cap regardless of source.

### 2.2 Cost Exhaustion Attack

**Cost model per request:**
- API Gateway: ~$0.000001 (negligible)
- SQS: ~$0.0000004 per message
- ECS Fargate: ~$0.05/hour (1 vCPU, 4GB RAM)
- S3: ~$0.023/GB storage, $0.0004/1000 GET

**Worst case:** At 2 req/s sustained, attacker generates 120 unique requests/minute = 7200/hour. Each triggers ~5-15s of Fargate compute. With one worker processing sequentially, real throughput is ~240-720 requests/hour. Monthly max unique requests: ~518,000.

**Monthly cost ceiling:**
- SQS: $0.21
- S3 (assuming 50KB avg audio × 518K): ~$1.19 storage
- ECS Fargate running 24/7: ~$36/month (1 task)

**Risk: LOW-MEDIUM.** Total abuse cost ceiling is ~$37/month with current architecture (single ECS task). If auto-scaling is configured, costs could be higher.

### 2.3 Content Abuse (generating offensive speech)

**Risk: LOW.** The TTS engine generates Estonian speech from text. There's no user-facing content storage — audio files are cached with SHA-256 keys and auto-expire. No user-generated content is publicly listed or discoverable.

### 2.4 S3 Audio Scraping

**Risk: LOW.** S3 bucket is publicly readable, but audio files are keyed by SHA-256 hash. An attacker would need to know the exact hash to retrieve a file — there's no directory listing. The audio content (Estonian TTS) has no commercial value.

---

## 3. What We Can Still Improve (Without Adding Auth)

### 3.1 Recommended (low effort, high impact)

| # | Improvement | Effort | Impact |
|---|-------------|--------|--------|
| A | **Add CloudWatch billing alarm** | Low | Alert on unexpected cost spikes |
| B | **Add API key for /synthesize** (AWS API Gateway API Keys) | Low | Blocks casual abuse without user login |
| C | **Reduce WAF rate limit** for /api/synthesize specifically | Low | Tighter limit on expensive endpoint |

### 3.2 Optional (medium effort, medium impact)

| # | Improvement | Effort | Impact |
|---|-------------|--------|--------|
| E | **Bot detection** — add simple proof-of-work or hidden honeypot field | Medium | Blocks automated scripts |
| F | **Geo-blocking** — restrict to Estonian IP ranges in WAF | Medium | Reduces attack surface for a product targeting Estonian users |
| G | **Signed S3 URLs** — return CloudFront signed URLs instead of direct S3 links | Medium | Prevents audio hotlinking |
| H | **ECS max task count** — hard cap on auto-scaling | Low | Prevents runaway Fargate costs |

### 3.3 If Client Agrees to Minimal Auth

| # | Improvement | Effort | Impact |
|---|-------------|--------|--------|
| I | **Anonymous session tokens** — issue a short-lived token on page load, require it for /synthesize | Medium | Per-session rate limiting, no login needed |
| J | **Cognito unauthenticated identities** — AWS Cognito Identity Pool can issue temporary credentials without login | Medium | Per-device tracking, works with AWS native tools |
| K | **Full Cognito auth** — require TARA login before synthesis | High | Complete abuse prevention, but changes UX |

---

## 4. Recommendation to Client

### Current State: Acceptable for MVP

The existing security posture (WAF + API Gateway throttling + CloudFront + input validation + cache) provides adequate protection for a research/educational application. The worst-case monthly abuse cost is ~$37 with current single-task ECS configuration.

### Recommended Next Steps

1. **Add billing alerts** — CloudWatch alarm at $50/month threshold. Zero code change, pure infrastructure.
2. **Consider API keys** — API Gateway supports usage plans with per-key throttling. This adds a friction layer without requiring user accounts. The frontend can request a key on page load (or embed one). Not true security, but blocks casual curl abuse.

### Question for Client

> We currently have WAF rate limiting (100 req/5min per IP), API Gateway throttling (2 req/s), and cache-first architecture protecting the public TTS endpoint. Monthly abuse ceiling is ~$37.
>
> **Option A (recommended):** Keep current setup + add billing alerts. Accept the ~$37/month risk ceiling.
>
> **Option B:** Add API keys (no user login required, but requires a page-load handshake). Reduces abuse further.
>
> **Option C:** Add anonymous session tokens (short-lived, no login). Enables per-session rate limiting.
>
> **Option D:** Require TARA login before synthesis. Maximum protection, but changes the user experience.
>
> Which approach aligns with your product vision?

---

*Analysis performed by Kate, 2026-02-21*
*Based on: infra/waf.tf, infra/cloudfront.tf, infra/merlin/main.tf, packages/merlin-api/serverless.yml, packages/merlin-api/src/handler.ts, packages/merlin-worker/worker.py*
