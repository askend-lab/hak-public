terraform {
  backend "s3" {
    bucket         = "askend-lab-terraform-state"
    region         = "eu-west-1"
    dynamodb_table = "askend-lab-terraform-locks"
    encrypt        = true
    # Key set via -backend-config: merlin/dev/terraform.tfstate or merlin/prod/terraform.tfstate
  }
}
