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
echo "=== Merlin API ==="
test_endpoint_content "Merlin /synthesize" "$MERLIN_URL/synthesize" "POST" '{"text":"Tere","voice":"efm_l"}' "audioUrl"

echo ""
echo "=== Audio API ==="
test_endpoint_content "Audio API /health" "$AUDIO_URL/health" "GET" "" "healthy"

echo ""
echo "=== Frontend API Routing (CloudFront) ==="
test_endpoint_content "CloudFront /api/analyze" "$FRONTEND_URL/api/analyze" "POST" '{"text":"Tere"}' "stressedText"
test_endpoint_content "CloudFront /api/synthesize" "$FRONTEND_URL/api/synthesize" "POST" '{"text":"Tere","voice":"efm_l"}' "audioUrl"
test_endpoint_content "CloudFront /api/status/*" "$FRONTEND_URL/api/status/test-key" "GET" "" "status"

echo ""
echo "=== Merlin Auto-Scaling ==="
MERLIN_CLUSTER="hak-merlin-${ENV}"
AUTOSCALING=$(aws application-autoscaling describe-scalable-targets \
  --service-namespace ecs \
  --resource-ids "service/${MERLIN_CLUSTER}/merlin-worker" \
  --query 'ScalableTargets[0].MinCapacity' \
  --output text 2>/dev/null)

if [[ "$AUTOSCALING" == "0" ]]; then
  echo -e "${GREEN}✓${NC} Merlin auto-scaling (min=0)"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Merlin auto-scaling NOT configured (min=0 required, got: $AUTOSCALING)"
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
