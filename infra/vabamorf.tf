# Vabamorf API Lambda with Lambda Web Adapter
# Uses Debian-based container with pre-built vmetajson binary

locals {
  vabamorf_function_name = "vabamorf-api-${var.env}"
  vabamorf_image_tag     = "latest"
}

# Reference existing ECR repository (created in ecr.tf)
data "aws_ecr_repository" "vabamorf_api" {
  name = "vabamorf-api"
}

# Lambda function using container image
resource "aws_lambda_function" "vabamorf_api" {
  function_name = local.vabamorf_function_name
  role          = aws_iam_role.vabamorf_lambda.arn
  package_type  = "Image"
  image_uri     = "${data.aws_ecr_repository.vabamorf_api.repository_url}:${local.vabamorf_image_tag}"
  timeout       = 30
  memory_size   = 1024

  environment {
    variables = {
      VMETAJSON_PATH = "/var/task/vmetajson.bin"
      DICT_PATH      = "/var/task"
      AWS_LWA_PORT   = "8080"
      PORT           = "8080"
    }
  }

  tags = merge(local.common_tags, {
    Service = "vabamorf-api"
  })
}

# IAM role for Lambda
resource "aws_iam_role" "vabamorf_lambda" {
  name = "vabamorf-lambda-${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Attach basic execution role
resource "aws_iam_role_policy_attachment" "vabamorf_lambda_basic" {
  role       = aws_iam_role.vabamorf_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function URL (simpler than API Gateway for single-function APIs)
resource "aws_lambda_function_url" "vabamorf_api" {
  function_name      = aws_lambda_function.vabamorf_api.function_name
  authorization_type = "NONE"

  cors {
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST", "OPTIONS"]
    allow_headers     = ["Content-Type"]
    max_age           = 86400
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "vabamorf_api" {
  name              = "/aws/lambda/${local.vabamorf_function_name}"
  retention_in_days = 14

  tags = local.common_tags
}

# Outputs
output "vabamorf_api_url" {
  description = "Vabamorf API Lambda Function URL"
  value       = aws_lambda_function_url.vabamorf_api.function_url
}

output "vabamorf_function_name" {
  description = "Vabamorf Lambda function name"
  value       = aws_lambda_function.vabamorf_api.function_name
}
