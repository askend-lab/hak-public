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

# =============================================================================
# Cross-region SNS relay — us-east-1 SNS + Lambda for health check alerts
# Route53 metrics only exist in us-east-1, so alarms must be there too.
# We deploy a minimal Slack notifier Lambda in us-east-1 to forward alerts.
# =============================================================================

#tfsec:ignore:AVD-AWS-0136
resource "aws_sns_topic" "alerts_us_east_1" {
  provider          = aws.us_east_1
  name              = "hak-alerts-${var.env}-health"
  kms_master_key_id = "alias/aws/sns"
  tags              = local.common_tags
}

data "archive_file" "health_notifier" {
  type        = "zip"
  output_path = "${path.module}/lambda/health-notifier.zip"
  source {
    content  = <<-PYEOF
import json, urllib.request, os

def handler(event, context):
    url = os.environ.get('SLACK_WEBHOOK_URL')
    if not url:
        raise RuntimeError("SLACK_WEBHOOK_URL not set")
    for rec in event.get('Records', []):
        msg = rec.get('Sns', {}).get('Message', '')
        try:
            a = json.loads(msg)
            name, state = a.get('AlarmName','?'), a.get('NewStateValue','?')
            reason = a.get('NewStateReason','')
            color = '#ff0000' if state == 'ALARM' else '#00ff00'
            emoji = '\U0001f6a8' if state == 'ALARM' else '\u2705'
            body = {'attachments': [{'color': color, 'title': f"{emoji} {name}", 'text': f"*State:* {state}\n*Reason:* {reason}", 'footer': 'HAK Health', 'mrkdwn_in': ['text']}]}
        except json.JSONDecodeError:
            body = {'text': msg}
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
        resp = urllib.request.urlopen(req)
        if resp.status != 200:
            raise RuntimeError(f"Slack returned {resp.status}")
    return {'statusCode': 200}
PYEOF
    filename = "index.py"
  }
}

resource "aws_lambda_function" "health_notifier" {
  provider         = aws.us_east_1
  filename         = data.archive_file.health_notifier.output_path
  function_name    = "hak-health-notifier-${var.env}"
  role             = aws_iam_role.health_notifier.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.health_notifier.output_base64sha256
  runtime          = "python3.12"
  timeout          = 10
  environment {
    variables = { SLACK_WEBHOOK_URL = var.slack_webhook_url }
  }
  tags = local.common_tags
}

resource "aws_iam_role" "health_notifier" {
  provider = aws.us_east_1
  name     = "hak-health-notifier-${var.env}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" } }]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "health_notifier_logs" {
  provider   = aws.us_east_1
  role       = aws_iam_role.health_notifier.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_sns_topic_subscription" "health_slack" {
  provider  = aws.us_east_1
  topic_arn = aws_sns_topic.alerts_us_east_1.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.health_notifier.arn
}

resource "aws_lambda_permission" "health_sns" {
  provider      = aws.us_east_1
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health_notifier.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.alerts_us_east_1.arn
}

# =============================================================================
# CloudWatch Alarms for Health Checks (us-east-1)
# =============================================================================

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
  alarm_actions       = [aws_sns_topic.alerts_us_east_1.arn]
  ok_actions          = [aws_sns_topic.alerts_us_east_1.arn]
  dimensions          = { HealthCheckId = aws_route53_health_check.frontend.id }
  tags                = local.common_tags
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
  alarm_actions       = [aws_sns_topic.alerts_us_east_1.arn]
  ok_actions          = [aws_sns_topic.alerts_us_east_1.arn]
  dimensions          = { HealthCheckId = aws_route53_health_check.backend_api.id }
  tags                = local.common_tags
}
