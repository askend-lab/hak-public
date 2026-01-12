#!/bin/bash
# Compare deployment status between environments
# Uses GitHub Deployments API to show what's deployed where

set -e

REPO="askend-lab/hak"

echo "🔍 Comparing deployments between environments..."
echo ""

# Get latest deployment for each environment
get_latest_deployment() {
  local env=$1
  gh api "repos/${REPO}/deployments?environment=${env}&per_page=1" \
    --jq '.[0] | {sha: .sha[0:7], created: .created_at, id: .id}' 2>/dev/null || echo "{}"
}

# Get deployment status
get_deployment_status() {
  local deployment_id=$1
  gh api "repos/${REPO}/deployments/${deployment_id}/statuses?per_page=1" \
    --jq '.[0].state' 2>/dev/null || echo "unknown"
}

echo "📊 Latest Deployments:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for env in dev prod; do
  deployment=$(get_latest_deployment "$env")
  
  if [ "$deployment" == "{}" ] || [ -z "$deployment" ]; then
    echo "  ${env}: No deployments found"
  else
    sha=$(echo "$deployment" | jq -r '.sha')
    created=$(echo "$deployment" | jq -r '.created')
    id=$(echo "$deployment" | jq -r '.id')
    status=$(get_deployment_status "$id")
    
    echo "  ${env}:"
    echo "    SHA: ${sha}"
    echo "    Status: ${status}"
    echo "    Deployed: ${created}"
  fi
  echo ""
done

# Show commits between dev and prod
echo "📈 Commits between prod and dev:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

dev_sha=$(get_latest_deployment "dev" | jq -r '.sha')
prod_sha=$(get_latest_deployment "prod" | jq -r '.sha')

if [ "$dev_sha" != "null" ] && [ "$prod_sha" != "null" ] && [ -n "$dev_sha" ] && [ -n "$prod_sha" ]; then
  # Get full SHAs for comparison
  dev_full=$(gh api "repos/${REPO}/commits/${dev_sha}" --jq '.sha' 2>/dev/null || echo "")
  prod_full=$(gh api "repos/${REPO}/commits/${prod_sha}" --jq '.sha' 2>/dev/null || echo "")
  
  if [ -n "$dev_full" ] && [ -n "$prod_full" ]; then
    count=$(gh api "repos/${REPO}/compare/${prod_full}...${dev_full}" --jq '.ahead_by' 2>/dev/null || echo "?")
    echo "  Dev is ${count} commit(s) ahead of prod"
    
    if [ "$count" != "0" ] && [ "$count" != "?" ]; then
      echo ""
      echo "  Recent commits not in prod:"
      gh api "repos/${REPO}/compare/${prod_full}...${dev_full}" \
        --jq '.commits[-5:] | reverse | .[] | "    - \(.sha[0:7]) \(.commit.message | split("\n")[0])"' 2>/dev/null || true
    fi
  fi
else
  echo "  Unable to compare (missing deployment data)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 To deploy to prod: gh workflow run deploy-v2.yml -f environment=prod -f build_id=<BUILD_ID>"
