# Route53 Health Checks — external uptime monitoring
# Checks CloudFront frontend and backend API health via /api/health
# Route53 health checks must be in us-east-1

# Frontend health check — verifies CloudFront + S3 are serving the app
resource "aws_route53_health_check" "frontend" {
  fqdn              = local.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/"
  failure_threshold = 3
  request_interval  = 30

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-${var.env}-frontend-health"
  })
}

# Backend API health check — verifies CloudFront → API Gateway → Lambda chain
# Hits /api/health which CloudFront rewrites to /health on merlin-api (TTS)
resource "aws_route53_health_check" "backend_api" {
  fqdn              = local.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health"
  failure_threshold = 3
  request_interval  = 30

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-${var.env}-backend-health"
  })
}

# CloudWatch alarms for health checks
# NOTE: Route53 metrics are only in us-east-1, but our SNS topic is in eu-west-1.
# These alarms have no alarm_actions — they provide visibility in CloudWatch console.
# Phase 5 TODO: add cross-region SNS relay (EventBridge or Lambda) for Slack alerts.

resource "aws_cloudwatch_metric_alarm" "frontend_health" {
  provider            = aws.us_east_1
  alarm_name          = "${local.app_name}-${var.env}-frontend-unhealthy"
  alarm_description   = "Frontend is not responding — CloudFront or S3 may be down"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  treat_missing_data  = "breaching"

  dimensions = {
    HealthCheckId = aws_route53_health_check.frontend.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "backend_api_health" {
  provider            = aws.us_east_1
  alarm_name          = "${local.app_name}-${var.env}-backend-unhealthy"
  alarm_description   = "Backend API is not responding — API Gateway or Lambda may be down"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  treat_missing_data  = "breaching"

  dimensions = {
    HealthCheckId = aws_route53_health_check.backend_api.id
  }

  tags = local.common_tags
}
