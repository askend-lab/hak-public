terraform {
  backend "s3" {
    bucket         = "askend-lab-terraform-state"
    key            = "hak/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "askend-lab-terraform-locks"
    encrypt        = true
  }
}
