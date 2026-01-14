variable "env" {
  description = "Environment (dev or prod)"
  type        = string
  default     = "dev"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "hak"
}

variable "merlin_image_tag" {
  description = "Docker image tag for Merlin worker"
  type        = string
  default     = "latest"
}

variable "merlin_cpu" {
  description = "CPU units for Fargate task (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "merlin_memory" {
  description = "Memory in MB for Fargate task"
  type        = number
  default     = 4096
}

