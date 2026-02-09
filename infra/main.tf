terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

# Import existing infrastructure (Route53)
data "terraform_remote_state" "infra" {
  backend = "s3"

  config = {
    bucket = var.terraform_state_bucket
    key    = "infra/terraform.tfstate"
    region = "eu-west-1"
  }
}
