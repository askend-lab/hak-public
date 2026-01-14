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
  region = "eu-west-1"
}

locals {
  name_prefix = "${var.project}-merlin-${var.env}"
  ecr_repo    = "465168436856.dkr.ecr.eu-west-1.amazonaws.com/merlin-worker"
  
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
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
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
# ECS Service with Auto-Scaling (scale-to-zero when idle)
# =============================================================================

resource "aws_ecs_service" "merlin_worker" {
  name            = "merlin-worker"
  cluster         = aws_ecs_cluster.merlin.id
  task_definition = aws_ecs_task_definition.merlin_worker.arn
  desired_count   = 0  # Start scaled down, auto-scaling manages this

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
    ignore_changes = [desired_count]  # Let auto-scaling manage this
  }
}

# =============================================================================
# Auto-Scaling (scale to 0 when idle, scale up on SQS messages)
# =============================================================================

resource "aws_appautoscaling_target" "merlin_worker" {
  max_capacity       = var.enabled ? 1 : 0  # When disabled, can't scale up at all
  min_capacity       = 0
  resource_id        = "service/${aws_ecs_cluster.merlin.name}/${aws_ecs_service.merlin_worker.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "merlin_scale_up" {
  name               = "${local.name_prefix}-scale-up"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.merlin_worker.resource_id
  scalable_dimension = aws_appautoscaling_target.merlin_worker.scalable_dimension
  service_namespace  = aws_appautoscaling_target.merlin_worker.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ExactCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }
}

resource "aws_appautoscaling_policy" "merlin_scale_down" {
  name               = "${local.name_prefix}-scale-down"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.merlin_worker.resource_id
  scalable_dimension = aws_appautoscaling_target.merlin_worker.scalable_dimension
  service_namespace  = aws_appautoscaling_target.merlin_worker.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ExactCapacity"
    cooldown                = 300  # 5 minutes before scaling down
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = 0
    }
  }
}

# CloudWatch alarm - scale up when messages in queue (fallback for warmup)
resource "aws_cloudwatch_metric_alarm" "merlin_queue_high" {
  alarm_name          = "${local.name_prefix}-queue-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "Scale up Merlin worker when messages in queue (fallback)"

  dimensions = {
    QueueName = aws_sqs_queue.merlin.name
  }

  alarm_actions = [aws_appautoscaling_policy.merlin_scale_up.arn]
  tags          = local.tags
}

# CloudWatch alarm - scale down when queue empty for 15 min
resource "aws_cloudwatch_metric_alarm" "merlin_queue_low" {
  alarm_name          = "${local.name_prefix}-queue-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 15
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "Scale down Merlin worker when queue empty for 15 min"

  dimensions = {
    QueueName = aws_sqs_queue.merlin.name
  }

  alarm_actions = [aws_appautoscaling_policy.merlin_scale_down.arn]
  tags          = local.tags
}

# =============================================================================
# Scheduled Scaling: Keep 1 instance running 9:00-21:00 GMT+2 (7:00-19:00 UTC)
# Outside these hours, WakeUpper handles on-demand scaling
# =============================================================================

resource "aws_appautoscaling_scheduled_action" "merlin_morning_scale_up" {
  name               = "${local.name_prefix}-morning-scale-up"
  service_namespace  = aws_appautoscaling_target.merlin_worker.service_namespace
  resource_id        = aws_appautoscaling_target.merlin_worker.resource_id
  scalable_dimension = aws_appautoscaling_target.merlin_worker.scalable_dimension
  schedule           = "cron(0 7 ? * MON-FRI *)"
  timezone           = "UTC"

  scalable_target_action {
    min_capacity = 1
    max_capacity = 1
  }
}

resource "aws_appautoscaling_scheduled_action" "merlin_evening_scale_down" {
  name               = "${local.name_prefix}-evening-scale-down"
  service_namespace  = aws_appautoscaling_target.merlin_worker.service_namespace
  resource_id        = aws_appautoscaling_target.merlin_worker.resource_id
  scalable_dimension = aws_appautoscaling_target.merlin_worker.scalable_dimension
  schedule           = "cron(0 19 ? * MON-FRI *)"
  timezone           = "UTC"

  scalable_target_action {
    min_capacity = 0
    max_capacity = 1
  }
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
