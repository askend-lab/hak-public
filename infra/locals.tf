locals {
  app_name = "hak"
  region   = "eu-west-1"

  # Domain logic: dev → hak-dev.askend-lab.com, prod → hak.askend-lab.com
  domain_name = var.env == "prod" ? "${local.app_name}.askend-lab.com" : "${local.app_name}-${var.env}.askend-lab.com"

  # Resource naming
  website_bucket_name   = "${local.app_name}-${var.env}-website"
  artifacts_bucket_name = "${local.app_name}-artifacts"

  # Tags
  common_tags = {
    Project     = "HAK"
    Environment = var.env
    ManagedBy   = "Terraform"
  }
}
