# API Gateway Custom Domain for SimpleStore
# Domain: hak-api-{env}.askend-lab.com (dev) / hak-api.askend-lab.com (prod)
#
# NOTE: Custom domain is managed by serverless-domain-manager plugin in SimpleStore
# The wildcard certificate (*.askend-lab.com) is created centrally by admin
#
# This file is kept for reference but not used - SimpleStore handles its own domain setup

locals {
  api_domain_name = var.env == "prod" ? "hak-api.askend-lab.com" : "hak-api-${var.env}.askend-lab.com"
}

# Output the API domain for reference
output "api_domain" {
  description = "API Gateway custom domain (managed by SimpleStore serverless)"
  value       = local.api_domain_name
}
