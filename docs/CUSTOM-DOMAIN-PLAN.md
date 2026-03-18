# Custom Domain Plan: haaldusabiline.eki.ee

## Overview

Connect `haaldusabiline.eki.ee` (owned by EKI) to HAK prod environment (`hak.askend-lab.com`).

## Current State

| Item | Dev | Prod |
|------|-----|------|
| Primary domain | `hak-dev.askend-lab.com` | `hak.askend-lab.com` |
| `custom_domain` in tfvars | `haaldusabiline.eki.ee` | **not set** |
| ACM cert for custom domain | created (pending validation) | **not created** |
| CloudFront alias | `hak-dev.askend-lab.com` only | `hak.askend-lab.com` only |

## CI/CD Context

- Infra changes in `infra/**` trigger `terraform.yml` workflow on merge to main
- Workflow runs `terraform plan` on PR, `terraform apply` on merge — for **both** dev and prod sequentially
- No manual terraform needed — everything goes through CI/CD
- **Risk:** terraform apply runs for both environments, so changes must be safe for both

## Plan

### Phase 1: Create ACM Certificate (PR → merge → auto-apply)

- [ ] **[Kate]** Add `custom_domain = "haaldusabiline.eki.ee"` to `infra/environments/prod.tfvars`
- [ ] **[Kate]** Create branch, commit, push, create PR
- [ ] **[CI/CD]** PR triggers `terraform plan` — review plan output (should only add ACM cert for prod)
- [ ] **[Alex]** Review & approve PR
- [ ] **[CI/CD]** Merge triggers `terraform apply` — ACM cert created in us-east-1 (pending DNS validation)
- [ ] **[Kate]** Get validation CNAME values from terraform output (CI logs or AWS Console)

### Phase 2: DNS Validation (client action)

- [ ] **[Tatjana]** Send EKI two CNAME records:
  1. ACM validation: `_xxxx.haaldusabiline.eki.ee` → `_yyyy.acm-validations.aws` (from Phase 1 output)
  2. Service routing: `haaldusabiline.eki.ee` → CloudFront domain (from `terraform output cloudfront_domain`)
- [ ] **[EKI]** Add both CNAME records to their DNS
- [ ] **[Auto]** ACM certificate validates (usually within minutes after DNS propagation)

### Phase 3: Wire Custom Domain to CloudFront (PR → merge → auto-apply)

After ACM cert status = "Issued":

- [ ] **[Kate]** Update `infra/cloudfront.tf`:
  - Line 77: Change `aliases = [local.domain_name]` to include custom domain when set:
    ```hcl
    aliases = var.custom_domain != "" ? [local.domain_name, var.custom_domain] : [local.domain_name]
    ```
  - Line 211-214: Use custom domain cert when available:
    ```hcl
    viewer_certificate {
      acm_certificate_arn      = var.custom_domain != "" ? aws_acm_certificate.custom_domain[0].arn : aws_acm_certificate.website.arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
    ```
  - Add ACM validation wait for custom domain cert (so terraform doesn't try to use unvalidated cert):
    ```hcl
    resource "aws_acm_certificate_validation" "custom_domain" {
      count           = var.custom_domain != "" ? 1 : 0
      provider        = aws.us_east_1
      certificate_arn = aws_acm_certificate.custom_domain[0].arn
    }
    ```
- [ ] **[Kate]** Create branch, commit, push, create PR
- [ ] **[CI/CD]** `terraform plan` — review: should add custom domain alias + switch cert on prod only
- [ ] **[Alex]** Review & approve PR
- [ ] **[CI/CD]** `terraform apply` — CloudFront now serves `haaldusabiline.eki.ee`

### Phase 4: Verification

- [ ] **[Kate]** Verify: `curl -I https://haaldusabiline.eki.ee` → 200 OK
- [ ] **[Kate]** Verify HTTPS certificate in browser (valid for `haaldusabiline.eki.ee`)
- [ ] **[Kate]** Verify TARA auth: `https://haaldusabiline.eki.ee/auth/tara/` redirects correctly
- [ ] **[Tatjana]** Notify EKI that domain is live

## Safety Notes

- Phase 1 only creates an ACM cert — no impact on existing CloudFront/domains
- Phase 3 changes CloudFront aliases — this is the critical step. The cert MUST be validated before this, otherwise CloudFront will reject the config
- Dev environment already has `custom_domain` set but CloudFront alias not yet added — same Phase 3 change will enable it for dev too
- Consider: should dev also serve `haaldusabiline.eki.ee`? Probably not — one domain can only CNAME to one CloudFront. May want to remove `custom_domain` from dev.tfvars after prod is live.

## Questions for Alex

1. Should we remove `custom_domain` from `dev.tfvars` before Phase 3? (Two CloudFront distributions can't share the same alias)
2. Is Tatjana handling communication with EKI, or should we prepare the email text?
