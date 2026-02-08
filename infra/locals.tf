locals {
  app_name = "hak"
  region   = "eu-west-1"

  # Domain logic: dev → hak-dev.example.com, prod → hak.example.com
  domain_name = var.env == "prod" ? "${local.app_name}.${var.domain_name}" : "${local.app_name}-${var.env}.${var.domain_name}"

  # Resource naming
  website_bucket_name     = "${local.app_name}-${var.env}-website"
  artifacts_bucket_name   = var.artifacts_bucket
  artifacts_bucket_prefix = local.app_name

  # Tags
  common_tags = {
    Project     = "HAK"
    Environment = var.env
    ManagedBy   = "Terraform"
  }
}
