# Test Plan: Rate Limits & Security Verification

**Date:** 2026-03-10
**Scope:** WAF rules, auth enforcement, geo-blocking, frontend error handling
**Environments:** dev (`hak-dev.askend-lab.com`), prod (`hak.askend-lab.com`)

---

## Prerequisites

```bash
# Tools needed
brew install hey           # HTTP load generator (or use ab, wrk)
brew install jq            # JSON parsing
# VPN with non-EU exit node (for geo-block test)
# Valid JWT token from Cognito (for per-user tests)
```

Get a valid JWT token:
```bash
# Option 1: Copy from browser DevTools → Application → Local Storage → access_token
# Option 2: Login via UI, then extract from network tab
TOKEN="Bearer eyJ..."
BASE="https://hak-dev.askend-lab.com"
```

---

## 1. Authentication Enforcement

**Goal:** Prove that protected endpoints reject unauthenticated requests.

### Test 1.1: Synthesize without token → 401
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text":"tere"}'
# Expected: 401
```

### Test 1.2: Analyze without token → 401
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text":"tere"}'
# Expected: 401
```

### Test 1.3: Variants without token → 401
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/variants" \
  -H "Content-Type: application/json" \
  -d '{"word":"tere"}'
# Expected: 401
```

### Test 1.4: Status without token → 401
```bash
curl -s -o /dev/null -w "%{http_code}" \
  "$BASE/api/status/test-key" \
  -H "Content-Type: application/json"
# Expected: 401
```

### Test 1.5: Health endpoint is public → 200
```bash
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/health"
# Expected: 200
```

### Test 1.6: Expired/invalid token → 401
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/synthesize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid.token.here" \
  -d '{"text":"tere"}'
# Expected: 401
```

---

## 2. WAF Per-User Rate Limits (Rules 5-7)

**Goal:** Verify per-user rate limits enforce the SLA values.

### Test 2.1: Synthesis rate limit — 5/min (10 req/2min window)

```bash
# Send 12 rapid synthesis requests with valid token
for i in $(seq 1 12); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE/api/synthesize" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d '{"text":"tere"}')
  echo "Request $i: $CODE"
done
# Expected: First ~10 return 200/202, then 429
```

### Test 2.2: Verify 429 response body format

```bash
# After hitting the limit, check response body
curl -s -X POST "$BASE/api/synthesize" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"text":"tere"}' | jq .
# Expected: {"error":"RATE_LIMIT","message":"Too many requests"}
```

### Test 2.3: Different users have separate limits

```bash
# User A hits limit
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST "$BASE/api/synthesize" \
    -H "Authorization: $TOKEN_A" \
    -H "Content-Type: application/json" \
    -d '{"text":"tere"}'
done
# User A should get 429 after ~10

# User B should still work (different token = different bucket)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/synthesize" \
  -H "Authorization: $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"text":"tere"}'
# Expected: 200/202 (User B not affected)
```

### Test 2.4: Morphology rate limit — 20/min

```bash
for i in $(seq 1 25); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE/api/analyze" \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d '{"text":"tere"}')
  echo "Request $i: $CODE"
done
# Expected: First ~20 return 200, then 429
```

### Test 2.5: Status polling rate limit — 100/min

```bash
# Use `hey` for rapid parallel requests
hey -n 120 -c 10 \
  -H "Authorization: $TOKEN" \
  "$BASE/api/status/test-key" 2>&1 | grep "Status code"
# Expected: ~100 return 200/404, remaining return 429
```

### Test 2.6: Rate limit resets after window

```bash
# Hit the synthesis limit
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST "$BASE/api/synthesize" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"text":"tere"}'
done
# Last requests should be 429

# Wait 2 minutes (synthesis window = 2min)
echo "Waiting 2 minutes for window reset..."
sleep 120

# Try again
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/synthesize" \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"tere"}'
# Expected: 200/202 (limit reset)
```

---

## 3. WAF Per-IP Rate Limits (Rules 1-2)

### Test 3.1: General per-IP limit — 2000/5min

```bash
hey -n 2200 -c 50 "$BASE/" 2>&1 | grep "Status code"
# Expected: First ~2000 return 200, then 429
# Note: This is a high volume test, run only on dev
```

### Test 3.2: Per-IP /synthesize limit — 200/5min

```bash
hey -n 220 -c 10 -m POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"text":"tere"}' \
  "$BASE/api/synthesize" 2>&1 | grep "Status code"
# Expected: After ~200 requests, start getting 429
```

### Test 3.3: Per-IP returns 429 (not 403)

```bash
# After hitting per-IP limit, verify response code
curl -s -o /dev/null -w "%{http_code}" "$BASE/"
# Expected: 429 (was 403 before our change)
```

---

## 4. Geo-Blocking (Rule 3)

**Goal:** Verify synthesis is blocked from non-allowed countries.

### Test 4.1: Request from allowed country → 200

```bash
# From Estonia/Finland/etc (no VPN needed if already in EU)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/synthesize" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"text":"tere"}'
# Expected: 200/202
```

### Test 4.2: Request from blocked country → 403

```bash
# Connect to VPN with US/Asia exit node
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/synthesize" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"text":"tere"}'
# Expected: 403 (geo-block, NOT 429)
```

