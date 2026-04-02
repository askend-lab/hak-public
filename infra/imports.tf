# =============================================================================
# Import blocks — import existing Serverless CF stack resources into Terraform
# TEMPORARY: Remove this file after successful terraform apply
# =============================================================================

# --- SimpleStore ---

import {
  to = aws_iam_role.store_lambda
  id = "simplestore-${var.env}-${local.region}-lambdaRole"
}

import {
  to = aws_iam_role_policy.store_lambda
  id = "simplestore-${var.env}-${local.region}-lambdaRole:${var.env}-simplestore-lambda"
}

import {
  to = aws_lambda_function.store_api
  id = "simplestore-${var.env}-api"
}

import {
  to = aws_cloudwatch_log_group.store_api
  id = "/aws/lambda/simplestore-${var.env}-api"
}

import {
  to = aws_dynamodb_table.simplestore
  id = "simplestore-${var.env}"
}

# --- Merlin TTS API ---

import {
  to = aws_iam_role.tts_lambda
  id = "merlin-api-${var.env}-${local.region}-lambdaRole"
}

import {
  to = aws_iam_role_policy.tts_lambda
  id = "merlin-api-${var.env}-${local.region}-lambdaRole:${var.env}-merlin-api-lambda"
}

import {
  to = aws_lambda_function.tts_synthesize
  id = "merlin-api-${var.env}-synthesize"
}

import {
  to = aws_lambda_function.tts_status
  id = "merlin-api-${var.env}-status"
}

import {
  to = aws_lambda_function.tts_health
  id = "merlin-api-${var.env}-health"
}

import {
  to = aws_cloudwatch_log_group.tts_synthesize
  id = "/aws/lambda/merlin-api-${var.env}-synthesize"
}

import {
  to = aws_cloudwatch_log_group.tts_status
  id = "/aws/lambda/merlin-api-${var.env}-status"
}

import {
  to = aws_cloudwatch_log_group.tts_health
  id = "/aws/lambda/merlin-api-${var.env}-health"
}

# --- TARA Auth ---

import {
  to = aws_iam_role.auth_lambda
  id = "tara-auth-${var.env}-${local.region}-lambdaRole"
}

import {
  to = aws_iam_role_policy.auth_lambda
  id = "tara-auth-${var.env}-${local.region}-lambdaRole:${var.env}-tara-auth-lambda"
}

import {
  to = aws_lambda_function.auth_tara_start
  id = "tara-auth-${var.env}-taraStart"
}

import {
  to = aws_lambda_function.auth_tara_callback
  id = "tara-auth-${var.env}-taraCallback"
}

import {
  to = aws_lambda_function.auth_token_refresh
  id = "tara-auth-${var.env}-tokenRefresh"
}

import {
  to = aws_lambda_function.auth_health
  id = "tara-auth-${var.env}-health"
}

import {
  to = aws_lambda_function.auth_token_exchange
  id = "tara-auth-${var.env}-tokenExchange"
}

import {
  to = aws_lambda_function.auth_cognito_triggers
  id = "tara-auth-${var.env}-cognitoTriggers"
}

import {
  to = aws_cloudwatch_log_group.auth_tara_start
  id = "/aws/lambda/tara-auth-${var.env}-taraStart"
}

import {
  to = aws_cloudwatch_log_group.auth_tara_callback
  id = "/aws/lambda/tara-auth-${var.env}-taraCallback"
}

import {
  to = aws_cloudwatch_log_group.auth_token_refresh
  id = "/aws/lambda/tara-auth-${var.env}-tokenRefresh"
}

import {
  to = aws_cloudwatch_log_group.auth_health
  id = "/aws/lambda/tara-auth-${var.env}-health"
}

import {
  to = aws_cloudwatch_log_group.auth_token_exchange
  id = "/aws/lambda/tara-auth-${var.env}-tokenExchange"
}

import {
  to = aws_cloudwatch_log_group.auth_cognito_triggers
  id = "/aws/lambda/tara-auth-${var.env}-cognitoTriggers"
}

# --- Vabamorf Morphology API ---

import {
  to = aws_iam_role.morphology_lambda
  id = "vabamorf-api-${var.env}-${local.region}-lambdaRole"
}

import {
  to = aws_iam_role_policy.morphology_lambda
  id = "vabamorf-api-${var.env}-${local.region}-lambdaRole:${var.env}-vabamorf-api-lambda"
}

import {
  to = aws_lambda_function.morphology_api
  id = "vabamorf-api-${var.env}-api"
}

import {
  to = aws_cloudwatch_log_group.morphology_api
  id = "/aws/lambda/vabamorf-api-${var.env}-api"
}
