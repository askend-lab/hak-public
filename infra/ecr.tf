# ECR Repository for vabamorf-api Lambda container images
resource "aws_ecr_repository" "vabamorf_api" {
  name                 = "vabamorf-api"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project     = "hak"
    Environment = "shared"
    Service     = "vabamorf-api"
  }
}

# Lifecycle policy to keep only recent images
resource "aws_ecr_lifecycle_policy" "vabamorf_api" {
  repository = aws_ecr_repository.vabamorf_api.name

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

output "ecr_vabamorf_api_url" {
  description = "ECR repository URL for vabamorf-api"
  value       = aws_ecr_repository.vabamorf_api.repository_url
}
