# Read API Gateway URLs from Serverless CloudFormation stacks
# These APIs have no public DNS — only reachable through CloudFront
data "aws_cloudformation_stack" "merlin_api" {
  name = "merlin-api-${var.env}"
}

data "aws_cloudformation_stack" "vabamorf_api" {
  name = "vabamorf-api-${var.env}"
}

locals {
  app_name = "hak"
  region   = "eu-west-1"

  # Domain logic: dev → hak-dev.example.com, prod → hak.example.com
  domain_name = var.env == "prod" ? "${local.app_name}.${var.domain_name}" : "${local.app_name}-${var.env}.${var.domain_name}"

  # API Gateway domains (no public DNS — extracted from CloudFormation outputs)
  # Use HttpApiUrl which exists in all stack versions (ApiEndpoint is missing in some prod stacks)
  merlin_api_domain   = replace(data.aws_cloudformation_stack.merlin_api.outputs["HttpApiUrl"], "https://", "")
  vabamorf_api_domain = replace(data.aws_cloudformation_stack.vabamorf_api.outputs["HttpApiUrl"], "https://", "")

  # Resource naming
  website_bucket_name     = "${local.app_name}-${var.env}-website"
  artifacts_bucket_name   = var.artifacts_bucket
  artifacts_bucket_prefix = local.app_name

  # Tags
  common_tags = {
    Project     = "HAK"
    Environment = var.env
    ManagedBy   = "Terraform"
  }

  # CloudFront API route cache behaviors (used by dynamic block in cloudfront.tf)
  # rewrite: true = apply /api/* → /* rewrite function (vabamorf, merlin)
  # auth: true = forward Authorization header (authenticated SimpleStore routes)
  api_routes = [
    { path = "/api/analyze",    origin = "vabamorf-api",    rewrite = true,  auth = false, query_string = true },
    { path = "/api/variants",   origin = "vabamorf-api",    rewrite = true,  auth = false, query_string = true },
    { path = "/api/synthesize", origin = "merlin-api",      rewrite = true,  auth = false, query_string = true },
    { path = "/api/status/*",   origin = "merlin-api",      rewrite = true,  auth = false, query_string = true },
    { path = "/api/warmup",     origin = "merlin-api",      rewrite = true,  auth = false, query_string = false },
    { path = "/api/save",       origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/get",        origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/delete",     origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/query",      origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/get-shared", origin = "simplestore-api", rewrite = false, auth = false, query_string = true },
    { path = "/api/get-public", origin = "simplestore-api", rewrite = false, auth = false, query_string = true },
  ]
}
