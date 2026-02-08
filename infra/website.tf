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

# Note: Artifacts bucket is centralized (see terraform.tfvars: artifacts_bucket)
# Use: {artifacts_bucket}/hak/builds/...
# See: /home/alex/users/sam/infra/terraform/artifacts.tf
