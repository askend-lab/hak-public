# =============================================================================
# Merlin TTS API — HTTP API v2 (replaces Serverless CF stack API Gateway)
# Routes: POST /synthesize, GET /status/{cacheKey}, GET /health
# =============================================================================

resource "aws_apigatewayv2_api" "tts" {
  name          = "merlin-api-${var.env}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = split(",", local.allowed_origin)
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    max_age       = 600
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_stage" "tts" {
  api_id      = aws_apigatewayv2_api.tts.id
  name        = "$default"
  auto_deploy = true

  tags = local.common_tags
}

# --- Cognito JWT Authorizer ---

resource "aws_apigatewayv2_authorizer" "tts_cognito" {
  api_id           = aws_apigatewayv2_api.tts.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "CognitoAuthorizer"

  jwt_configuration {
    audience = [data.aws_ssm_parameter.cognito_client_id.value]
    issuer   = "https://cognito-idp.${local.region}.amazonaws.com/${data.aws_ssm_parameter.cognito_user_pool_id.value}"
  }
}

# --- Integrations ---

resource "aws_apigatewayv2_integration" "tts_synthesize" {
  api_id                 = aws_apigatewayv2_api.tts.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.tts_synthesize.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "tts_status" {
  api_id                 = aws_apigatewayv2_api.tts.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.tts_status.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "tts_health" {
  api_id                 = aws_apigatewayv2_api.tts.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.tts_health.invoke_arn
  payload_format_version = "2.0"
}

# --- Routes ---

resource "aws_apigatewayv2_route" "tts_synthesize" {
  api_id             = aws_apigatewayv2_api.tts.id
  route_key          = "POST /synthesize"
  target             = "integrations/${aws_apigatewayv2_integration.tts_synthesize.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.tts_cognito.id
}

resource "aws_apigatewayv2_route" "tts_status" {
  api_id    = aws_apigatewayv2_api.tts.id
  route_key = "GET /status/{cacheKey}"
  target    = "integrations/${aws_apigatewayv2_integration.tts_status.id}"
}

resource "aws_apigatewayv2_route" "tts_health" {
  api_id    = aws_apigatewayv2_api.tts.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.tts_health.id}"
}

# --- Lambda Permissions ---

resource "aws_lambda_permission" "tts_synthesize_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-synthesize"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tts_synthesize.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.tts.execution_arn}/*/*"
}

resource "aws_lambda_permission" "tts_status_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-status"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tts_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.tts.execution_arn}/*/*"
}

resource "aws_lambda_permission" "tts_health_apigw" {
  statement_id  = "AllowAPIGatewayInvoke-health"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tts_health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.tts.execution_arn}/*/*"
}
