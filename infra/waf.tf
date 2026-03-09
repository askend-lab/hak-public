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

  # Custom response body for rate-limit blocks (429 instead of default 403)
  custom_response_body {
    key          = "rate-limit"
    content      = "{\"error\":\"RATE_LIMIT\",\"message\":\"Too many requests\"}"
    content_type = "APPLICATION_JSON"
  }

  # Rule 1: Per-IP general rate limiting (2000 req/5min)
  # Budget: ~200 submits + ~900 polls (15 in-flight × 12/min × 5min) + browsing
  # Real abuse protection is Rule 2 (synthesize-specific limit)
  rule {
    name     = "rate-limit-per-ip"
    priority = 1

    action {
      block {
        custom_response {
          response_code            = 429
          custom_response_body_key = "rate-limit"
        }
      }
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: Per-path rate limit for /synthesize (PUB-9)
  # 200 req/5min per IP — 2 ECS workers process ~150 words/5min, 200 gives headroom
  rule {
    name     = "rate-limit-synthesize"
    priority = 2

    action {
      block {
        custom_response {
          response_code            = 429
          custom_response_body_key = "rate-limit"
        }
      }
    }

    statement {
      rate_based_statement {
        limit              = 200
        aggregate_key_type = "IP"

        scope_down_statement {
          byte_match_statement {
            search_string         = "/api/synthesize"
            positional_constraint = "STARTS_WITH"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-rate-limit-synthesize"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3: Geo-blocking for /synthesize (PUB-10)
  # Only allow speech synthesis from Baltic/Nordic region
  rule {
    name     = "geo-restrict-synthesize"
    priority = 3

    action {
      block {}
    }

    statement {
      and_statement {
        statement {
          byte_match_statement {
            search_string         = "/api/synthesize"
            positional_constraint = "STARTS_WITH"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }

        statement {
          not_statement {
            statement {
              geo_match_statement {
                country_codes = ["EE", "LV", "LT", "FI", "SE", "DE", "PL", "NO", "DK"]
              }
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-geo-restrict-synthesize"
      sampled_requests_enabled   = true
    }
  }

  # Rule 5: Per-user synthesis rate limit (SLA §5.1)
  # 10 req/2min per Authorization header = 5 req/min effective
  rule {
    name     = "rate-limit-per-user-synthesize"
    priority = 5

    action {
      block {
        custom_response {
          response_code            = 429
          custom_response_body_key = "rate-limit"
        }
      }
    }

    statement {
      rate_based_statement {
        limit                 = 10
        evaluation_window_sec = 120
        aggregate_key_type    = "CUSTOM_KEYS"

        custom_key {
          header {
            name = "authorization"
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }

        scope_down_statement {
          byte_match_statement {
            search_string         = "/api/synthesize"
            positional_constraint = "STARTS_WITH"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-rate-limit-per-user-synthesize"
      sampled_requests_enabled   = true
    }
  }

  # Rule 6: Per-user morphology rate limit (SLA §5.1)
  # 20 req/1min per Authorization header for /analyze and /variants
  rule {
    name     = "rate-limit-per-user-morphology"
    priority = 6

    action {
      block {
        custom_response {
          response_code            = 429
          custom_response_body_key = "rate-limit"
        }
      }
    }

    statement {
      rate_based_statement {
        limit                 = 20
        evaluation_window_sec = 60
        aggregate_key_type    = "CUSTOM_KEYS"

        custom_key {
          header {
            name = "authorization"
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }

        scope_down_statement {
          or_statement {
            statement {
              byte_match_statement {
                search_string         = "/api/analyze"
                positional_constraint = "STARTS_WITH"
                field_to_match {
                  uri_path {}
                }
                text_transformation {
                  priority = 0
                  type     = "LOWERCASE"
                }
              }
            }
            statement {
              byte_match_statement {
                search_string         = "/api/variants"
                positional_constraint = "STARTS_WITH"
                field_to_match {
                  uri_path {}
                }
                text_transformation {
                  priority = 0
                  type     = "LOWERCASE"
                }
              }
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-rate-limit-per-user-morphology"
      sampled_requests_enabled   = true
    }
  }

  # Rule 7: Per-user status polling rate limit (SLA §5.1)
  # 100 req/1min per Authorization header for /status (lightweight polling, generous limit)
  rule {
    name     = "rate-limit-per-user-status"
    priority = 7

    action {
      block {
        custom_response {
          response_code            = 429
          custom_response_body_key = "rate-limit"
        }
      }
    }

    statement {
      rate_based_statement {
        limit                 = 100
        evaluation_window_sec = 60
        aggregate_key_type    = "CUSTOM_KEYS"

        custom_key {
          header {
            name = "authorization"
            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }

        scope_down_statement {
          byte_match_statement {
            search_string         = "/api/status"
            positional_constraint = "STARTS_WITH"
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.app_name}-${var.env}-rate-limit-per-user-status"
      sampled_requests_enabled   = true
    }
  }

  # Rule 4: AWS Managed Rules — Common Rule Set
  # Protects against SQL injection, XSS, and other common attack vectors
  rule {
    name     = "aws-managed-common-rules"
    priority = 10

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
