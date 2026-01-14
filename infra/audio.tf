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
  visibility_timeout_seconds = 300   # 5 minutes for TTS processing
  message_retention_seconds  = 86400 # 1 day
  receive_wait_time_seconds  = 20    # Long polling

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "audio"
  }
}

# Dead letter queue for failed messages
resource "aws_sqs_queue" "audio_generation_dlq" {
  name                      = "hak-audio-generation-dlq-${var.env}"
  message_retention_seconds = 1209600 # 14 days

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
