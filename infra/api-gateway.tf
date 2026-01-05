# API Gateway Custom Domain for SimpleStore
# Domain: hak-api-{env}.askend-lab.com (dev) / hak-api.askend-lab.com (prod)

locals {
  api_domain_name = var.env == "prod" ? "hak-api.askend-lab.com" : "hak-api-${var.env}.askend-lab.com"
}

# ACM Certificate for API domain
resource "aws_acm_certificate" "api" {
  domain_name       = local.api_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = "hak-api-${var.env}"
  })
}

# DNS validation for ACM certificate
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.terraform_remote_state.infra.outputs.route53_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
}

# API Gateway Custom Domain
resource "aws_api_gateway_domain_name" "api" {
  domain_name              = local.api_domain_name
  regional_certificate_arn = aws_acm_certificate_validation.api.certificate_arn

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

output "api_gateway_domain_name" {
  description = "API Gateway domain name resource"
  value       = aws_api_gateway_domain_name.api.domain_name
}
