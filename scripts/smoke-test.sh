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

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
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
  body=$(echo "$response" | sed '$d')
  
  if [[ "$http_code" == "$expected" ]]; then
    echo -e "${GREEN}✓${NC} $name - HTTP $http_code"
    ((PASSED++))
    return 0
  elif [[ "$http_code" == "000" ]]; then
    echo -e "${RED}✗${NC} $name - Connection failed"
    ((FAILED++))
    return 1
  else
    echo -e "${RED}✗${NC} $name - HTTP $http_code (expected $expected)"
    echo "  Response: ${body:0:200}"
    ((FAILED++))
    return 1
  fi
}

# Test function for content check
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
    return 0
  else
    echo -e "${RED}✗${NC} $name - expected '$contains'"
    echo "  Response: ${response:0:100}"
    ((FAILED++))
    return 1
  fi
}

echo "=== Frontend ==="
if [ "$ENV" == "prod" ]; then
  FRONTEND_URL="https://hak.askend-lab.com"
else
  FRONTEND_URL="https://hak-dev.askend-lab.com"
fi
test_endpoint "Frontend index.html" "$FRONTEND_URL"
test_endpoint_content "Frontend has JS bundle" "$FRONTEND_URL" "GET" "" "assets/index"

echo ""
echo "=== SimpleStore API ==="
SIMPLESTORE_URL="https://hak-api-${ENV}.askend-lab.com"
if [ "$ENV" == "prod" ]; then
  SIMPLESTORE_URL="https://hak-api.askend-lab.com"
fi
test_endpoint "SimpleStore base" "$SIMPLESTORE_URL/api" "GET" "" "403"

echo ""
echo "=== Vabamorf API ==="
VABAMORF_URL="https://vabamorf-${ENV}.askend-lab.com"
if [ "$ENV" == "prod" ]; then
  VABAMORF_URL="https://vabamorf.askend-lab.com"
fi
test_endpoint_content "Vabamorf /analyze" "$VABAMORF_URL/analyze" "POST" '{"text":"Tere"}' "stressedText"

echo ""
echo "=== Merlin API ==="
MERLIN_URL="https://merlin-${ENV}.askend-lab.com"
if [ "$ENV" == "prod" ]; then
  MERLIN_URL="https://merlin.askend-lab.com"
fi
test_endpoint_content "Merlin /synthesize" "$MERLIN_URL/synthesize" "POST" '{"text":"Tere","voice":"mari"}' "audioUrl"

echo ""
echo "=== Audio API ==="
# Audio API uses API Gateway directly
if [ "$ENV" == "prod" ]; then
  AUDIO_URL="https://3ktlnibu21.execute-api.eu-west-1.amazonaws.com/prod"
else
  AUDIO_URL="https://3ktlnibu21.execute-api.eu-west-1.amazonaws.com/dev"
fi
test_endpoint_content "Audio API /health" "$AUDIO_URL/health" "GET" "" "healthy"

echo ""
echo "=== Frontend API Routing (CloudFront) ==="
# Test that frontend domain correctly routes /api/* to backends
# This catches misconfigured CloudFront behaviors
test_endpoint_content "CloudFront /api/analyze" "$FRONTEND_URL/api/analyze" "POST" '{"text":"Tere"}' "stressedText"
test_endpoint_content "CloudFront /api/synthesize" "$FRONTEND_URL/api/synthesize" "POST" '{"text":"Tere","voice":"mari"}' "audioUrl"
test_endpoint_content "CloudFront /api/status/*" "$FRONTEND_URL/api/status/test-key" "GET" "" "status"

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
