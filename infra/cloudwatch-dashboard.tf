# CloudWatch Dashboard for HAK Application Monitoring
# Row 0: Alarm Status (green/red timeline)
# Row 1: System Activity (CloudFront, WAF)
# Row 2: Synthesis — audio generation (merlin-api, SQS, DLQ, ECS)
# Row 3: Morphology — text analysis (vabamorf-api)
# Row 4: Store + Auth + DynamoDB + WAF

resource "aws_cloudwatch_dashboard" "hak_activity" {
  dashboard_name = "hak-activity-${var.env}"

  dashboard_body = jsonencode({
    widgets = [
      # =========================================================================
      # Row 0: System Health — Alarm Status Timeline
      # =========================================================================
      {
        type   = "alarm"
        x      = 0
        y      = 0
        width  = 24
        height = 3
        properties = {
          title  = "System Health"
          alarms = [
            aws_cloudwatch_metric_alarm.api_5xx_errors.arn,
            aws_cloudwatch_metric_alarm.merlin_api_lambda_errors.arn,
            aws_cloudwatch_metric_alarm.merlin_api_status_lambda_errors.arn,
            aws_cloudwatch_metric_alarm.vabamorf_api_lambda_errors.arn,
            aws_cloudwatch_metric_alarm.lambda_errors.arn,
            aws_cloudwatch_metric_alarm.merlin_dlq_depth.arn,
            aws_cloudwatch_metric_alarm.merlin_sqs_depth.arn,
            aws_cloudwatch_metric_alarm.merlin_sqs_age.arn,
            aws_cloudwatch_metric_alarm.merlin_ecs_high_tasks.arn,
            aws_cloudwatch_metric_alarm.dynamodb_throttling.arn,
            aws_cloudwatch_metric_alarm.waf_blocked_requests.arn,
            aws_cloudwatch_metric_alarm.merlin_api_5xx.arn,
            aws_cloudwatch_metric_alarm.tara_auth_5xx.arn,
            aws_cloudwatch_metric_alarm.vabamorf_api_5xx.arn,
          ]
        }
      },

      # =========================================================================
      # Row 1: System Activity
      # =========================================================================
      {
        type   = "text"
        x      = 0
        y      = 3
        width  = 24
        height = 1
        properties = {
          markdown = "## System Activity"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 4
        width  = 8
        height = 6
        properties = {
          title  = "CloudFront Requests (all traffic)"
          region = "us-east-1"
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 4
        width  = 8
        height = 6
        properties = {
          title  = "CloudFront Error Rate"
          region = "us-east-1"
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global", { stat = "Average", period = 300 }],
            ["AWS/CloudFront", "5xxErrorRate", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global", { stat = "Average", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 4
        width  = 8
        height = 6
        properties = {
          title   = "WAF Blocked Requests"
          region  = "us-east-1"
          metrics = [
            ["AWS/WAFV2", "BlockedRequests", "WebACL", "hak-${var.env}-waf", "Region", "us-east-1", "Rule", "ALL", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },

      # =========================================================================
      # Row 2: Synthesis (audio generation) — most important
      # =========================================================================
      {
        type   = "text"
        x      = 0
        y      = 10
        width  = 24
        height = 1
        properties = {
          markdown = "## Synthesis (Audio Generation)"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 11
        width  = 6
        height = 6
        properties = {
          title  = "Synthesis Requests"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "merlin-api-${var.env}-synthesize", { stat = "Sum", period = 300, label = "synthesize" }],
            ["AWS/Lambda", "Invocations", "FunctionName", "merlin-api-${var.env}-status", { stat = "Sum", period = 300, label = "status poll" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 6
        y      = 11
        width  = 6
        height = 6
        properties = {
          title  = "SQS Queue Depth"
          region = local.region
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "hak-merlin-${var.env}-queue", { stat = "Maximum", period = 60, label = "waiting" }],
            ["AWS/SQS", "ApproximateNumberOfMessagesNotVisible", "QueueName", "hak-merlin-${var.env}-queue", { stat = "Maximum", period = 60, label = "in-flight" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 11
        width  = 6
        height = 6
        properties = {
          title  = "DLQ Depth (failed generations)"
          region = local.region
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "hak-merlin-${var.env}-dlq", { stat = "Maximum", period = 60, color = "#d62728" }]
          ]
          view   = "timeSeries"
          yAxis  = { left = { min = 0 } }
        }
      },
      {
        type   = "metric"
        x      = 18
        y      = 11
        width  = 6
        height = 6
        properties = {
          title  = "ECS Workers (target: 1)"
          region = local.region
          metrics = [
            ["ECS/ContainerInsights", "RunningTaskCount", "ClusterName", "hak-merlin-${var.env}", "ServiceName", "merlin-worker", { stat = "Average", period = 60 }]
          ]
          view   = "timeSeries"
          yAxis  = { left = { min = 0, max = 3 } }
        }
      },

      # =========================================================================
      # Row 3: Morphology (text analysis)
      # =========================================================================
      {
        type   = "text"
        x      = 0
        y      = 17
        width  = 24
        height = 1
        properties = {
          markdown = "## Morphology (Text Analysis)"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 18
        width  = 8
        height = 6
        properties = {
          title  = "Vabamorf Invocations"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "vabamorf-api-${var.env}-api", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 18
        width  = 8
        height = 6
        properties = {
          title  = "Vabamorf Errors"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "vabamorf-api-${var.env}-api", { stat = "Sum", period = 300, color = "#d62728" }]
          ]
          view   = "timeSeries"
          yAxis  = { left = { min = 0 } }
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 18
        width  = 8
        height = 6
        properties = {
          title  = "Vabamorf Duration (ms)"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "vabamorf-api-${var.env}-api", { stat = "Average", period = 300, label = "avg" }],
            ["AWS/Lambda", "Duration", "FunctionName", "vabamorf-api-${var.env}-api", { stat = "p99", period = 300, label = "p99" }]
          ]
          view = "timeSeries"
        }
      },

      # =========================================================================
      # Row 4: Store + Auth + DynamoDB
      # =========================================================================
      {
        type   = "text"
        x      = 0
        y      = 24
        width  = 24
        height = 1
        properties = {
          markdown = "## Store, Auth & Infrastructure"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 25
        width  = 6
        height = 6
        properties = {
          title  = "SimpleStore"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "simplestore-${var.env}-api", { stat = "Sum", period = 300, label = "invocations" }],
            ["AWS/Lambda", "Errors", "FunctionName", "simplestore-${var.env}-api", { stat = "Sum", period = 300, label = "errors", color = "#d62728" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 6
        y      = 25
        width  = 6
        height = 6
        properties = {
          title  = "Auth (TARA)"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "tara-auth-${var.env}-taraStart", { stat = "Sum", period = 300, label = "start" }],
            ["AWS/Lambda", "Invocations", "FunctionName", "tara-auth-${var.env}-taraCallback", { stat = "Sum", period = 300, label = "callback" }],
            ["AWS/Lambda", "Invocations", "FunctionName", "tara-auth-${var.env}-tokenRefresh", { stat = "Sum", period = 300, label = "refresh" }],
            ["AWS/Lambda", "Errors", "FunctionName", "tara-auth-${var.env}-taraStart", { stat = "Sum", period = 300, label = "start errors", color = "#d62728" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 25
        width  = 6
        height = 6
        properties = {
          title  = "DynamoDB Capacity"
          region = local.region
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "simplestore-${var.env}", { stat = "Sum", period = 300, label = "reads" }],
            ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", "simplestore-${var.env}", { stat = "Sum", period = 300, label = "writes" }],
            ["AWS/DynamoDB", "ThrottledRequests", "TableName", "simplestore-${var.env}", { stat = "Sum", period = 300, label = "throttled", color = "#d62728" }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 18
        y      = 25
        width  = 6
        height = 6
        properties = {
          title  = "CloudFront Bandwidth"
          region = "us-east-1"
          metrics = [
            ["AWS/CloudFront", "BytesDownloaded", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      }
    ]
  })
}

output "cloudwatch_dashboard_url" {
  description = "URL to CloudWatch Dashboard"
  value       = "https://${local.region}.console.aws.amazon.com/cloudwatch/home?region=${local.region}#dashboards:name=hak-activity-${var.env}"
}
