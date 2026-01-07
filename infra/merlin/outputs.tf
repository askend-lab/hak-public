output "sqs_queue_url" {
  description = "URL of the Merlin SQS queue"
  value       = aws_sqs_queue.merlin.url
}

output "sqs_queue_arn" {
  description = "ARN of the Merlin SQS queue"
  value       = aws_sqs_queue.merlin.arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for audio files"
  value       = aws_s3_bucket.merlin_audio.id
}

output "s3_bucket_url" {
  description = "URL of the S3 bucket for audio files"
  value       = "https://${aws_s3_bucket.merlin_audio.bucket_regional_domain_name}"
}

output "ecr_repository_url" {
  description = "URL of the ECR repository for Merlin worker"
  value       = aws_ecr_repository.merlin_worker.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.merlin.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.merlin_worker.name
}
