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
# Outputs
# =============================================================================

output "sns_alerts_topic_arn" {
  description = "ARN of SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}
