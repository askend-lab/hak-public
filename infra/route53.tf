# DNS record for website - TEMPORARY: pointing to S3 website endpoint
# Will switch to CloudFront after AWS account verification
resource "aws_route53_record" "website" {
  zone_id = data.terraform_remote_state.infra.outputs.route53_zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_s3_bucket_website_configuration.website.website_domain
    zone_id                = aws_s3_bucket.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# # DNS validation records for ACM certificate - DISABLED temporarily
# resource "aws_route53_record" "cert_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
#       name   = dvo.resource_record_name
#       record = dvo.resource_record_value
#       type   = dvo.resource_record_type
#     }
#   }

#   allow_overwrite = true
#   name            = each.value.name
#   records         = [each.value.record]
#   ttl             = 60
#   type            = each.value.type
#   zone_id         = data.terraform_remote_state.infra.outputs.route53_zone_id
# }
