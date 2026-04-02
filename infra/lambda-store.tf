# =============================================================================
# SimpleStore Lambda — CRUD API for user tasks (imported from Serverless CF stack)
# Code is deployed by CI/CD via `aws lambda update-function-code`
# =============================================================================

resource "aws_iam_role" "store_lambda" {
  name = "simplestore-${var.env}-${local.region}-lambdaRole"

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

resource "aws_iam_role_policy" "store_lambda" {
  name = "simplestore-${var.env}-lambda"
  role = aws_iam_role.store_lambda.id

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
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/simplestore-${var.env}*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/simplestore-${var.env}*:*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.simplestore.arn
        ]
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


resource "aws_lambda_function" "store_api" {
  function_name = "simplestore-${var.env}-api"
  role          = aws_iam_role.store_lambda.arn
  handler       = "src/lambda/handler.handler"
  runtime       = "nodejs22.x"
  memory_size   = 512
  timeout       = 10

  # Placeholder — code is deployed by CI/CD (aws lambda update-function-code)
  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = {
      TABLE_NAME     = "simplestore-${var.env}"
      APP_NAME       = "simplestore"
      TENANT         = "default"
      ENVIRONMENT    = var.env
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
      s3_bucket,
      s3_key,
      s3_object_version,
      image_uri,
    ]
  }
}

resource "aws_cloudwatch_log_group" "store_api" {
  name              = "/aws/lambda/simplestore-${var.env}-api"
  retention_in_days = 30
  tags              = local.common_tags
}

# =============================================================================
# DynamoDB Table — task storage (imported from Serverless CF stack)
# =============================================================================

resource "aws_dynamodb_table" "simplestore" {
  name         = "simplestore-${var.env}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = local.common_tags
}
