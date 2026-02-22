variable "env" {
  description = "Environment name (dev or prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.env)
    error_message = "Environment must be either 'dev' or 'prod'"
  }
}

variable "domain_name" {
  description = "Base domain name (e.g. example.com)"
  type        = string
}

variable "wildcard_cert_arn" {
  description = "ARN of the wildcard ACM certificate for the domain"
  type        = string
}

variable "artifacts_bucket" {
  description = "S3 bucket name for build artifacts"
  type        = string
}

variable "terraform_state_bucket" {
  description = "S3 bucket name for Terraform state"
  type        = string
}

variable "terraform_locks_table" {
  description = "DynamoDB table name for Terraform state locking"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain name override (e.g. haaldusabiline.eki.ee). When set, overrides the computed domain."
  type        = string
  default     = ""
}

variable "manage_dns" {
  description = "Whether Terraform manages DNS records. Set to false for external domains (e.g. eki.ee)"
  type        = bool
  default     = true
}

variable "monthly_budget_limit" {
  description = "Monthly budget limit in USD for HAK application resources (PUB-1)"
  type        = string
  default     = "100"
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for CloudWatch alerts (create at https://api.slack.com/apps)"
  type        = string
  default     = ""
  sensitive   = true
}
