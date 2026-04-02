# =============================================================================
# TARA Auth API — REST API v1 (replaces Serverless CF stack API Gateway)
# Routes: GET /tara/start, GET /tara/callback, POST /tara/refresh,
#         GET /tara/health, POST /tara/exchange
# Note: cognitoTriggers Lambda is invoked by Cognito, not API Gateway
# =============================================================================

resource "aws_api_gateway_rest_api" "auth" {
  name = "${var.env}-tara-auth"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# --- Resources (paths): /tara, /tara/start, /tara/callback, etc. ---

resource "aws_api_gateway_resource" "auth_tara" {
  rest_api_id = aws_api_gateway_rest_api.auth.id
  parent_id   = aws_api_gateway_rest_api.auth.root_resource_id
  path_part   = "tara"
}

resource "aws_api_gateway_resource" "auth_tara_start" {
  rest_api_id = aws_api_gateway_rest_api.auth.id
  parent_id   = aws_api_gateway_resource.auth_tara.id
  path_part   = "start"
}

resource "aws_api_gateway_resource" "auth_tara_callback" {
  rest_api_id = aws_api_gateway_rest_api.auth.id
  parent_id   = aws_api_gateway_resource.auth_tara.id
  path_part   = "callback"
}

resource "aws_api_gateway_resource" "auth_tara_refresh" {
  rest_api_id = aws_api_gateway_rest_api.auth.id
  parent_id   = aws_api_gateway_resource.auth_tara.id
  path_part   = "refresh"
}

resource "aws_api_gateway_resource" "auth_tara_health" {
  rest_api_id = aws_api_gateway_rest_api.auth.id
  parent_id   = aws_api_gateway_resource.auth_tara.id
  path_part   = "health"
}

resource "aws_api_gateway_resource" "auth_tara_exchange" {
  rest_api_id = aws_api_gateway_rest_api.auth.id
  parent_id   = aws_api_gateway_resource.auth_tara.id
  path_part   = "exchange"
}

# --- Methods + Integrations ---

# GET /tara/start (public — initiates TARA OAuth flow)
resource "aws_api_gateway_method" "auth_start_get" {
  rest_api_id   = aws_api_gateway_rest_api.auth.id
  resource_id   = aws_api_gateway_resource.auth_tara_start.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_start_get" {
  rest_api_id             = aws_api_gateway_rest_api.auth.id
  resource_id             = aws_api_gateway_resource.auth_tara_start.id
  http_method             = aws_api_gateway_method.auth_start_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_tara_start.invoke_arn
}

# GET /tara/callback (public — TARA OAuth callback)
resource "aws_api_gateway_method" "auth_callback_get" {
  rest_api_id   = aws_api_gateway_rest_api.auth.id
  resource_id   = aws_api_gateway_resource.auth_tara_callback.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_callback_get" {
  rest_api_id             = aws_api_gateway_rest_api.auth.id
  resource_id             = aws_api_gateway_resource.auth_tara_callback.id
  http_method             = aws_api_gateway_method.auth_callback_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_tara_callback.invoke_arn
}

# POST /tara/refresh (public — token refresh via httpOnly cookie)
resource "aws_api_gateway_method" "auth_refresh_post" {
  rest_api_id   = aws_api_gateway_rest_api.auth.id
  resource_id   = aws_api_gateway_resource.auth_tara_refresh.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_refresh_post" {
  rest_api_id             = aws_api_gateway_rest_api.auth.id
  resource_id             = aws_api_gateway_resource.auth_tara_refresh.id
  http_method             = aws_api_gateway_method.auth_refresh_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_token_refresh.invoke_arn
}

# GET /tara/health (public)
resource "aws_api_gateway_method" "auth_health_get" {
  rest_api_id   = aws_api_gateway_rest_api.auth.id
  resource_id   = aws_api_gateway_resource.auth_tara_health.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_health_get" {
  rest_api_id             = aws_api_gateway_rest_api.auth.id
  resource_id             = aws_api_gateway_resource.auth_tara_health.id
  http_method             = aws_api_gateway_method.auth_health_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_health.invoke_arn
}

# POST /tara/exchange (public — exchange auth code for tokens)
resource "aws_api_gateway_method" "auth_exchange_post" {
  rest_api_id   = aws_api_gateway_rest_api.auth.id
  resource_id   = aws_api_gateway_resource.auth_tara_exchange.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "auth_exchange_post" {
  rest_api_id             = aws_api_gateway_rest_api.auth.id
  resource_id             = aws_api_gateway_resource.auth_tara_exchange.id
  http_method             = aws_api_gateway_method.auth_exchange_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.auth_token_exchange.invoke_arn
}

# --- CORS OPTIONS methods ---

module "auth_cors_start" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.auth.id
  resource_id = aws_api_gateway_resource.auth_tara_start.id
}

module "auth_cors_callback" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.auth.id
  resource_id = aws_api_gateway_resource.auth_tara_callback.id
}

module "auth_cors_refresh" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.auth.id
  resource_id = aws_api_gateway_resource.auth_tara_refresh.id
}

module "auth_cors_health" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.auth.id
  resource_id = aws_api_gateway_resource.auth_tara_health.id
}

module "auth_cors_exchange" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.auth.id
  resource_id = aws_api_gateway_resource.auth_tara_exchange.id
}

# --- Deployment + Stage ---

resource "aws_api_gateway_deployment" "auth" {
  rest_api_id = aws_api_gateway_rest_api.auth.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.auth_tara.id,
      aws_api_gateway_resource.auth_tara_start.id,
      aws_api_gateway_resource.auth_tara_callback.id,
      aws_api_gateway_resource.auth_tara_refresh.id,
      aws_api_gateway_resource.auth_tara_health.id,
      aws_api_gateway_resource.auth_tara_exchange.id,
      aws_api_gateway_method.auth_start_get.id,
      aws_api_gateway_method.auth_callback_get.id,
      aws_api_gateway_method.auth_refresh_post.id,
      aws_api_gateway_method.auth_health_get.id,
      aws_api_gateway_method.auth_exchange_post.id,
      aws_api_gateway_integration.auth_start_get.id,
      aws_api_gateway_integration.auth_callback_get.id,
      aws_api_gateway_integration.auth_refresh_post.id,
      aws_api_gateway_integration.auth_health_get.id,
      aws_api_gateway_integration.auth_exchange_post.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "auth" {
  deployment_id = aws_api_gateway_deployment.auth.id
  rest_api_id   = aws_api_gateway_rest_api.auth.id
  stage_name    = var.env

  tags = local.common_tags
}

# --- Lambda Permissions ---

resource "aws_lambda_permission" "auth_start_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-start"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_tara_start.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.auth.execution_arn}/*/*/*"
}

resource "aws_lambda_permission" "auth_callback_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-callback"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_tara_callback.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.auth.execution_arn}/*/*/*"
}

resource "aws_lambda_permission" "auth_refresh_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-refresh"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_token_refresh.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.auth.execution_arn}/*/*/*"
}

resource "aws_lambda_permission" "auth_health_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-health"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.auth.execution_arn}/*/*/*"
}

resource "aws_lambda_permission" "auth_exchange_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-exchange"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_token_exchange.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.auth.execution_arn}/*/*/*"
}
