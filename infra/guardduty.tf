# AWS GuardDuty — threat detection
# Monitors for compromised credentials, unusual API calls, crypto mining, etc.

resource "aws_guardduty_detector" "main" {
  enable = true

  datasources {
    s3_logs {
      enable = true
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.app_name}-${var.env}-guardduty"
  })
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = aws_guardduty_detector.main.id
}
