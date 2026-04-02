# =============================================================================
# SimpleStore API — REST API v1 (replaces Serverless CF stack API Gateway)
# Routes: POST /save, GET /get, DELETE /delete, GET /query,
#         GET /get-shared, GET /get-public, GET /health
# =============================================================================

resource "aws_api_gateway_rest_api" "store" {
  name = "${var.env}-simplestore"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# --- Cognito Authorizer ---

resource "aws_api_gateway_authorizer" "store_cognito" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  name          = "CognitoAuthorizer"
  type          = "COGNITO_USER_POOLS"
  provider_arns = ["arn:aws:cognito-idp:${local.region}:${local.account_id}:userpool/${data.aws_ssm_parameter.cognito_user_pool_id.value}"]
}

# --- Resources (paths) ---

resource "aws_api_gateway_resource" "store_save" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "save"
}

resource "aws_api_gateway_resource" "store_get" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "get"
}

resource "aws_api_gateway_resource" "store_delete" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "delete"
}

resource "aws_api_gateway_resource" "store_query" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "query"
}

resource "aws_api_gateway_resource" "store_get_shared" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "get-shared"
}

resource "aws_api_gateway_resource" "store_get_public" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "get-public"
}

resource "aws_api_gateway_resource" "store_health" {
  rest_api_id = aws_api_gateway_rest_api.store.id
  parent_id   = aws_api_gateway_rest_api.store.root_resource_id
  path_part   = "health"
}

# --- Methods + Integrations (authenticated routes) ---

# POST /save (authenticated)
resource "aws_api_gateway_method" "store_save_post" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_save.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.store_cognito.id
}

resource "aws_api_gateway_integration" "store_save_post" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_save.id
  http_method             = aws_api_gateway_method.store_save_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# GET /get (authenticated)
resource "aws_api_gateway_method" "store_get_get" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_get.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.store_cognito.id
}

resource "aws_api_gateway_integration" "store_get_get" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_get.id
  http_method             = aws_api_gateway_method.store_get_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# DELETE /delete (authenticated)
resource "aws_api_gateway_method" "store_delete_delete" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_delete.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.store_cognito.id
}

resource "aws_api_gateway_integration" "store_delete_delete" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_delete.id
  http_method             = aws_api_gateway_method.store_delete_delete.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# GET /query (authenticated)
resource "aws_api_gateway_method" "store_query_get" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_query.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.store_cognito.id
}

resource "aws_api_gateway_integration" "store_query_get" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_query.id
  http_method             = aws_api_gateway_method.store_query_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# --- Methods + Integrations (public routes) ---

# GET /get-shared (public)
resource "aws_api_gateway_method" "store_get_shared_get" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_get_shared.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "store_get_shared_get" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_get_shared.id
  http_method             = aws_api_gateway_method.store_get_shared_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# GET /get-public (public)
resource "aws_api_gateway_method" "store_get_public_get" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_get_public.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "store_get_public_get" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_get_public.id
  http_method             = aws_api_gateway_method.store_get_public_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# GET /health (public)
resource "aws_api_gateway_method" "store_health_get" {
  rest_api_id   = aws_api_gateway_rest_api.store.id
  resource_id   = aws_api_gateway_resource.store_health.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "store_health_get" {
  rest_api_id             = aws_api_gateway_rest_api.store.id
  resource_id             = aws_api_gateway_resource.store_health.id
  http_method             = aws_api_gateway_method.store_health_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.store_api.invoke_arn
}

# --- CORS OPTIONS methods (one per resource) ---

module "store_cors_save" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_save.id
}

module "store_cors_get" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_get.id
}

module "store_cors_delete" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_delete.id
}

module "store_cors_query" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_query.id
}

module "store_cors_get_shared" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_get_shared.id
}

module "store_cors_get_public" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_get_public.id
}

module "store_cors_health" {
  source      = "./modules/api-gateway-cors"
  rest_api_id = aws_api_gateway_rest_api.store.id
  resource_id = aws_api_gateway_resource.store_health.id
}

# --- Deployment + Stage ---

resource "aws_api_gateway_deployment" "store" {
  rest_api_id = aws_api_gateway_rest_api.store.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.store_save.id,
      aws_api_gateway_resource.store_get.id,
      aws_api_gateway_resource.store_delete.id,
      aws_api_gateway_resource.store_query.id,
      aws_api_gateway_resource.store_get_shared.id,
      aws_api_gateway_resource.store_get_public.id,
      aws_api_gateway_resource.store_health.id,
      aws_api_gateway_method.store_save_post.id,
      aws_api_gateway_method.store_get_get.id,
      aws_api_gateway_method.store_delete_delete.id,
      aws_api_gateway_method.store_query_get.id,
      aws_api_gateway_method.store_get_shared_get.id,
      aws_api_gateway_method.store_get_public_get.id,
      aws_api_gateway_method.store_health_get.id,
      aws_api_gateway_integration.store_save_post.id,
      aws_api_gateway_integration.store_get_get.id,
      aws_api_gateway_integration.store_delete_delete.id,
      aws_api_gateway_integration.store_query_get.id,
      aws_api_gateway_integration.store_get_shared_get.id,
      aws_api_gateway_integration.store_get_public_get.id,
      aws_api_gateway_integration.store_health_get.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "store" {
  deployment_id = aws_api_gateway_deployment.store.id
  rest_api_id   = aws_api_gateway_rest_api.store.id
  stage_name    = var.env

  tags = local.common_tags
}

# --- Lambda Permission ---

resource "aws_lambda_permission" "store_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.store_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.store.execution_arn}/*/*/*"
}
