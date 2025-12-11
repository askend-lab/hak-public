# S3 bucket for website hosting
resource "aws_s3_bucket" "website" {
  bucket = local.website_bucket_name

  tags = merge(local.common_tags, {
    Name = local.website_bucket_name
  })
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # SPA routing - serve index.html for all 404s
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# S3 bucket for build artifacts (shared between environments)
resource "aws_s3_bucket" "artifacts" {
  bucket = local.artifacts_bucket_name

  tags = merge(local.common_tags, {
    Name = local.artifacts_bucket_name
  })

  # Only create in one environment to avoid conflict
  count = var.env == "dev" ? 1 : 0
}

resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts[0].id
  count  = var.env == "dev" ? 1 : 0

  rule {
    id     = "cleanup-old-builds"
    status = "Enabled"

    expiration {
      days = 30
    }

    filter {
      prefix = "builds/"
    }
  }
}
