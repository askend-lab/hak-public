# API Gateway domains — constructed from Terraform-managed API Gateway resources
# These APIs have no public DNS — only reachable through CloudFront

locals {
  app_name   = "hak"
  region     = "eu-west-1"
  account_id = data.aws_caller_identity.current.account_id

  # Domain logic: dev → hak-dev.example.com, prod → hak.example.com
  domain_name = var.env == "prod" ? "${local.app_name}.${var.domain_name}" : "${local.app_name}-${var.env}.${var.domain_name}"

  # API Gateway domains (no public DNS — constructed from Terraform resources)
  # HTTP APIs (v2): format {api-id}.execute-api.{region}.amazonaws.com
  merlin_api_domain   = "${aws_apigatewayv2_api.tts.id}.execute-api.${local.region}.amazonaws.com"
  vabamorf_api_domain = "${aws_apigatewayv2_api.morphology.id}.execute-api.${local.region}.amazonaws.com"

  # REST APIs (v1): format {api-id}.execute-api.{region}.amazonaws.com
  # Stage path is handled via origin_path in CloudFront
  simplestore_api_domain = "${aws_api_gateway_rest_api.store.id}.execute-api.${local.region}.amazonaws.com"
  tara_auth_api_domain   = "${aws_api_gateway_rest_api.auth.id}.execute-api.${local.region}.amazonaws.com"

  # Lambda environment: allowed CORS origins
  frontend_url    = "https://${local.domain_name}"
  allowed_origin  = var.env == "prod" ? "${local.frontend_url},https://haaldusabiline.eki.ee" : local.frontend_url
  custom_frontend = var.env == "prod" ? "https://haaldusabiline.eki.ee" : ""

  # TARA authentication issuer
  tara_issuer = var.env == "prod" ? "https://tara.ria.ee" : "https://tara-test.ria.ee"

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
  # auth: true = forward Authorization header (authenticated API routes)
  # cookies: "all" = forward cookies (needed for auth state), "none" = strip cookies
  api_routes = [
    { path = "/api/analyze",    origin = "vabamorf-api",    rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/variants",   origin = "vabamorf-api",    rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/synthesize", origin = "merlin-api",      rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/status/*",   origin = "merlin-api",      rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/save",       origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/get",        origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/delete",     origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/query",      origin = "simplestore-api", rewrite = true, auth = true,  query_string = true,  cookies = "none" },
    { path = "/api/get-shared", origin = "simplestore-api", rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/api/get-public", origin = "simplestore-api", rewrite = true, auth = false, query_string = true,  cookies = "none" },
    { path = "/auth/tara/*",    origin = "auth-api",        rewrite = true, auth = false, query_string = true,  cookies = "all"  },
    { path = "/authtara/*",     origin = "auth-api",        rewrite = true, auth = false, query_string = true,  cookies = "all"  },
    { path = "/api/health",    origin = "merlin-api",      rewrite = true, auth = false, query_string = false, cookies = "none" },
  ]
}
