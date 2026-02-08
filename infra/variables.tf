variable "env" {
  description = "Environment name (dev or prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.env)
    error_message = "Environment must be either 'dev' or 'prod'"
  }
}

variable "use_prod_merlin" {
  description = "Use prod Merlin API for audio generation (allows disabling dev Merlin)"
  type        = bool
  default     = false
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

variable "slack_webhook_url" {
  description = "Slack webhook URL for CloudWatch alerts (create at https://api.slack.com/apps)"
  type        = string
  default     = ""
  sensitive   = true
}
