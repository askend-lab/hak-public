# =============================================================================
# Vabamorf Morphology API — HTTP API v2 (replaces Serverless CF stack API Gateway)
# Routes: POST /analyze, POST /variants, GET /health
# =============================================================================

resource "aws_apigatewayv2_api" "morphology" {
  name          = "vabamorf-api-${var.env}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = split(",", local.allowed_origin)
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    max_age       = 600
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_stage" "morphology" {
  api_id      = aws_apigatewayv2_api.morphology.id
  name        = "$default"
  auto_deploy = true

  tags = local.common_tags
}

# --- Cognito JWT Authorizer ---

resource "aws_apigatewayv2_authorizer" "morphology_cognito" {
  api_id           = aws_apigatewayv2_api.morphology.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "CognitoAuthorizer"

  jwt_configuration {
    audience = [data.aws_ssm_parameter.cognito_client_id.value]
    issuer   = "https://cognito-idp.${local.region}.amazonaws.com/${data.aws_ssm_parameter.cognito_user_pool_id.value}"
  }
}

# --- Integration (single Lambda handles all routes) ---

resource "aws_apigatewayv2_integration" "morphology_api" {
  api_id                 = aws_apigatewayv2_api.morphology.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.morphology_api.invoke_arn
  payload_format_version = "2.0"
}

# --- Routes ---

resource "aws_apigatewayv2_route" "morphology_analyze" {
  api_id             = aws_apigatewayv2_api.morphology.id
  route_key          = "POST /analyze"
  target             = "integrations/${aws_apigatewayv2_integration.morphology_api.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.morphology_cognito.id
}

resource "aws_apigatewayv2_route" "morphology_variants" {
  api_id             = aws_apigatewayv2_api.morphology.id
  route_key          = "POST /variants"
  target             = "integrations/${aws_apigatewayv2_integration.morphology_api.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.morphology_cognito.id
}

resource "aws_apigatewayv2_route" "morphology_health" {
  api_id    = aws_apigatewayv2_api.morphology.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.morphology_api.id}"
}

# --- Lambda Permission ---

resource "aws_lambda_permission" "morphology_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.morphology_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.morphology.execution_arn}/*/*"
}
