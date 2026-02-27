# CloudWatch Alarms and Slack Notifications
# Monitors critical errors and sends alerts to Slack

# =============================================================================
# SNS Topic for Alerts
# =============================================================================

#tfsec:ignore:AVD-AWS-0136 AWS managed SNS key is sufficient; CMK not needed for alert notifications
resource "aws_sns_topic" "alerts" {
  name              = "hak-alerts-${var.env}"
  kms_master_key_id = "alias/aws/sns"
  tags              = local.common_tags
}

# =============================================================================
# CloudWatch Alarms
# =============================================================================

# API Gateway 5XX Errors (CRITICAL)
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "hak-${var.env}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: API Gateway 5XX errors detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    ApiName = "${var.env}-simplestore"
    Stage   = var.env
  }
  
  tags = local.common_tags
}

# API Gateway 4XX Errors (WARNING)
resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  alarm_name          = "hak-${var.env}-api-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "WARNING: High rate of API Gateway 4XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    ApiName = "${var.env}-simplestore"
    Stage   = var.env
  }
  
  tags = local.common_tags
}

# Lambda Errors
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "hak-${var.env}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 3
  alarm_description   = "Lambda function errors exceeded threshold"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    FunctionName = "simplestore-${var.env}-api"
  }
  
  tags = local.common_tags
}

# DynamoDB Throttling
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttling" {
  alarm_name          = "hak-${var.env}-dynamodb-throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ThrottledRequests"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "DynamoDB throttled requests detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    TableName = "simplestore-${var.env}"
  }
  
  tags = local.common_tags
}

# High API Latency
resource "aws_cloudwatch_metric_alarm" "api_high_latency" {
  alarm_name          = "hak-${var.env}-api-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 300
  extended_statistic  = "p99"
  threshold           = 5000  # 5 seconds
  alarm_description   = "API Gateway p99 latency too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ApiName = "${var.env}-simplestore"
    Stage   = var.env
  }
  
  tags = local.common_tags
}

# =============================================================================
# Lambda Error Alarms — all services (Phase 1)
# =============================================================================

# TTS API (merlin-api) Lambda Errors — synthesis and status handlers
resource "aws_cloudwatch_metric_alarm" "merlin_api_lambda_errors" {
  alarm_name          = "hak-${var.env}-merlin-api-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: merlin-api Lambda errors — user cannot generate audio"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "merlin-api-${var.env}-synthesize"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "merlin_api_status_lambda_errors" {
  alarm_name          = "hak-${var.env}-merlin-api-status-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: merlin-api status Lambda errors — user cannot check synthesis progress"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "merlin-api-${var.env}-status"
  }

  tags = local.common_tags
}

# Auth (tara-auth) Lambda Errors — all auth handlers
resource "aws_cloudwatch_metric_alarm" "tara_auth_lambda_errors" {
  for_each = toset(["taraStart", "taraCallback", "tokenRefresh", "tokenExchange"])

  alarm_name          = "hak-${var.env}-tara-auth-${each.key}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: tara-auth ${each.key} Lambda errors — authentication broken"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "tara-auth-${var.env}-${each.key}"
  }

  tags = local.common_tags
}

# Morphology API (vabamorf-api) Lambda Errors
resource "aws_cloudwatch_metric_alarm" "vabamorf_api_lambda_errors" {
  alarm_name          = "hak-${var.env}-vabamorf-api-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: vabamorf-api Lambda errors — text analysis broken"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "vabamorf-api-${var.env}-api"
  }

  tags = local.common_tags
}

# =============================================================================
# API Gateway 5XX Alarms — all APIs (Phase 1)
# =============================================================================

# TTS API Gateway 5XX (HTTP API — uses different metric namespace)
resource "aws_cloudwatch_metric_alarm" "merlin_api_5xx" {
  alarm_name          = "hak-${var.env}-merlin-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xx"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: merlin-api (TTS) 5XX errors — synthesis service broken"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiId = "${var.env}-merlin-api"
  }

  tags = local.common_tags
}

