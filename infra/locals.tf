locals {
  app_name = "hak"
  region   = "eu-west-1"

  # Domain logic: dev → hak-dev.example.com, prod → hak.example.com
  domain_name = var.env == "prod" ? "${local.app_name}.${var.domain_name}" : "${local.app_name}-${var.env}.${var.domain_name}"

  # API Gateway custom domains (managed by serverless-domain-manager)
  # dev: merlin-dev.askend-lab.com, prod: merlin.askend-lab.com
  merlin_api_domain   = var.env == "prod" ? "merlin.${var.domain_name}" : "merlin-${var.env}.${var.domain_name}"
  vabamorf_api_domain = var.env == "prod" ? "vabamorf.${var.domain_name}" : "vabamorf-${var.env}.${var.domain_name}"

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
    { path = "/api/save",       origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/get",        origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/delete",     origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/query",      origin = "simplestore-api", rewrite = false, auth = true,  query_string = true },
    { path = "/api/get-shared", origin = "simplestore-api", rewrite = false, auth = false, query_string = true },
    { path = "/api/get-public", origin = "simplestore-api", rewrite = false, auth = false, query_string = true },
  ]
}
