# Slack Notifications via Lambda
# SNS → Lambda → Slack Webhook

# =============================================================================
# Lambda Function for Slack Notifications
# =============================================================================

data "archive_file" "slack_notifier" {
  type        = "zip"
  output_path = "${path.module}/lambda/slack-notifier.zip"
  
  source {
    content  = <<-EOF
import json
import urllib.request
import os

def handler(event, context):
    webhook_url = os.environ.get('SLACK_WEBHOOK_URL')
    if not webhook_url:
        raise RuntimeError("SLACK_WEBHOOK_URL not set — alerting is broken")
    
    for record in event.get('Records', []):
        message = record.get('Sns', {}).get('Message', '')
        subject = record.get('Sns', {}).get('Subject', 'AWS Alert')
        
        # Parse CloudWatch alarm message
        try:
            alarm = json.loads(message)
            alarm_name = alarm.get('AlarmName', 'Unknown')
            state = alarm.get('NewStateValue', 'Unknown')
            reason = alarm.get('NewStateReason', '')
            
            # Color based on state
            color = '#ff0000' if state == 'ALARM' else '#00ff00'
            emoji = '🚨' if state == 'ALARM' else '✅'
            
            slack_message = {
                'attachments': [{
                    'color': color,
                    'title': f"{emoji} {alarm_name}",
                    'text': f"*State:* {state}\n*Reason:* {reason}",
                    'footer': 'HAK Monitoring',
                    'mrkdwn_in': ['text']
                }]
            }
        except json.JSONDecodeError:
            slack_message = {
                'text': f"*{subject}*\n{message}"
            }
        
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(slack_message).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        # Raise on failure — Lambda error metric fires, SNS retries
        response = urllib.request.urlopen(req)
        if response.status != 200:
            raise RuntimeError(f"Slack webhook returned {response.status}")
    
    return {'statusCode': 200, 'body': 'OK'}
EOF
    filename = "index.py"
  }
}

resource "aws_lambda_function" "slack_notifier" {
  filename         = data.archive_file.slack_notifier.output_path
  function_name    = "hak-slack-notifier-${var.env}"
  role             = aws_iam_role.slack_notifier.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.slack_notifier.output_base64sha256
  runtime          = "python3.12"
  timeout          = 10
  
  environment {
    variables = {
      SLACK_WEBHOOK_URL = var.slack_webhook_url
    }
  }
  
  tags = local.common_tags
}

resource "aws_iam_role" "slack_notifier" {
  name = "hak-slack-notifier-${var.env}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "slack_notifier_logs" {
  role       = aws_iam_role.slack_notifier.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# =============================================================================
# SNS → Lambda Subscription
# =============================================================================

resource "aws_sns_topic_subscription" "slack" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.slack_notifier.arn
}

resource "aws_lambda_permission" "sns" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.slack_notifier.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.alerts.arn
}
