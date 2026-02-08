terraform {
  backend "s3" {
    # All values set via -backend-config flags in CI/CD:
    #   -backend-config="bucket=YOUR_STATE_BUCKET"
    #   -backend-config="dynamodb_table=YOUR_LOCK_TABLE"
    #   -backend-config="key=merlin/ENV/terraform.tfstate"
    region  = "eu-west-1"
    encrypt = true
  }
}
