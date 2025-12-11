terraform {
  backend "s3" {
    bucket         = "askend-lab-terraform-state"
    # Key will be set via -backend-config in workflow: hak/dev/terraform.tfstate or hak/prod/terraform.tfstate
    region         = "eu-west-1"
    dynamodb_table = "askend-lab-terraform-locks"
    encrypt        = true
  }
}
