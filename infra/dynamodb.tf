# DynamoDB table for SingleTableLambda
# Table is created by serverless.yml, this just manages access

data "aws_dynamodb_table" "single_table" {
  name = "single-table-lambda-${var.env}"
}

# IAM policy for readonly agent to access DynamoDB
resource "aws_iam_user_policy" "agent_dynamodb_access" {
  name = "hak-dynamodb-${var.env}-access"
  user = "agents/agent-readonly"

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
          data.aws_dynamodb_table.single_table.arn,
          "${data.aws_dynamodb_table.single_table.arn}/index/*"
        ]
      }
    ]
  })
}
