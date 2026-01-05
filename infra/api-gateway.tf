# API Gateway Custom Domain for SimpleStore
# Domain: hak-api-{env}.askend-lab.com (dev) / hak-api.askend-lab.com (prod)

locals {
  api_domain_name = var.env == "prod" ? "hak-api.askend-lab.com" : "hak-api-${var.env}.askend-lab.com"
  # Wildcard certificate ARN (created by admin)
  wildcard_cert_arn = "arn:aws:acm:eu-west-1:465168436856:certificate/f91069e3-9ca9-4651-b912-765c9f49fc0d"
}

# API Gateway Custom Domain
resource "aws_api_gateway_domain_name" "api" {
  domain_name              = local.api_domain_name
  regional_certificate_arn = local.wildcard_cert_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = merge(local.common_tags, {
    Name = "hak-api-${var.env}"
  })
}

# Route53 record pointing to API Gateway
resource "aws_route53_record" "api" {
  zone_id = data.terraform_remote_state.infra.outputs.route53_zone_id
  name    = local.api_domain_name
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.api.regional_zone_id
    evaluate_target_health = false
  }
}

# Output the API domain
output "api_domain" {
  description = "API Gateway custom domain"
  value       = local.api_domain_name
}

output "api_gateway_domain_name_id" {
  description = "API Gateway domain name resource ID"
  value       = aws_api_gateway_domain_name.api.id
}
