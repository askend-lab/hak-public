terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name_prefix = "${var.project}-merlin-${var.env}"
  ecr_repo    = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/merlin-worker"

  tags = {
    Project     = var.project
    Environment = var.env
    Service     = "merlin"
    ManagedBy   = "Terraform"
  }
}

# =============================================================================
# SQS Queue for audio generation requests
# =============================================================================

resource "aws_sqs_queue" "merlin_dlq" {
  name = "${local.name_prefix}-dlq"

  message_retention_seconds = 1209600  # 14 days

  tags = local.tags
}

resource "aws_sqs_queue" "merlin" {
  name = "${local.name_prefix}-queue"

  visibility_timeout_seconds = 300  # 5 minutes (longer than generation time)
  message_retention_seconds  = 86400  # 1 day
  receive_wait_time_seconds  = 20  # Long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.merlin_dlq.arn
    maxReceiveCount     = 3
  })

  tags = local.tags
}

# =============================================================================
# S3 Bucket for generated audio files (cache + results)
# =============================================================================

resource "aws_s3_bucket" "merlin_audio" {
  bucket = "${local.name_prefix}-audio"

  tags = local.tags
}

resource "aws_s3_bucket_lifecycle_configuration" "merlin_audio" {
  bucket = aws_s3_bucket.merlin_audio.id

  rule {
    id     = "expire-old-audio"
    status = "Enabled"

    filter {
      prefix = "cache/"
    }

    expiration {
      days = 30
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "merlin_audio" {
  bucket = aws_s3_bucket.merlin_audio.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_public_access_block" "merlin_audio" {
  bucket = aws_s3_bucket.merlin_audio.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "merlin_audio_public_read" {
  bucket = aws_s3_bucket.merlin_audio.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.merlin_audio.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.merlin_audio]
}

# =============================================================================
# ECR Repository for Merlin worker image
# =============================================================================

resource "aws_ecr_repository" "merlin_worker" {
  name                 = "merlin-worker"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = local.tags
}

resource "aws_ecr_lifecycle_policy" "merlin_worker" {
  repository = aws_ecr_repository.merlin_worker.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# =============================================================================
# ECS Cluster
# =============================================================================

resource "aws_ecs_cluster" "merlin" {
  name = local.name_prefix

  setting {
    name  = "containerInsights"
    value = "disabled"
  }

  tags = local.tags
}

resource "aws_ecs_cluster_capacity_providers" "merlin" {
  cluster_name = aws_ecs_cluster.merlin.name

  capacity_providers = ["FARGATE_SPOT", "FARGATE"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 100
    base              = 0
  }
}

# =============================================================================
# IAM Role for ECS Task Execution
# =============================================================================

resource "aws_iam_role" "ecs_task_execution" {
  name = "${local.name_prefix}-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# =============================================================================
# IAM Role for ECS Task (application permissions)
# =============================================================================

resource "aws_iam_role" "ecs_task" {
  name = "${local.name_prefix}-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy" "ecs_task" {
  name = "${local.name_prefix}-task-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl"
        ]
        Resource = aws_sqs_queue.merlin.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.merlin_audio.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.merlin.arn}:*"
      }
    ]
  })
}

# =============================================================================
# CloudWatch Log Group
# =============================================================================

resource "aws_cloudwatch_log_group" "merlin" {
  name              = "/ecs/${local.name_prefix}"
  retention_in_days = 14

  tags = local.tags
}

# =============================================================================
# ECS Task Definition
# =============================================================================

resource "aws_ecs_task_definition" "merlin_worker" {
  family                   = "${local.name_prefix}-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.merlin_cpu
  memory                   = var.merlin_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "merlin-worker"
      image = "${local.ecr_repo}:${var.merlin_image_tag}"

      essential = true

      environment = [
        {
          name  = "SQS_QUEUE_URL"
          value = aws_sqs_queue.merlin.url
        },
        {
          name  = "S3_BUCKET"
          value = aws_s3_bucket.merlin_audio.id
        },
        {
          name  = "AWS_REGION"
          value = "eu-west-1"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.merlin.name
          "awslogs-region"        = "eu-west-1"
          "awslogs-stream-prefix" = "worker"
        }
      }
    }
  ])

  tags = local.tags
}

# =============================================================================
# ECS Service on Fargate Spot
# =============================================================================

resource "aws_ecs_service" "merlin_worker" {
  name            = "merlin-worker"
  cluster         = aws_ecs_cluster.merlin.id
  task_definition = aws_ecs_task_definition.merlin_worker.arn
  desired_count   = 0  # Scheduled scaling manages this

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 100
    base              = 0
  }

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.merlin_worker.id]
    assign_public_ip = true
  }

  tags = local.tags

  depends_on = [aws_ecs_cluster_capacity_providers.merlin]

  lifecycle {
    ignore_changes = [desired_count]  # Let auto-scaling target manage this
  }
}

# =============================================================================
# Auto-scaling: prod runs 24x7, dev is disabled (uses prod Merlin)
# =============================================================================

resource "aws_appautoscaling_target" "merlin_worker" {
  max_capacity       = var.env == "dev" ? 0 : 1
  min_capacity       = var.env == "dev" ? 0 : 1  # Dev disabled, prod 24x7
  resource_id        = "service/${aws_ecs_cluster.merlin.name}/${aws_ecs_service.merlin_worker.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# =============================================================================
# VPC / Networking (use default VPC)
# =============================================================================

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "merlin_worker" {
  name        = "${local.name_prefix}-worker-sg"
  description = "Security group for Merlin worker"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}
