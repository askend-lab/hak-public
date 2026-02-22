# AWS Budgets — Application-level cost monitoring (PUB-1)
# Tracks costs for resources tagged with Project=HAK
# Requires "Project" tag to be activated as Cost Allocation Tag in AWS Billing Console

resource "aws_budgets_budget" "hak_monthly" {
  name         = "hak-${var.env}-monthly-budget"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # Filter by Project tag — only tracks HAK resources
  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Project$HAK"]
  }

  # 70% warning — informational
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 70
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [aws_sns_topic.alerts.arn]
  }

  # 90% critical — action needed
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 90
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [aws_sns_topic.alerts.arn]
  }

  # 100% breached
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_sns_topic_arns  = [aws_sns_topic.alerts.arn]
  }

  # Forecasted to exceed budget
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_sns_topic_arns  = [aws_sns_topic.alerts.arn]
  }
}
