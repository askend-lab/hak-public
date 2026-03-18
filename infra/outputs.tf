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

output "cloudfront_domain" {
  description = "CloudFront distribution domain (external DNS owner should CNAME to this)"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "custom_domain_cert_arn" {
  description = "ACM certificate ARN for custom domain (pending validation)"
  value       = var.custom_domain != "" ? aws_acm_certificate.custom_domain[0].arn : ""
}

output "custom_domain_validation_records" {
  description = "DNS CNAME records for custom domain cert validation — provide to external DNS owner"
  value = var.custom_domain != "" ? {
    for dvo in aws_acm_certificate.custom_domain[0].domain_validation_options : dvo.domain_name => {
      cname_name  = dvo.resource_record_name
      cname_value = dvo.resource_record_value
    } if !endswith(dvo.domain_name, var.domain_name)
  } : {}
}
