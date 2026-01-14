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
