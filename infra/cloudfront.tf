# Response headers policy — delivers CSP and security headers
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${local.app_name}-${var.env}-security-headers"

  security_headers_config {
    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.askend-lab.com https://*.eki.ee https://*.amazonaws.com https://*.amazoncognito.com https://*.ingest.sentry.io; media-src 'self' https://*.amazonaws.com https://*.askend-lab.com https://*.eki.ee; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
      override = true
    }

    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "no-referrer"
      override        = true
    }
  }
}

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
resource "aws_cloudfront_distribution" "website" {
  web_acl_id          = aws_wafv2_web_acl.cloudfront.arn
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [local.domain_name]

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${local.website_bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  # Vabamorf API origin (no public DNS — only reachable through CloudFront)
  origin {
    domain_name = local.vabamorf_api_domain
    origin_path = local.vabamorf_api_path
    origin_id   = "vabamorf-api"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Merlin API origin (no public DNS — only reachable through CloudFront)
  origin {
    domain_name = local.merlin_api_domain
    origin_path = local.merlin_api_path
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

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 3600
    max_ttl                    = 86400
    compress                   = true
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # NOTE: Do NOT add custom_error_response for 403.
  # CloudFront custom_error_response is GLOBAL — it applies to ALL behaviors
  # including API routes. A 403 from an API origin would be silently replaced
  # with /index.html (200 OK), making API errors invisible.

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

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.cloudfront_logs.bucket_regional_domain_name
    prefix          = "cdn/"
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

# ACM Certificate for custom domain (e.g. haaldusabiline.eki.ee)
# Phase 1: cert is created and pending DNS validation
# Phase 2: after domain owner adds CNAME, cert validates → add as CloudFront alias
resource "aws_acm_certificate" "custom_domain" {
  count             = var.custom_domain != "" ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = var.custom_domain
  validation_method = "DNS"

  tags = merge(local.common_tags, {
    Name = var.custom_domain
  })

  lifecycle {
    create_before_destroy = true
  }
}
