# IAM policy for agent to access DynamoDB (read + write)
# Note: simplestore-* tables are managed by Serverless (packages/simplestore/serverless.yml)
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
          "dynamodb:Query"
        ]
        Resource = [
          "arn:aws:dynamodb:${local.region}:${data.aws_caller_identity.current.account_id}:table/simplestore-${var.env}",
          "arn:aws:dynamodb:${local.region}:${data.aws_caller_identity.current.account_id}:table/simplestore-${var.env}/index/*"
        ]
      }
    ]
  })
}
