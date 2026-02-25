variable "aws_account_id" {
  description = "AWS account ID for ECR and other resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

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

variable "ecs_max_capacity" {
  description = "Maximum number of ECS workers (PUB-2: hard cap to prevent runaway scaling)"
  type        = number
  default     = 2
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


