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
  SIMPLESTORE_URL="https://hak-api.askend-lab.com"
  VABAMORF_URL="https://vabamorf.askend-lab.com"
  MERLIN_URL="https://merlin-prod.askend-lab.com"
  AUDIO_URL="https://l1hu7ny66c.execute-api.eu-west-1.amazonaws.com/prod"
else
  FRONTEND_URL="https://hak-dev.askend-lab.com"
  SIMPLESTORE_URL="https://hak-api-dev.askend-lab.com"
  VABAMORF_URL="https://vabamorf-dev.askend-lab.com"
  MERLIN_URL="https://merlin-dev.askend-lab.com"
  AUDIO_URL="https://3ktlnibu21.execute-api.eu-west-1.amazonaws.com/dev"
fi

echo "=== Frontend ==="
test_endpoint "Frontend index.html" "$FRONTEND_URL"
test_endpoint_content "Frontend has JS bundle" "$FRONTEND_URL" "GET" "" "assets/index"

echo ""
echo "=== SimpleStore API ==="
test_endpoint "SimpleStore base" "$SIMPLESTORE_URL/api" "GET" "" "403"

echo ""
echo "=== Vabamorf API ==="
test_endpoint_content "Vabamorf /analyze" "$VABAMORF_URL/analyze" "POST" '{"text":"Tere"}' "stressedText"

echo ""
echo "=== Merlin API (real generation) ==="
SYNTH_RESP=$(curl -s -m 10 -X POST -H "Content-Type: application/json" -d '{"text":"Test","voice":"efm_l"}' "$MERLIN_URL/synthesize")
if echo "$SYNTH_RESP" | grep -q '"status":"ready"'; then
  AUDIO_URL=$(echo "$SYNTH_RESP" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$AUDIO_URL" ] && curl -s -I "$AUDIO_URL" 2>/dev/null | grep -qi "audio/\|wav"; then
    echo -e "${GREEN}✓${NC} Merlin audio generated"; ((PASSED++))
  else
    echo -e "${RED}✗${NC} Merlin audio URL invalid"; ((FAILED++))
  fi
elif echo "$SYNTH_RESP" | grep -q '"status":"pending"\|"status":"processing"'; then
  STATUS_URL=$(echo "$SYNTH_RESP" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)
  AUDIO_OK=false
  for i in 1 2 3 4 5 6; do
    sleep 5
    STAT=$(curl -s "$STATUS_URL" 2>/dev/null)
    if echo "$STAT" | grep -q '"status":"ready"\|"status":"completed"'; then
      AUDIO_OK=true; break
    elif echo "$STAT" | grep -q '"status":"error"'; then
      break
    fi
  done
  if $AUDIO_OK; then
    echo -e "${GREEN}✓${NC} Merlin audio generated"; ((PASSED++))
  else
    echo -e "${RED}✗${NC} Merlin audio generation failed"; ((FAILED++))
  fi
else
  echo -e "${RED}✗${NC} Merlin API error: $SYNTH_RESP"; ((FAILED++))
fi

echo ""
echo "=== Frontend API Routing (CloudFront) ==="
test_endpoint_content "CloudFront /api/analyze" "$FRONTEND_URL/api/analyze" "POST" '{"text":"Tere"}' "stressedText"
# /api/synthesize may be blocked by WAF geo-restriction (CI runner outside allowed countries)
# Response may be immediate (audioUrl) or async (statusUrl with pending/processing status)
SYNTH_CF=$(curl -s -m 10 -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d '{"text":"Tere","voice":"efm_l"}' "$FRONTEND_URL/api/synthesize" 2>&1)
SYNTH_CF_CODE=$(echo "$SYNTH_CF" | tail -n1)
SYNTH_CF_BODY=$(echo "$SYNTH_CF" | sed '$d')
if echo "$SYNTH_CF_BODY" | grep -q "audioUrl"; then
  echo -e "${GREEN}✓${NC} CloudFront /api/synthesize - audioUrl present"
  ((PASSED++))
elif echo "$SYNTH_CF_BODY" | grep -q '"status":"pending"\|"status":"processing"'; then
  echo -e "${GREEN}✓${NC} CloudFront /api/synthesize - async response (pending/processing)"
  ((PASSED++))
elif [[ "$SYNTH_CF_CODE" == "403" ]]; then
  echo -e "${GREEN}✓${NC} CloudFront /api/synthesize - WAF geo-block active (HTTP 403)"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} CloudFront /api/synthesize - HTTP $SYNTH_CF_CODE, no audioUrl"
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
