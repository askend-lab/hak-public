# =============================================================================
# Vabamorf Morphology API Lambda — Docker-based (imported from Serverless CF stack)
# Code is deployed by CI/CD via `aws lambda update-function-code --image-uri`
# =============================================================================

resource "aws_iam_role" "morphology_lambda" {
  name = "vabamorf-api-${var.env}-${local.region}-lambdaRole"

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

resource "aws_iam_role_policy" "morphology_lambda" {
  name = "vabamorf-api-${var.env}-lambda"
  role = aws_iam_role.morphology_lambda.id

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
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/vabamorf-api-${var.env}*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/vabamorf-api-${var.env}*:*:*"
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

resource "aws_iam_role_policy_attachment" "morphology_lambda_vpc" {
  role       = aws_iam_role.morphology_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_lambda_function" "morphology_api" {
  function_name = "vabamorf-api-${var.env}-api"
  role          = aws_iam_role.morphology_lambda.arn
  package_type  = "Image"
  memory_size   = 1024
  timeout       = 30

  # Placeholder — image is deployed by CI/CD (aws lambda update-function-code --image-uri)
  image_uri = "${local.account_id}.dkr.ecr.${local.region}.amazonaws.com/vabamorf-api:placeholder"

  environment {
    variables = {
      VMETAJSON_PATH = "/var/task/vmetajson.bin"
      DICT_PATH      = "/var/task"
      AWS_LWA_PORT   = "8080"
      PORT           = "8080"
      ALLOWED_ORIGIN = local.allowed_origin
    }
  }

  tracing_config {
    mode = "Active"
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [
      image_uri,
      source_code_hash,
      filename,
      s3_bucket,
      s3_key,
      s3_object_version,
    ]
  }
}

resource "aws_cloudwatch_log_group" "morphology_api" {
  name              = "/aws/lambda/vabamorf-api-${var.env}-api"
  retention_in_days = 30
  tags              = local.common_tags
}
