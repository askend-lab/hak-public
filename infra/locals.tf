# Read API Gateway URLs from Serverless CloudFormation stacks
# These APIs have no public DNS — only reachable through CloudFront
data "aws_cloudformation_stack" "merlin_api" {
  name = "merlin-api-${var.env}"
}

data "aws_cloudformation_stack" "vabamorf_api" {
  name = "vabamorf-api-${var.env}"
}

data "aws_cloudformation_stack" "simplestore_api" {
  name = "simplestore-${var.env}"
}

data "aws_cloudformation_stack" "tara_auth_api" {
  name = "tara-auth-${var.env}"
}

locals {
  app_name = "hak"
  region   = "eu-west-1"

  # Domain logic: dev → hak-dev.example.com, prod → hak.example.com
  domain_name = var.env == "prod" ? "${local.app_name}.${var.domain_name}" : "${local.app_name}-${var.env}.${var.domain_name}"

  # API Gateway domains (no public DNS — extracted from CloudFormation outputs)
  # HTTP APIs (v2): format https://{api-id}.execute-api.{region}.amazonaws.com (no stage path)
  merlin_api_domain   = replace(data.aws_cloudformation_stack.merlin_api.outputs["ApiEndpoint"], "https://", "")
  vabamorf_api_domain = replace(data.aws_cloudformation_stack.vabamorf_api.outputs["ApiEndpoint"], "https://", "")

  # REST APIs (v1): format https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
  # Extract hostname only (split on /, take first element); stage is handled via origin_path
  simplestore_api_domain = split("/", replace(data.aws_cloudformation_stack.simplestore_api.outputs["ApiEndpoint"], "https://", ""))[0]
  tara_auth_api_domain   = split("/", replace(data.aws_cloudformation_stack.tara_auth_api.outputs["TaraAuthEndpoint"], "https://", ""))[0]

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
  # rewrite: true = apply path prefix stripping (/api/* → /*, /auth/* → /*)
  # auth: true = forward Authorization header (authenticated SimpleStore routes)
  # cookies: "all" = forward cookies (needed for auth state), "none" = strip cookies
  api_routes = [
    { path = "/api/analyze",    origin = "vabamorf-api",    rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/variants",   origin = "vabamorf-api",    rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/synthesize", origin = "merlin-api",      rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/status/*",   origin = "merlin-api",      rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/save",       origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/get",        origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/delete",     origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/query",      origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/get-shared", origin = "simplestore-api", rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/get-public", origin = "simplestore-api", rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/auth/tara/*",    origin = "auth-api",        rewrite = true, auth = false, query_string = true,  cookies = "all"  },
    { path = "/api/health",    origin = "merlin-api",      rewrite = true, auth = false, query_string = false, cookies = "none" },
  ]
}
