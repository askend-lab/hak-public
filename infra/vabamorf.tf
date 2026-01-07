# Vabamorf API Lambda with Lambda Web Adapter + API Gateway + Custom Domain
# Uses Debian-based container with pre-built vmetajson binary

variable "vabamorf_image_tag" {
  description = "Docker image tag for vabamorf Lambda"
  type        = string
  default     = "latest"
}

locals {
  vabamorf_function_name = "vabamorf-api-${var.env}"
  vabamorf_image_tag     = var.vabamorf_image_tag
  vabamorf_domain_name   = var.env == "prod" ? "vabamorf.askend-lab.com" : "vabamorf-${var.env}.askend-lab.com"
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

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "vabamorf_api" {
  name              = "/aws/lambda/${local.vabamorf_function_name}"
  retention_in_days = 14

  tags = local.common_tags
}

# API Gateway HTTP API (v2) - simpler and cheaper than REST API
resource "aws_apigatewayv2_api" "vabamorf" {
  name          = "vabamorf-api-${var.env}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 86400
  }

  tags = local.common_tags
}

# Lambda integration
resource "aws_apigatewayv2_integration" "vabamorf" {
  api_id             = aws_apigatewayv2_api.vabamorf.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.vabamorf_api.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

# Catch-all route
resource "aws_apigatewayv2_route" "vabamorf" {
  api_id    = aws_apigatewayv2_api.vabamorf.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.vabamorf.id}"
}

# Default stage with auto-deploy
resource "aws_apigatewayv2_stage" "vabamorf" {
  api_id      = aws_apigatewayv2_api.vabamorf.id
  name        = "$default"
  auto_deploy = true

  tags = local.common_tags
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "vabamorf_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.vabamorf_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.vabamorf.execution_arn}/*/*"
}

# Custom domain
resource "aws_apigatewayv2_domain_name" "vabamorf" {
  domain_name = local.vabamorf_domain_name

  domain_name_configuration {
    certificate_arn = local.wildcard_cert_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = local.common_tags
}

# API mapping to custom domain
resource "aws_apigatewayv2_api_mapping" "vabamorf" {
  api_id      = aws_apigatewayv2_api.vabamorf.id
  domain_name = aws_apigatewayv2_domain_name.vabamorf.id
  stage       = aws_apigatewayv2_stage.vabamorf.id
}

# Route53 record for custom domain
resource "aws_route53_record" "vabamorf" {
  zone_id = data.terraform_remote_state.infra.outputs.route53_zone_id
  name    = local.vabamorf_domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.vabamorf.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.vabamorf.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# Outputs
output "vabamorf_api_url" {
  description = "Vabamorf API custom domain URL"
  value       = "https://${local.vabamorf_domain_name}"
}

output "vabamorf_api_gateway_url" {
  description = "Vabamorf API Gateway URL (direct)"
  value       = aws_apigatewayv2_api.vabamorf.api_endpoint
}

output "vabamorf_function_name" {
  description = "Vabamorf Lambda function name"
  value       = aws_lambda_function.vabamorf_api.function_name
}
