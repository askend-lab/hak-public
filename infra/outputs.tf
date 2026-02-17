output "website_url" {
  description = "Website URL - TEMPORARY: HTTP only until CloudFront is enabled"
  value       = "http://${local.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.website.id
}

output "website_bucket_name" {
  description = "S3 bucket name for website content"
  value       = aws_s3_bucket.website.id
}

output "website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "artifacts_bucket_name" {
  description = "S3 bucket name for build artifacts (centralized)"
  value       = local.artifacts_bucket_name
}

output "domain_name" {
  description = "Domain name for this environment"
  value       = local.domain_name
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN (us-east-1)"
  value       = aws_acm_certificate.website.arn
}

output "acm_validation_records" {
  description = "DNS CNAME records for ACM certificate validation (provide to external DNS owner)"
  value = var.manage_dns ? {} : {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain (external DNS owner should CNAME to this)"
  value       = aws_cloudfront_distribution.website.domain_name
}
