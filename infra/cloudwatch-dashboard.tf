# CloudWatch Dashboard for HAK Application Monitoring
# Monitors Lambda functions, API Gateway, DynamoDB, and CloudFront

resource "aws_cloudwatch_dashboard" "hak_activity" {
  dashboard_name = "hak-activity-${var.env}"

  dashboard_body = jsonencode({
    widgets = [
      # Row 1: API Gateway Metrics
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# HAK Application Activity Dashboard - ${upper(var.env)}"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "API Gateway Requests"
          region = local.region
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", "hak-api-${var.env}", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "API Gateway Latency"
          region = local.region
          metrics = [
            ["AWS/ApiGateway", "Latency", "ApiName", "hak-api-${var.env}", { stat = "Average", period = 300 }],
            ["AWS/ApiGateway", "Latency", "ApiName", "hak-api-${var.env}", { stat = "p99", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "API Gateway Errors"
          region = local.region
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiName", "hak-api-${var.env}", { stat = "Sum", period = 300 }],
            ["AWS/ApiGateway", "5XXError", "ApiName", "hak-api-${var.env}", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      # Row 2: ECS/Fargate Metrics
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 8
        height = 6
        properties = {
          title  = "Fargate Running Tasks"
          region = local.region
          metrics = [
            ["AWS/ECS", "RunningTaskCount", "ClusterName", "hak-merlin-${var.env}", "ServiceName", "merlin-worker", { stat = "Average", period = 60 }]
          ]
          view = "timeSeries"
        }
      },
      # Row 3: Lambda Metrics
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 8
        height = 6
        properties = {
          title  = "Lambda Invocations"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "simplestore-${var.env}-api", { stat = "Sum", period = 300 }],
            ["AWS/Lambda", "Invocations", "FunctionName", "hak-audio-${var.env}-synthesize", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 13
        width  = 8
        height = 6
        properties = {
          title  = "Lambda Duration"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "simplestore-${var.env}-api", { stat = "Average", period = 300 }],
            ["AWS/Lambda", "Duration", "FunctionName", "hak-audio-${var.env}-synthesize", { stat = "Average", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 13
        width  = 8
        height = 6
        properties = {
          title  = "Lambda Errors"
          region = local.region
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "simplestore-${var.env}-api", { stat = "Sum", period = 300 }],
            ["AWS/Lambda", "Errors", "FunctionName", "hak-audio-${var.env}-synthesize", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      # Row 4: DynamoDB Metrics
      {
        type   = "metric"
        x      = 0
        y      = 19
        width  = 12
        height = 6
        properties = {
          title  = "DynamoDB Read/Write Capacity"
          region = local.region
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "single-table-lambda-${var.env}", { stat = "Sum", period = 300 }],
            ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", "single-table-lambda-${var.env}", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 19
        width  = 12
        height = 6
        properties = {
          title  = "DynamoDB Throttled Requests"
          region = local.region
          metrics = [
            ["AWS/DynamoDB", "ThrottledRequests", "TableName", "single-table-lambda-${var.env}", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      # Row 5: CloudFront Metrics
      {
        type   = "metric"
        x      = 0
        y      = 25
        width  = 8
        height = 6
        properties = {
          title  = "CloudFront Requests"
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
        y      = 25
        width  = 8
        height = 6
        properties = {
          title  = "CloudFront Bytes Downloaded"
          region = "us-east-1"
          metrics = [
            ["AWS/CloudFront", "BytesDownloaded", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global", { stat = "Sum", period = 300 }]
          ]
          view = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 25
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
      }
    ]
  })
}

output "cloudwatch_dashboard_url" {
  description = "URL to CloudWatch Dashboard"
  value       = "https://${local.region}.console.aws.amazon.com/cloudwatch/home?region=${local.region}#dashboards:name=hak-activity-${var.env}"
}
