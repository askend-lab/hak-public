#!/bin/bash
# Test: Dev Merlin should be disabled (min=0, max=0)
# This ensures dev environment doesn't waste money on unused Merlin instances

set -e

echo "Testing: Dev Merlin auto-scaling configuration..."

# Check dev Merlin min/max capacity
DEV_SCALING=$(aws application-autoscaling describe-scalable-targets \
  --service-namespace ecs \
  --resource-ids "service/hak-merlin-dev/merlin-worker" \
  --query 'ScalableTargets[0].[MinCapacity,MaxCapacity]' \
  --output text 2>/dev/null)

MIN=$(echo "$DEV_SCALING" | awk '{print $1}')
MAX=$(echo "$DEV_SCALING" | awk '{print $2}')

if [[ "$MIN" == "0" && "$MAX" == "0" ]]; then
  echo "✓ PASS: Dev Merlin is disabled (min=0, max=0)"
  exit 0
else
  echo "✗ FAIL: Dev Merlin should be disabled but has min=$MIN, max=$MAX"
  echo "Dev uses prod Merlin for audio generation - dev should not run its own instance"
  exit 1
fi
