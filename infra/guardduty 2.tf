# AWS GuardDuty — threat detection
# Monitors for compromised credentials, unusual API calls, crypto mining, etc.
# GuardDuty is per-account, not per-environment — only create in dev (both envs share one AWS account)

resource "aws_guardduty_detector" "main" {
  count  = var.env == "dev" ? 1 : 0
  enable = true

  datasources {
    s3_logs {
      enable = true
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-guardduty"
  })
}

# EventBridge rule to forward GuardDuty findings to SNS → Slack
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  count       = var.env == "dev" ? 1 : 0
  name        = "${local.app_name}-guardduty-findings"
  description = "Forward GuardDuty findings to SNS for Slack notification"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
  })

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "guardduty_to_sns" {
  count     = var.env == "dev" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.guardduty_findings[0].name
  target_id = "guardduty-to-sns"
  arn       = aws_sns_topic.alerts.arn
}

resource "aws_sns_topic_policy" "alerts_eventbridge" {
  count  = var.env == "dev" ? 1 : 0
  arn    = aws_sns_topic.alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEventBridgePublish"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.alerts.arn
      }
    ]
  })
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID (only created in dev)"
  value       = var.env == "dev" ? aws_guardduty_detector.main[0].id : "n/a"
}
