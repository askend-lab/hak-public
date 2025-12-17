# Google Identity Provider for existing Cognito User Pool
# Existing user pool ID: eu-west-1_UoyXFGqR4

# Read Google OAuth credentials from AWS Secrets Manager
data "aws_secretsmanager_secret" "google_auth" {
  name = "askend-lab/google-auth-keys"
}

data "aws_secretsmanager_secret_version" "google_auth" {
  secret_id = data.aws_secretsmanager_secret.google_auth.id
}

locals {
  google_auth          = jsondecode(data.aws_secretsmanager_secret_version.google_auth.secret_string)
  existing_user_pool_id = "eu-west-1_UoyXFGqR4"
}

# Google Identity Provider - adds to existing user pool
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = local.existing_user_pool_id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = local.google_auth.web.client_id
    client_secret    = local.google_auth.web.client_secret
    authorize_scopes = "email openid profile"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
    picture  = "picture"
  }
}
