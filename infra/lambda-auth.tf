# =============================================================================
# TARA Auth Lambdas — authentication flow (imported from Serverless CF stack)
# Code is deployed by CI/CD via `aws lambda update-function-code`
# =============================================================================

resource "aws_iam_role" "auth_lambda" {
  name = "tara-auth-${var.env}-${local.region}-lambdaRole"

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

resource "aws_iam_role_policy" "auth_lambda" {
  name = "tara-auth-${var.env}-lambda"
  role = aws_iam_role.auth_lambda.id

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
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/tara-auth-${var.env}*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/tara-auth-${var.env}*:*:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminInitiateAuth",
          "cognito-idp:AdminRespondToAuthChallenge",
          "cognito-idp:ListUsers"
        ]
        Resource = [
          "arn:aws:cognito-idp:${local.region}:${local.account_id}:userpool/${data.aws_ssm_parameter.cognito_user_pool_id.value}"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = [
          "arn:aws:ssm:${local.region}:${local.account_id}:parameter/hak/*"
        ]
      },
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = [
          "arn:aws:secretsmanager:${local.region}:${local.account_id}:secret:hak/*",
          "arn:aws:secretsmanager:${local.region}:${local.account_id}:secret:askend-lab/*"
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


# --- Lambda Functions ---
# All auth functions share the same IAM role, VPC config, and env vars
# Exception: cognitoTriggers has no VPC (only processes Cognito events)

locals {
  auth_env_vars = {
    TARA_ISSUER        = local.tara_issuer
    TARA_SECRETS_ARN   = data.aws_ssm_parameter.tara_secrets_arn.value
    COGNITO_USER_POOL_ID = data.aws_ssm_parameter.cognito_user_pool_id.value
    COGNITO_CLIENT_ID  = data.aws_ssm_parameter.cognito_client_id.value
    FRONTEND_URL_DEV   = data.aws_ssm_parameter.frontend_url_dev.value
    FRONTEND_URL_PROD  = data.aws_ssm_parameter.frontend_url_prod.value
    STAGE              = var.env
    ALLOWED_ORIGIN     = "${data.aws_ssm_parameter.frontend_url.value}${var.env == "prod" ? ",https://haaldusabiline.eki.ee" : ""}"
    CUSTOM_FRONTEND_URL = local.custom_frontend
    COGNITO_DOMAIN     = data.aws_ssm_parameter.cognito_domain.value
  }

  auth_vpc_config = {
    security_group_ids = [data.aws_ssm_parameter.lambda_security_group_id.value]
    subnet_ids = [
      data.aws_ssm_parameter.private_subnet_id_1.value,
      data.aws_ssm_parameter.private_subnet_id_2.value
    ]
  }
}

resource "aws_lambda_function" "auth_tara_start" {
  function_name = "tara-auth-${var.env}-taraStart"
  role          = aws_iam_role.auth_lambda.arn
  handler       = "src/handler.startHandler"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 15

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = local.auth_env_vars
  }

  vpc_config {
    security_group_ids = local.auth_vpc_config.security_group_ids
    subnet_ids         = local.auth_vpc_config.subnet_ids
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

resource "aws_lambda_function" "auth_tara_callback" {
  function_name = "tara-auth-${var.env}-taraCallback"
  role          = aws_iam_role.auth_lambda.arn
  handler       = "src/handler.callbackHandler"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 15

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = local.auth_env_vars
  }

  vpc_config {
    security_group_ids = local.auth_vpc_config.security_group_ids
    subnet_ids         = local.auth_vpc_config.subnet_ids
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

resource "aws_lambda_function" "auth_token_refresh" {
  function_name = "tara-auth-${var.env}-tokenRefresh"
  role          = aws_iam_role.auth_lambda.arn
  handler       = "src/handler.refreshHandler"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 15

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = local.auth_env_vars
  }

  vpc_config {
    security_group_ids = local.auth_vpc_config.security_group_ids
    subnet_ids         = local.auth_vpc_config.subnet_ids
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

resource "aws_lambda_function" "auth_health" {
  function_name = "tara-auth-${var.env}-health"
  role          = aws_iam_role.auth_lambda.arn
  handler       = "src/handler.healthHandler"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 15

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = local.auth_env_vars
  }

  vpc_config {
    security_group_ids = local.auth_vpc_config.security_group_ids
    subnet_ids         = local.auth_vpc_config.subnet_ids
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

resource "aws_lambda_function" "auth_token_exchange" {
  function_name = "tara-auth-${var.env}-tokenExchange"
  role          = aws_iam_role.auth_lambda.arn
  handler       = "src/handler.exchangeCodeHandler"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 15

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = local.auth_env_vars
  }

  vpc_config {
    security_group_ids = local.auth_vpc_config.security_group_ids
    subnet_ids         = local.auth_vpc_config.subnet_ids
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

# cognitoTriggers: No VPC — only processes Cognito custom auth events
resource "aws_lambda_function" "auth_cognito_triggers" {
  function_name = "tara-auth-${var.env}-cognitoTriggers"
  role          = aws_iam_role.auth_lambda.arn
  handler       = "src/cognito-triggers.handler"
  runtime       = "nodejs22.x"
  memory_size   = 1024
  timeout       = 15

  filename = data.archive_file.lambda_placeholder.output_path

  environment {
    variables = local.auth_env_vars
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

# --- CloudWatch Log Groups ---

resource "aws_cloudwatch_log_group" "auth_tara_start" {
  name              = "/aws/lambda/tara-auth-${var.env}-taraStart"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "auth_tara_callback" {
  name              = "/aws/lambda/tara-auth-${var.env}-taraCallback"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "auth_token_refresh" {
  name              = "/aws/lambda/tara-auth-${var.env}-tokenRefresh"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "auth_health" {
  name              = "/aws/lambda/tara-auth-${var.env}-health"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "auth_token_exchange" {
  name              = "/aws/lambda/tara-auth-${var.env}-tokenExchange"
  retention_in_days = 30
  tags              = local.common_tags
}

resource "aws_cloudwatch_log_group" "auth_cognito_triggers" {
  name              = "/aws/lambda/tara-auth-${var.env}-cognitoTriggers"
  retention_in_days = 30
  tags              = local.common_tags
}
