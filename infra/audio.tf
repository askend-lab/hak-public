# Audio System Infrastructure
# S3 bucket for audio cache, SQS queue for generation requests

# S3 Bucket for audio cache
resource "aws_s3_bucket" "audio" {
  bucket = "hak-audio-${var.env}"

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio"
  }
}

resource "aws_s3_bucket_public_access_block" "audio" {
  bucket = aws_s3_bucket.audio.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "audio" {
  bucket = aws_s3_bucket.audio.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.audio.arn}/cache/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.audio]
}

resource "aws_s3_bucket_cors_configuration" "audio" {
  bucket = aws_s3_bucket.audio.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# SQS Queue for audio generation requests
resource "aws_sqs_queue" "audio_generation" {
  name                       = "hak-audio-generation-${var.env}"
  visibility_timeout_seconds = 300  # 5 minutes for TTS processing
  message_retention_seconds  = 86400  # 1 day
  receive_wait_time_seconds  = 20  # Long polling

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio"
  }
}

# Dead letter queue for failed messages
resource "aws_sqs_queue" "audio_generation_dlq" {
  name                      = "hak-audio-generation-dlq-${var.env}"
  message_retention_seconds = 1209600  # 14 days

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio"
  }
}

resource "aws_sqs_queue_redrive_policy" "audio_generation" {
  queue_url = aws_sqs_queue.audio_generation.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.audio_generation_dlq.arn
    maxReceiveCount     = 3
  })
}

# IAM Role for Audio API Lambda
resource "aws_iam_role" "audio_api_lambda" {
  name = "hak-audio-api-lambda-${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio-api"
  }
}

resource "aws_iam_role_policy" "audio_api_lambda" {
  name = "hak-audio-api-lambda-policy-${var.env}"
  role = aws_iam_role.audio_api_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:HeadObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.audio.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.audio_generation.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# IAM Role for Fargate Worker
resource "aws_iam_role" "audio_worker" {
  name = "hak-audio-worker-${var.env}"

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

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio-worker"
  }
}

resource "aws_iam_role_policy" "audio_worker" {
  name = "hak-audio-worker-policy-${var.env}"
  role = aws_iam_role.audio_worker.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.audio_generation.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.audio.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Outputs
output "audio_bucket_name" {
  description = "S3 bucket name for audio cache"
  value       = aws_s3_bucket.audio.bucket
}

output "audio_bucket_url" {
  description = "S3 bucket URL for audio cache"
  value       = "https://${aws_s3_bucket.audio.bucket}.s3.amazonaws.com"
}

output "audio_queue_url" {
  description = "SQS queue URL for audio generation"
  value       = aws_sqs_queue.audio_generation.url
}

output "audio_queue_arn" {
  description = "SQS queue ARN for audio generation"
  value       = aws_sqs_queue.audio_generation.arn
}

output "audio_api_lambda_role_arn" {
  description = "IAM role ARN for audio-api Lambda"
  value       = aws_iam_role.audio_api_lambda.arn
}

output "audio_worker_role_arn" {
  description = "IAM role ARN for audio worker Fargate task"
  value       = aws_iam_role.audio_worker.arn
}

# ECS Cluster for audio worker
resource "aws_ecs_cluster" "hak" {
  name = "hak-${var.env}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Project     = "hak"
    Environment = var.env
  }
}

# ECS Task Execution Role (for pulling images, logs)
resource "aws_iam_role" "ecs_task_execution" {
  name = "hak-ecs-task-execution-${var.env}"

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

  tags = {
    Project     = "hak"
    Environment = var.env
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch Log Group for audio worker
resource "aws_cloudwatch_log_group" "audio_worker" {
  name              = "/ecs/hak-audio-worker-${var.env}"
  retention_in_days = 14

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio-worker"
  }
}

# ECS Task Definition for audio worker
resource "aws_ecs_task_definition" "audio_worker" {
  family                   = "hak-audio-worker-${var.env}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.audio_worker.arn

  container_definitions = jsonencode([
    {
      name  = "audio-worker"
      image = "465168436856.dkr.ecr.eu-west-1.amazonaws.com/askend-lab:audio-worker-${var.env}-latest"
      
      environment = [
        {
          name  = "QUEUE_URL"
          value = aws_sqs_queue.audio_generation.url
        },
        {
          name  = "BUCKET_NAME"
          value = aws_s3_bucket.audio.bucket
        },
        {
          name  = "MERLIN_URL"
          value = "https://swq24fqfiu.eu-west-1.awsapprunner.com/synthesize"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.audio_worker.name
          "awslogs-region"        = "eu-west-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio-worker"
  }
}

# Default VPC data source
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security group for audio worker
resource "aws_security_group" "audio_worker" {
  name        = "hak-audio-worker-${var.env}"
  description = "Security group for audio worker Fargate tasks"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio-worker"
  }
}

# ECS Service for audio worker
resource "aws_ecs_service" "audio_worker" {
  name            = "audio-worker"
  cluster         = aws_ecs_cluster.hak.id
  task_definition = aws_ecs_task_definition.audio_worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.audio_worker.id]
    assign_public_ip = true
  }

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio-worker"
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.hak.name
}

output "audio_worker_service_name" {
  description = "Audio worker ECS service name"
  value       = aws_ecs_service.audio_worker.name
}