### Test 4.3: Non-synthesize endpoints work from any country

```bash
# With non-EU VPN, /analyze should still work (no geo-block)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE/api/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"text":"tere"}'
# Expected: 200 (geo-block only applies to /synthesize)
```

---

## 5. Frontend Error Handling

**Goal:** Verify toast notifications appear for each error type.

### Test 5.1: Rate limit toast (429)

1. Open `$BASE` in browser, login
2. Open DevTools Console
3. Rapid-click Play button 10+ times in quick succession
4. **Expected:** Toast appears: "Liiga palju päringuid" / "Proovi mõne hetke pärast uuesti."

### Test 5.2: Service busy toast (503)

1. Simulate by temporarily setting SQS queue depth > 50 (or mock in dev)
2. Or: use DevTools to intercept response and return 503
3. **Expected:** Toast appears: "Teenus on ajutiselt ülekoormatud"

### Test 5.3: Blocked toast (403)

1. Connect to non-EU VPN
2. Try to synthesize
3. **Expected:** Toast appears: "Ligipääs keelatud" / "Päring blokeeriti."

### Test 5.4: Auth modal (401)

1. Clear localStorage (or wait for token expiry)
2. Click Play button
3. **Expected:** Login modal appears (not a toast)

### Test 5.5: Programmatic test (DevTools Console)

```javascript
// Simulate 429 event
window.dispatchEvent(new CustomEvent('api-error', {
  detail: { type: 'rate-limit', message: 'Liiga palju päringuid', description: 'Proovi mõne hetke pärast uuesti.' }
}));
// Should show toast in top-right corner

// Simulate 403 event
window.dispatchEvent(new CustomEvent('api-error', {
  detail: { type: 'blocked', message: 'Ligipääs keelatud', description: 'Päring blokeeriti.' }
}));
// Should show toast
```

---

## 6. CloudWatch Monitoring

**Goal:** Verify WAF metrics are being collected after the rules are deployed.

### Test 6.1: Check WAF metrics exist

```bash
aws cloudwatch list-metrics \
  --namespace "AWS/WAFV2" \
  --dimensions Name=Rule,Value=rate-limit-per-user-synthesize \
  --region us-east-1
# Expected: BlockedRequests and AllowedRequests metrics present
```

### Test 6.2: Check WAF logs

```bash
aws logs filter-log-events \
  --log-group-name "aws-waf-logs-hak-dev" \
  --filter-pattern '{ $.action = "BLOCK" }' \
  --limit 5 \
  --region us-east-1 | jq '.events[].message | fromjson | {action, ruleGroupList}'
# Expected: Shows blocked requests with rule names
```

---

## 7. Terraform Verification

**Goal:** Verify infrastructure changes apply cleanly.

### Test 7.1: Terraform plan (already done in CI)

```bash
cd infra && terraform plan -var="env=dev"
# Expected: Shows new WAF rules 5-7, updated rules 1-2, custom_response_body
# No unexpected changes
```

### Test 7.2: Post-deploy — WAF rules visible in console

1. Open AWS Console → WAF & Shield → Web ACLs → `hak-dev-waf`
2. Verify rules: rate-limit-per-user-synthesize (priority 5), rate-limit-per-user-morphology (6), rate-limit-per-user-status (7)
3. Verify each rule has custom_response with 429 status code

---

## Summary Checklist

| # | Test | Category | Manual/Auto | Status |
|---|------|----------|-------------|--------|
| 1.1-1.6 | Auth enforcement (401) | Security | curl | ☐ |
| 2.1 | Per-user synthesis 5/min | Rate limit | curl loop | ☐ |
| 2.2 | 429 response body JSON | Rate limit | curl + jq | ☐ |
| 2.3 | Separate user buckets | Rate limit | 2 tokens | ☐ |
| 2.4 | Per-user morphology 20/min | Rate limit | curl loop | ☐ |
| 2.5 | Per-user status 100/min | Rate limit | hey | ☐ |
| 2.6 | Window reset | Rate limit | curl + sleep | ☐ |
| 3.1-3.3 | Per-IP limits (429) | Rate limit | hey | ☐ |
| 4.1-4.3 | Geo-blocking | Security | VPN + curl | ☐ |
| 5.1-5.4 | Frontend toasts | UX | Browser | ☐ |
| 5.5 | Programmatic toast | UX | DevTools | ☐ |
| 6.1-6.2 | CloudWatch metrics/logs | Monitoring | AWS CLI | ☐ |
| 7.1-7.2 | Terraform + AWS Console | Infra | CLI + Console | ☐ |

---

## Notes

- **WAF rate limits are "best effort"** — AWS docs say they apply limits "near" the configured value, not exactly. Expect ±10% variance.
- **Evaluation window** is a sliding window, not a fixed calendar window.
- **Per-user limits** use JWT token as aggregate key. Token refresh (~1hr) resets the bucket.
- **Per-IP limits** use source IP. Behind CloudFront, this is the client's real IP.
- **Geo-blocking** returns 403 (not 429). Frontend shows "Ligipääs keelatud" toast.
- Run rate limit tests on **dev only** to avoid affecting prod users.
