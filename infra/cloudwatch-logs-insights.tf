# CloudWatch Logs Insights Saved Queries
# Pre-built queries for common debugging scenarios

# Lambda errors across all services
resource "aws_cloudwatch_query_definition" "lambda_errors" {
  name = "HAK/${var.env}/Lambda Errors (all services)"

  log_group_names = [
    "/aws/lambda/merlin-api-${var.env}-synthesize",
    "/aws/lambda/merlin-api-${var.env}-status",
    "/aws/lambda/merlin-api-${var.env}-health",
    "/aws/lambda/vabamorf-api-${var.env}-api",
    "/aws/lambda/simplestore-${var.env}-api",
    "/aws/lambda/tara-auth-${var.env}-taraStart",
    "/aws/lambda/tara-auth-${var.env}-taraCallback",
    "/aws/lambda/tara-auth-${var.env}-tokenRefresh",
    "/aws/lambda/tara-auth-${var.env}-health",
    "/aws/lambda/tara-auth-${var.env}-tokenExchange",
  ]

  query_string = <<-EOF
    fields @timestamp, @message, @logStream
    | filter @message like /(?i)(error|exception|timeout|ECONNREFUSED)/
    | sort @timestamp desc
    | limit 50
  EOF
}

# Synthesis flow — track a request from synthesize to status polling
resource "aws_cloudwatch_query_definition" "synthesis_flow" {
  name = "HAK/${var.env}/Synthesis Flow (by request)"

  log_group_names = [
    "/aws/lambda/merlin-api-${var.env}-synthesize",
    "/aws/lambda/merlin-api-${var.env}-status",
    "/ecs/hak-merlin-${var.env}",
  ]

  query_string = <<-EOF
    fields @timestamp, @message, @logStream
    | sort @timestamp desc
    | limit 100
  EOF
}

# Slow Lambda invocations (> 5 seconds)
resource "aws_cloudwatch_query_definition" "slow_lambdas" {
  name = "HAK/${var.env}/Slow Lambdas (>5s)"

  log_group_names = [
    "/aws/lambda/merlin-api-${var.env}-synthesize",
    "/aws/lambda/merlin-api-${var.env}-status",
    "/aws/lambda/vabamorf-api-${var.env}-api",
    "/aws/lambda/simplestore-${var.env}-api",
  ]

  query_string = <<-EOF
    filter @type = "REPORT"
    | fields @timestamp, @duration, @memorySize, @maxMemoryUsed, @logStream
    | filter @duration > 5000
    | sort @duration desc
    | limit 50
  EOF
}

# ECS Merlin worker logs — errors and warnings
resource "aws_cloudwatch_query_definition" "merlin_worker_errors" {
  name = "HAK/${var.env}/Merlin Worker Errors"

  log_group_names = [
    "/ecs/hak-merlin-${var.env}",
  ]

  query_string = <<-EOF
    fields @timestamp, @message
    | filter @message like /(?i)(error|exception|failed|panic|fatal)/
    | sort @timestamp desc
    | limit 50
  EOF
}

# Requests by X-Request-Id correlation ID
resource "aws_cloudwatch_query_definition" "by_request_id" {
  name = "HAK/${var.env}/Find by X-Request-Id"

  log_group_names = [
    "/aws/lambda/merlin-api-${var.env}-synthesize",
    "/aws/lambda/merlin-api-${var.env}-status",
    "/aws/lambda/vabamorf-api-${var.env}-api",
    "/aws/lambda/simplestore-${var.env}-api",
    "/aws/lambda/tara-auth-${var.env}-taraStart",
    "/aws/lambda/tara-auth-${var.env}-taraCallback",
  ]

  query_string = <<-EOF
    fields @timestamp, @message, @logStream
    | filter @message like /REPLACE_WITH_REQUEST_ID/
    | sort @timestamp asc
    | limit 100
  EOF
}

# Slack notifier Lambda — delivery failures
resource "aws_cloudwatch_query_definition" "slack_notifier_errors" {
  name = "HAK/${var.env}/Slack Notifier Errors"

  log_group_names = [
    "/aws/lambda/hak-slack-notifier-${var.env}",
  ]

  query_string = <<-EOF
    fields @timestamp, @message
    | filter @message like /(?i)(error|exception|runtime|failed|webhook)/
    | sort @timestamp desc
    | limit 25
  EOF
}
