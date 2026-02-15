# AWS GuardDuty — threat detection
# Monitors for compromised credentials, unusual API calls, crypto mining, etc.
# GuardDuty is per-account, not per-environment — only create in dev (both envs share one AWS account)

resource "aws_guardduty_detector" "main" {
  count  = var.env == "dev" ? 1 : 0
  enable = true

  datasources {
    s3_logs {
      enable = true
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-guardduty"
  })
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID (only created in dev)"
  value       = var.env == "dev" ? aws_guardduty_detector.main[0].id : "n/a"
}
