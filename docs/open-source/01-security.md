# Phase 1: Security & Secrets

> CRITICAL — must be completed before any public repository access.
> Every item: 🔧 = DevBox hook exists, ✅ = all green. No manual fixes without a hook.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [x] | [ ] | No secrets in code | `secret-detection` | gitleaks |
| [x] | [ ] | No vulnerable deps | `security-audit` | pnpm audit |
| [x] | [ ] | License compatibility | `license-check` | license-checker |
| [ ] | [ ] | No hardcoded env values | NEW: `no-hardcoded-env` | grep patterns |
| [ ] | [ ] | No internal path refs | NEW: `no-internal-refs` | grep patterns |
| [ ] | [ ] | IaC security | NEW: `run-tfsec` | tfsec |
| [ ] | [ ] | Docker security | NEW: `run-docker-lint` | hadolint |

## Manual Gates (one-time, pre-launch)

### Cleanup (done)
- [x] Remove `docs/code-review/`, `CODE_REVIEW_PLAN.md`
- [x] Remove `docs/plans/` (migration plans, kept TARA)
- [x] Remove `coverage-report.txt`

### Cleanup (remaining)
- [ ] Remove `.agent-channel`, `.test-runner-state.json`
- [ ] Remove or sanitize `audits/` directory
- [ ] Remove or package `packages/vendor/eki-storybook`
- [ ] Sanitize `BACKLOG.md`

### Git History
- [ ] Run `gitleaks detect` on full history (830+ commits)
- [ ] Purge secrets if found (`git filter-repo`)
- [ ] Decide: clean initial commit vs. sanitized history

### Auth Hardening (verified by `run-tests`)
- [ ] Audit token handling, PKCE (RFC 7636), JWT verification
- [ ] Harden CORS, add CSP headers, add rate limiting
