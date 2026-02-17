# DNS record for website - pointing to CloudFront
# Skipped when manage_dns=false (external domain like eki.ee — DNS managed by domain owner)
resource "aws_route53_record" "website" {
  count   = var.manage_dns ? 1 : 0
  zone_id = data.terraform_remote_state.infra.outputs.route53_zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# DNS validation records for ACM certificate
# Skipped when manage_dns=false — output validation records for external DNS owner instead
resource "aws_route53_record" "cert_validation" {
  for_each = var.manage_dns ? {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.terraform_remote_state.infra.outputs.route53_zone_id
}
