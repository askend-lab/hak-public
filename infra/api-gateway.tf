# API Gateway Custom Domain — REMOVED
# SimpleStore and Auth APIs are now routed through CloudFront using execute-api URLs.
# No public DNS for API Gateways — all traffic goes through CloudFront WAF.
#
# The custom domain (hak-api-{env}.askend-lab.com) and its Route53 record have been
# removed. The deploy workflow cleanup step handles removing any orphaned custom
# domains from API Gateway.
#
# If Terraform state still references the old resources, remove them:
#   terraform state rm aws_api_gateway_domain_name.api
#   terraform state rm aws_route53_record.api
