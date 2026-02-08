# System Dependencies for Quality System

> Tools that need to be installed at the system level before hooks can run.
> Collect here, install together with Alex.

## Required Tools

| # | Tool | Purpose | Hook | Install Command | Status |
|---|------|---------|------|-----------------|--------|
| 1 | gitleaks | Secret detection in code/history | `secret-detection` (S1) | `nix-env -iA gitleaks` or `brew install gitleaks` | NOT INSTALLED |
| 2 | hadolint | Dockerfile linting | `docker-lint` (S6) | `nix-env -iA hadolint` or `brew install hadolint` | NOT INSTALLED |
| 3 | tfsec | Terraform security scanning | `iac-security` (S5) | `nix-env -iA tfsec` or `brew install tfsec` | NOT INSTALLED |

## No-Fallback Policy

When these tools are installed, hooks must **fail hard** if they are missing.
Currently the base DevBox config has graceful fallbacks (e.g. secret-detection
skips silently when gitleaks is absent). We will override this behavior in
HAK's `devbox.yaml` once tools are installed — not in the base config to
avoid breaking other projects.

## Notes

- All tools above block items in the master plan (S1, S5, S6)
- Until installed, these items are marked as BLOCKED in the plan
- After installation, enable hooks in `devbox.yaml` and verify they fail/pass
