# DynamoDB table for SingleTableLambda
# Table created here, managed by Terraform

resource "aws_dynamodb_table" "single_table" {
  name         = "single-table-lambda-${var.env}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Project     = "hak"
    Environment = var.env
    Service     = "singletablelambda"
  }
}

# IAM policy for agent to access DynamoDB (read + write)
resource "aws_iam_user_policy" "agent_dynamodb_access" {
  name = "hak-dynamodb-${var.env}-access"
  user = "agent-readonly"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:dynamodb:${local.region}:${data.aws_caller_identity.current.account_id}:table/simplestore-${var.env}",
          "arn:aws:dynamodb:${local.region}:${data.aws_caller_identity.current.account_id}:table/simplestore-${var.env}/index/*"
        ]
      }
    ]
  })
}
