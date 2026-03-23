#!/bin/bash
# Smoke test for HAK services
# Usage: ./scripts/smoke-test.sh [dev|prod]

ENV="${1:-dev}"

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

echo "=============================================="
echo "  HAK Smoke Test - Environment: $ENV"
echo "=============================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASSED=0
FAILED=0

test_endpoint() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="$4"
  local expected="${5:-200}"
  
  if [ -n "$data" ]; then
    response=$(curl -s -m 10 -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>&1)
  else
    response=$(curl -s -m 10 -w "\n%{http_code}" -X "$method" "$url" 2>&1)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  
  if [[ "$http_code" == "$expected" ]]; then
    echo -e "${GREEN}✓${NC} $name - HTTP $http_code"
    ((PASSED++))
  elif [[ "$http_code" == "000" ]]; then
    echo -e "${RED}✗${NC} $name - Connection failed"
    ((FAILED++))
  else
    echo -e "${RED}✗${NC} $name - HTTP $http_code (expected $expected)"
    ((FAILED++))
  fi
}

test_endpoint_content() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="$4"
  local contains="$5"
  
  if [ -n "$data" ]; then
    response=$(curl -s -m 10 -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>&1)
  else
    response=$(curl -s -m 10 -X "$method" "$url" 2>&1)
  fi
  
  if echo "$response" | grep -q "$contains"; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $name - expected '$contains'"
    ((FAILED++))
  fi
}

# URLs
if [ "$ENV" == "prod" ]; then
  FRONTEND_URL="https://hak.askend-lab.com"
  SIMPLESTORE_URL="https://hak.askend-lab.com"
  VABAMORF_URL="https://hak.askend-lab.com"
  MERLIN_URL="https://hak.askend-lab.com/api"
  AUDIO_URL="https://hak.askend-lab.com/api"
else
  FRONTEND_URL="https://hak-dev.askend-lab.com"
  SIMPLESTORE_URL="https://hak-dev.askend-lab.com"
  VABAMORF_URL="https://hak-dev.askend-lab.com"
  MERLIN_URL="https://hak-dev.askend-lab.com/api"
  AUDIO_URL="https://hak-dev.askend-lab.com/api"
fi

echo "=== Frontend ==="
test_endpoint "Frontend index.html" "$FRONTEND_URL"
test_endpoint_content "Frontend has JS bundle" "$FRONTEND_URL" "GET" "" "assets/index"

echo ""
echo "=== SimpleStore API ==="
# SimpleStore endpoints require auth — verify reachability through CloudFront
SS_CODE=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "$SIMPLESTORE_URL/api/get-public?key=smoke-test")
if [[ "$SS_CODE" == "200" || "$SS_CODE" == "400" || "$SS_CODE" == "404" ]]; then
  echo -e "${GREEN}✓${NC} SimpleStore /api/get-public - HTTP $SS_CODE"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} SimpleStore /api/get-public - HTTP $SS_CODE (expected 200/400/404)"
  ((FAILED++))
fi

echo ""
echo "=== Vabamorf API ==="
# Auth-required through CloudFront — verify reachability (401 = routing works)
VABA_CODE=$(curl -s -m 10 -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"text":"Tere"}' "$VABAMORF_URL/api/analyze")
if [[ "$VABA_CODE" == "200" || "$VABA_CODE" == "401" ]]; then
  echo -e "${GREEN}✓${NC} Vabamorf /analyze - HTTP $VABA_CODE"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Vabamorf /analyze - HTTP $VABA_CODE (expected 200/401)"
  ((FAILED++))
fi

echo ""
echo "=== Merlin API ==="
test_endpoint "Merlin /health" "$MERLIN_URL/health"
# Synthesize requires JWT auth through CloudFront — verify reachability (401 = auth required = routing works)
SYNTH_CODE=$(curl -s -m 10 -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"text":"Test","voice":"efm_l"}' "$MERLIN_URL/synthesize")
if [[ "$SYNTH_CODE" == "200" || "$SYNTH_CODE" == "202" || "$SYNTH_CODE" == "401" ]]; then
  echo -e "${GREEN}✓${NC} Merlin /synthesize reachable - HTTP $SYNTH_CODE"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Merlin /synthesize - HTTP $SYNTH_CODE (expected 200/202/401)"
  ((FAILED++))
fi

echo ""
echo "=== Frontend API Routing (CloudFront) ==="
# Auth-required endpoints return 401 JSON (proves routing works, not S3 HTML)
ANALYZE_CODE=$(curl -s -m 10 -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"text":"Tere"}' "$FRONTEND_URL/api/analyze")
if [[ "$ANALYZE_CODE" == "200" || "$ANALYZE_CODE" == "401" ]]; then
  echo -e "${GREEN}✓${NC} CloudFront /api/analyze - HTTP $ANALYZE_CODE"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} CloudFront /api/analyze - HTTP $ANALYZE_CODE (expected 200/401)"
  ((FAILED++))
fi
# /api/synthesize — validates CloudFront routes to Merlin API (not S3)
# CRITICAL: Check content-type is JSON. HTTP 200 with text/html means
# CloudFront is serving SPA HTML instead of routing to the API backend.
SYNTH_CF_HEADERS=$(curl -s -m 10 -D - -o /dev/null -X POST -H "Content-Type: application/json" -d '{"text":"Tere","voice":"efm_l"}' "$FRONTEND_URL/api/synthesize" 2>&1)
SYNTH_CF_CODE=$(echo "$SYNTH_CF_HEADERS" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
SYNTH_CF_CT=$(echo "$SYNTH_CF_HEADERS" | grep -i "^content-type:" | tail -1)
if echo "$SYNTH_CF_CT" | grep -qi "application/json"; then
  echo -e "${GREEN}✓${NC} CloudFront /api/synthesize - HTTP $SYNTH_CF_CODE (JSON)"
  ((PASSED++))
elif [[ "$SYNTH_CF_CODE" == "403" ]]; then
  echo -e "${GREEN}✓${NC} CloudFront /api/synthesize - WAF geo-block active (HTTP 403)"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} CloudFront /api/synthesize - HTTP $SYNTH_CF_CODE content-type: $SYNTH_CF_CT (expected application/json)"
  ((FAILED++))
fi
test_endpoint_content "CloudFront /api/status/*" "$FRONTEND_URL/api/status/test-key" "GET" "" "cacheKey\|error"

echo ""
echo "=== Merlin Configuration ==="
# Prod runs 24x7 with min=1, dev uses prod Merlin
PROD_SCALING=$(aws application-autoscaling describe-scalable-targets \
  --service-namespace ecs \
  --resource-ids "service/hak-merlin-prod/merlin-worker" \
  --query 'ScalableTargets[0].MinCapacity' \
  --output text 2>/dev/null)

if [[ "$PROD_SCALING" == "1" ]]; then
  echo -e "${GREEN}✓${NC} Merlin prod running 24x7 (min=1)"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Merlin prod NOT configured for 24x7 (min=1 required, got: $PROD_SCALING)"
  ((FAILED++))
fi

echo ""
echo "=============================================="
echo "  SUMMARY"
echo "=============================================="
echo -e "${GREEN}Passed:${NC}  $PASSED"
echo -e "${RED}Failed:${NC}  $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Some services are broken!${NC}"
  exit 1
else
  echo -e "${GREEN}All services OK!${NC}"
  exit 0
fi
