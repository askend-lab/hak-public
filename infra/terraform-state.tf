terraform {
  backend "s3" {
    # Set via: terraform init -backend-config="bucket=your-terraform-state-bucket"
    bucket         = ""
    # Key will be set via -backend-config in workflow: hak/dev/terraform.tfstate or hak/prod/terraform.tfstate
    region         = "eu-west-1"
    # Set via: terraform init -backend-config="dynamodb_table=your-terraform-locks"
    dynamodb_table = ""
    encrypt        = true
  }
}
