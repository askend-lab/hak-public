#!/bin/bash
set -e

# Deploy Merlin Worker to AWS ECS
# Usage: ./scripts/deploy-merlin-worker.sh [--stage dev|prod]

STAGE="${1:-dev}"
REGION="eu-west-1"
ECR_REPO="465168436856.dkr.ecr.${REGION}.amazonaws.com/merlin-worker"
ECS_CLUSTER="hak-merlin-${STAGE}"
ECS_SERVICE="merlin-worker"

echo "🚀 Deploying Merlin Worker to ${STAGE}..."
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS credentials not configured"
    exit 1
fi

AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found in config"
    exit 1
fi

echo "✅ AWS credentials OK"

# Navigate to merlin-worker directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKER_DIR="${SCRIPT_DIR}/../packages/merlin-worker"

if [ ! -d "$WORKER_DIR" ]; then
    echo "❌ Worker directory not found: $WORKER_DIR"
    exit 1
fi

cd "$WORKER_DIR"
echo "📁 Working directory: $(pwd)"

# Build Docker image
echo ""
echo "🔨 Building Docker image..."
docker build \
    --no-cache \
    --build-arg AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    --build-arg AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    -t "${ECR_REPO}:latest" \
    .

echo "✅ Docker image built"

# Login to ECR
echo ""
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region "$REGION" | \
    docker login --username AWS --password-stdin "465168436856.dkr.ecr.${REGION}.amazonaws.com"

echo "✅ ECR login OK"

# Push to ECR
echo ""
echo "📤 Pushing to ECR..."
docker push "${ECR_REPO}:latest"

echo "✅ Image pushed"

# Update ECS service
echo ""
echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$ECS_SERVICE" \
    --force-new-deployment \
    --region "$REGION" \
    --query 'service.deployments[0].status' \
    --output text

echo "✅ ECS service updated"

# Wait for deployment
echo ""
echo "⏳ Waiting for deployment (max 3 min)..."
for i in {1..18}; do
    sleep 10
    STATUS=$(aws ecs describe-services \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$REGION" \
        --query 'services[0].deployments[?status==`PRIMARY`].runningCount' \
        --output text)
    
    if [ "$STATUS" = "1" ]; then
        ACTIVE=$(aws ecs describe-services \
            --cluster "$ECS_CLUSTER" \
            --services "$ECS_SERVICE" \
            --region "$REGION" \
            --query 'length(services[0].deployments)' \
            --output text)
        
        if [ "$ACTIVE" = "1" ]; then
            echo "✅ Deployment complete!"
            break
        fi
    fi
    echo "   ... waiting ($i/18)"
done

# Test health
echo ""
echo "🧪 Testing Merlin API..."
HEALTH=$(curl -s "https://merlin-${STAGE}.askend-lab.com/health" 2>/dev/null || echo "failed")

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check: $HEALTH"
fi

echo ""
echo "🎉 Done! Merlin Worker deployed to ${STAGE}"
echo "   API: https://merlin-${STAGE}.askend-lab.com"
