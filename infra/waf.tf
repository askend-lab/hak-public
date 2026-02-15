# AWS WAF v2 — CloudFront Web ACL
# Protects all traffic (website + APIs) via CloudFront association
# Scope: CLOUDFRONT requires us-east-1 provider
#
# Initial deployment in COUNT mode — monitor for 1 week, then switch to BLOCK

resource "aws_wafv2_web_acl" "cloudfront" {
  provider = aws.us_east_1

  name        = "${local.app_name}-${var.env}-waf"
  description = "WAF for ${local.app_name} ${var.env} CloudFront distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rule 1: Per-IP rate limiting (100 requests per 5 minutes)
  rule {
    name     = "rate-limit-per-ip"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 100
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: AWS Managed Rules — Common Rule Set
  # Protects against SQL injection, XSS, and other common attack vectors
  rule {
    name     = "aws-managed-common-rules"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.app_name}-${var.env}-waf"
    sampled_requests_enabled   = true
  }

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-${var.env}-waf"
  })
}

# CloudWatch Log Group for WAF (optional but recommended for monitoring)
resource "aws_cloudwatch_log_group" "waf" {
  provider = aws.us_east_1

  # WAF logging requires the log group name to start with "aws-waf-logs-"
  name              = "aws-waf-logs-${local.app_name}-${var.env}"
  retention_in_days = 90

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-${var.env}-waf-logs"
  })
}

# WAF Logging Configuration
resource "aws_wafv2_web_acl_logging_configuration" "cloudfront" {
  provider = aws.us_east_1

  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]
  resource_arn            = aws_wafv2_web_acl.cloudfront.arn

  # Only log blocked and counted requests (reduce noise)
  logging_filter {
    default_behavior = "DROP"

    filter {
      behavior    = "KEEP"
      requirement = "MEETS_ANY"

      condition {
        action_condition {
          action = "BLOCK"
        }
      }

      condition {
        action_condition {
          action = "COUNT"
        }
      }
    }
  }
}
