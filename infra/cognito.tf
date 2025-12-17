# Cognito User Pool with Google Social Login
# Note: Existing user pool ID: eu-west-1_UoyXFGqR4

# Read Google OAuth credentials from AWS Secrets Manager
data "aws_secretsmanager_secret" "google_auth" {
  name = "askend-lab/google-auth-keys"
}

data "aws_secretsmanager_secret_version" "google_auth" {
  secret_id = data.aws_secretsmanager_secret.google_auth.id
}

locals {
  google_auth = jsondecode(data.aws_secretsmanager_secret_version.google_auth.secret_string)
}

# Import existing Cognito User Pool
# Run: terraform import aws_cognito_user_pool.main eu-west-1_UoyXFGqR4
resource "aws_cognito_user_pool" "main" {
  name = "askend-lab-auth"

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Auto-verify email
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  # Schema attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
  }

  tags = {
    Project     = "hak"
    Environment = var.env
  }
}

# Google Identity Provider
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
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

# Cognito User Pool Client
# Import existing: terraform import aws_cognito_user_pool_client.web eu-west-1_UoyXFGqR4/9m3i70h5ckgnin8aoujc5qqo3
resource "aws_cognito_user_pool_client" "web" {
  name         = "hak-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth settings
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  # Callback URLs
  callback_urls = [
    "http://localhost:5180",
    "https://hak-dev.askend-lab.com",
    "https://hak.askend-lab.com"
  ]

  logout_urls = [
    "http://localhost:5180",
    "https://hak-dev.askend-lab.com",
    "https://hak.askend-lab.com"
  ]

  # Supported identity providers
  supported_identity_providers = ["COGNITO", "Google"]

  # Token validity
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Security settings
  prevent_user_existence_errors = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

# Cognito User Pool Domain (for hosted UI)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "askend-lab-auth"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Outputs
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "cognito_domain" {
  value = "https://${aws_cognito_user_pool_domain.main.domain}.auth.eu-west-1.amazoncognito.com"
}
