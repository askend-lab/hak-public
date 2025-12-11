output "website_url" {
  description = "Website URL - TEMPORARY: HTTP only until CloudFront is enabled"
  value       = "http://${local.domain_name}"
}

# output "cloudfront_distribution_id" {
#   description = "CloudFront distribution ID for cache invalidation"
#   value       = aws_cloudfront_distribution.website.id
# }

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
