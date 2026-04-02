# =============================================================================
# Merlin TTS API Lambdas — synthesis, status, health (imported from Serverless CF stack)
# Code is deployed by CI/CD via `aws lambda update-function-code`
# =============================================================================

resource "aws_iam_role" "tts_lambda" {
  name = "merlin-api-${var.env}-${local.region}-lambdaRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "tts_lambda" {
  name = "${var.env}-merlin-api-lambda"
  role = aws_iam_role.tts_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:CreateLogGroup",
          "logs:TagResource"
        ]
        Resource = [
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/merlin-api-${var.env}*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/merlin-api-${var.env}*:*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueUrl",
          "sqs:GetQueueAttributes"
        ]
        Resource = "arn:aws:sqs:${local.region}:${local.account_id}:hak-merlin-${var.env}-queue"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:HeadObject"
        ]
        Resource = "arn:aws:s3:::hak-merlin-${var.env}-audio/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = "arn:aws:s3:::hak-merlin-${var.env}-audio"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices"
        ]
        Resource = "arn:aws:ecs:${local.region}:${local.account_id}:service/hak-merlin-${var.env}/merlin-worker"
      },
      {
        Effect   = "Allow"
        Action   = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ]
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "tts_lambda_vpc" {
  role       = aws_iam_role.tts_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# --- Lambda Functions ---

resource "aws_lambda_function" "tts_synthesize" {
  function_name = "merlin-api-${var.env}-synthesize"
  role          = aws_iam_role.tts_lambda.arn
  handler       = "src/handler.synthesize"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 30

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = {
      SQS_QUEUE_URL  = "https://sqs.${local.region}.amazonaws.com/${local.account_id}/hak-merlin-${var.env}-queue"
      S3_BUCKET      = "hak-merlin-${var.env}-audio"
      ALLOWED_ORIGIN = local.allowed_origin
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      last_modified,
      s3_bucket,
      s3_key,
      s3_object_version,
      image_uri,
      publish,
      qualified_arn,
      version,
    ]
  }
}

resource "aws_lambda_function" "tts_status" {
  function_name = "merlin-api-${var.env}-status"
  role          = aws_iam_role.tts_lambda.arn
  handler       = "src/handler.status"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 10

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = {
      SQS_QUEUE_URL  = "https://sqs.${local.region}.amazonaws.com/${local.account_id}/hak-merlin-${var.env}-queue"
      S3_BUCKET      = "hak-merlin-${var.env}-audio"
      ALLOWED_ORIGIN = local.allowed_origin
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      last_modified,
      s3_bucket,
      s3_key,
      s3_object_version,
      image_uri,
      publish,
      qualified_arn,
      version,
    ]
  }
}

resource "aws_lambda_function" "tts_health" {
  function_name = "merlin-api-${var.env}-health"
  role          = aws_iam_role.tts_lambda.arn
  handler       = "src/handler.health"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 5

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = {
      SQS_QUEUE_URL  = "https://sqs.${local.region}.amazonaws.com/${local.account_id}/hak-merlin-${var.env}-queue"
      S3_BUCKET      = "hak-merlin-${var.env}-audio"
      ALLOWED_ORIGIN = local.allowed_origin
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      last_modified,
      s3_bucket,
      s3_key,
      s3_object_version,
      image_uri,
      publish,
      qualified_arn,
      version,
    ]
  }
}

# --- CloudWatch Log Groups ---

resource "aws_cloudwatch_log_group" "tts_synthesize" {
  name              = "/aws/lambda/merlin-api-${var.env}-synthesize"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "tts_status" {
  name              = "/aws/lambda/merlin-api-${var.env}-status"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "tts_health" {
  name              = "/aws/lambda/merlin-api-${var.env}-health"
  retention_in_days = 30
  tags              = local.common_tags
}