# Auth API Gateway 5XX
resource "aws_cloudwatch_metric_alarm" "tara_auth_5xx" {
  alarm_name          = "hak-${var.env}-tara-auth-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: tara-auth 5XX errors — authentication broken"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = "${var.env}-tara-auth"
    Stage   = var.env
  }

  tags = local.common_tags
}

# Morphology API Gateway 5XX
resource "aws_cloudwatch_metric_alarm" "vabamorf_api_5xx" {
  alarm_name          = "hak-${var.env}-vabamorf-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "CRITICAL: vabamorf-api 5XX errors — text analysis broken"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = "${var.env}-vabamorf-api"
    Stage   = var.env
  }

  tags = local.common_tags
}

# =============================================================================
# Synthesis Flow Alarms (Phase 1)
# =============================================================================

# DLQ Depth — messages that failed processing (audio lost for user)
resource "aws_cloudwatch_metric_alarm" "merlin_dlq_depth" {
  alarm_name          = "hak-${var.env}-merlin-dlq-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "CRITICAL: Merlin DLQ has messages — audio generation failed, user will not receive audio"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = "hak-merlin-${var.env}-dlq"
  }

  tags = local.common_tags
}

# SQS Message Age — messages stuck in queue too long
resource "aws_cloudwatch_metric_alarm" "merlin_sqs_age" {
  alarm_name          = "hak-${var.env}-merlin-sqs-age"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 300  # 5 minutes
  alarm_description   = "CRITICAL: Merlin SQS oldest message > 5 min — worker not processing, user waiting"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = "hak-merlin-${var.env}-queue"
  }

  tags = local.common_tags
}

# ECS Zero Tasks in Prod — workers completely dead
resource "aws_cloudwatch_metric_alarm" "merlin_ecs_zero_tasks" {
  count = var.env == "prod" ? 1 : 0

  alarm_name          = "hak-${var.env}-merlin-ecs-zero-tasks"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "RunningTaskCount"
  namespace           = "ECS/ContainerInsights"
  period              = 300
  statistic           = "Minimum"
  threshold           = 1
  alarm_description   = "CRITICAL: Merlin ECS has 0 running tasks in prod — no workers, audio generation impossible"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "breaching"

  dimensions = {
    ClusterName = "hak-merlin-${var.env}"
    ServiceName = "merlin-worker"
  }

  tags = local.common_tags
}

# =============================================================================
# Public API Hardening Alarms (PUB-6)
# =============================================================================

# SQS Queue Depth — warns when synthesis queue is backing up
resource "aws_cloudwatch_metric_alarm" "merlin_sqs_depth" {
  alarm_name          = "hak-${var.env}-merlin-sqs-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 50
  alarm_description   = "CRITICAL: Merlin SQS queue depth > 50 — possible abuse or stuck workers"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = "hak-merlin-${var.env}-queue"
  }

  tags = local.common_tags
}

# ECS Running Task Count — warns when at max capacity
resource "aws_cloudwatch_metric_alarm" "merlin_ecs_high_tasks" {
  alarm_name          = "hak-${var.env}-merlin-ecs-high-tasks"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "RunningTaskCount"
  namespace           = "ECS/ContainerInsights"
  period              = 300
  statistic           = "Maximum"
  threshold           = 2
  alarm_description   = "WARNING: Merlin ECS at max capacity — all workers busy"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = "hak-merlin-${var.env}"
    ServiceName = "merlin-worker"
  }

  tags = local.common_tags
}

# WAF Blocked Requests — monitors attack attempts
resource "aws_cloudwatch_metric_alarm" "waf_blocked_requests" {
  alarm_name          = "hak-${var.env}-waf-blocked-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = 300
  statistic           = "Sum"
  threshold           = 100
  alarm_description   = "WARNING: High rate of WAF blocked requests — possible attack"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    WebACL = "hak-${var.env}-waf"
    Region = "us-east-1"
    Rule   = "ALL"
  }

  tags = local.common_tags
}

# =============================================================================
# Outputs
# =============================================================================

output "sns_alerts_topic_arn" {
  description = "ARN of SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}
