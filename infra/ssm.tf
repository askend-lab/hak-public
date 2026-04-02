# SSM Parameters — read existing parameters for Lambda environment configuration
# These parameters are managed externally (created during initial setup)

data "aws_ssm_parameter" "cognito_user_pool_id" {
  name = "/hak/${var.env}/cognito-user-pool-id"
}

data "aws_ssm_parameter" "cognito_client_id" {
  name = "/hak/${var.env}/cognito-client-id"
}

data "aws_ssm_parameter" "tara_secrets_arn" {
  name = "/hak/${var.env}/tara-secrets-arn"
}

data "aws_ssm_parameter" "frontend_url" {
  name = "/hak/${var.env}/frontend-url"
}

data "aws_ssm_parameter" "frontend_url_dev" {
  name = "/hak/dev/frontend-url"
}

data "aws_ssm_parameter" "frontend_url_prod" {
  name = "/hak/prod/frontend-url"
}

data "aws_ssm_parameter" "cognito_domain" {
  name = "/hak/shared/cognito-domain"
}

data "aws_ssm_parameter" "lambda_security_group_id" {
  name = "/hak/shared/lambda-security-group-id"
}

data "aws_ssm_parameter" "private_subnet_id_1" {
  name = "/hak/shared/private-subnet-id-1"
}

data "aws_ssm_parameter" "private_subnet_id_2" {
  name = "/hak/shared/private-subnet-id-2"
}
