# Placeholder zip for Lambda function definitions
# Code is deployed externally by CI/CD — this is only needed for Terraform validation
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/.terraform/lambda-placeholder.zip"

  source {
    content  = "// Placeholder — code is deployed by CI/CD (aws lambda update-function-code)"
    filename = "index.js"
  }
}
