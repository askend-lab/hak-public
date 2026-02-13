# CloudFront Function to rewrite /api/* paths
resource "aws_cloudfront_function" "api_rewrite" {
  name    = "${local.app_name}-${var.env}-api-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOF
    function handler(event) {
      var request = event.request;
      // Rewrite /api/xxx to /xxx for backend APIs
      if (request.uri.startsWith('/api/')) {
        request.uri = request.uri.substring(4);
      }
      return request;
    }
  EOF
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${local.app_name}-${var.env}-oac"
  description                       = "OAC for ${local.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
#tfsec:ignore:AVD-AWS-0011 WAF not required for educational platform; cost consideration for OSS project
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [local.domain_name]

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${local.website_bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  # Vabamorf API origin
  origin {
    domain_name = var.env == "prod" ? "vabamorf.${var.domain_name}" : "vabamorf-${var.env}.${var.domain_name}"
    origin_id   = "vabamorf-api"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Merlin API origin (can be overridden to use prod for dev environment)
  origin {
    domain_name = var.use_prod_merlin ? "merlin-prod.${var.domain_name}" : "merlin-${var.env}.${var.domain_name}"
    origin_id   = "merlin-api"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # SimpleStore API origin
  origin {
    domain_name = var.env == "prod" ? "hak-api.${var.domain_name}" : "hak-api-${var.env}.${var.domain_name}"
    origin_id   = "simplestore-api"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # API route cache behaviors — generated from local.api_routes map
  dynamic "ordered_cache_behavior" {
    for_each = local.api_routes
    content {
      path_pattern     = ordered_cache_behavior.value.path
      allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods   = ["GET", "HEAD"]
      target_origin_id = ordered_cache_behavior.value.origin

      forwarded_values {
        query_string = ordered_cache_behavior.value.query_string
        headers = ordered_cache_behavior.value.auth ? [
          "Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method", "Authorization"
        ] : [
          "Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"
        ]
        cookies {
          forward = "none"
        }
      }

      dynamic "function_association" {
        for_each = ordered_cache_behavior.value.rewrite ? [1] : []
        content {
          event_type   = "viewer-request"
          function_arn = aws_cloudfront_function.api_rewrite.arn
        }
      }

      viewer_protocol_policy = "redirect-to-https"
      min_ttl                = 0
      default_ttl            = 0
      max_ttl                = 0
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${local.website_bucket_name}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.website.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-${var.env}-cdn"
  })
}

# ACM Certificate (must be in us-east-1 for CloudFront)
# Keep provider active to clean up existing resources in state
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "website" {
  provider          = aws.us_east_1
  domain_name       = local.domain_name
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = local.domain_name
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "website" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.website.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
