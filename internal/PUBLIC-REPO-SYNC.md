# Public Repository Sync — Internal Documentation

## Overview

HAK uses a **two-repository model**:

| Repository | URL | Visibility | Purpose |
|---|---|---|---|
| `hak` | `github.com/askend-lab/hak` | Private | Full monorepo with all packages, infra, CI/CD |
| `hak-public` | `github.com/askend-lab/hak-public` | Private (will become public) | Open-source mirror with sensitive content removed |

The public repository is a **filtered mirror** of the private one. It is never edited directly — all changes flow from `hak` → `hak-public` via an automated sync.

## How the Sync Works

### Trigger

Every push to `main` in `hak` triggers the GitHub Actions workflow `.github/workflows/sync-to-public.yml`. It runs `scripts/sync-to-public.sh` with the public repo URL.

### Process

1. **Clone** the private repo (shallow, branch `main`)
2. **Read** `.opensource-exclude` for paths to remove
3. **Delete** excluded files/directories (handles both regular files and broken symlinks)
4. **Clean up** `package.json`:
   - Remove internal scripts (`dx`, `dx:cli`, `postinstall`, `kill-ports`, `start:backend`)
   - Add public-facing scripts (`test`, `build`, `typecheck`, `start`, `prepare`, `lint`, `check`)
   - Add `"prepare": "husky"` to activate pre-commit hooks for external contributors
   - Remove internal-only devDependencies (`gherkin-lint`, `gitleaks`, `knip`, `madge`)
   - Rewrite repository URLs (`askend-lab/hak` → `askend-lab/hak-public`)
5. **Clean up** frontend `package.json` — remove workspace deps on excluded packages
6. **Clean up** `eslint.config.mjs` — remove DevBox reference
7. **Clean up** `.gitignore` — remove internal path references
8. **Replace** `README.md` with `README.public.md`, `CONTRIBUTING.md` with `CONTRIBUTING.public.md`
9. **Delete** `pnpm-lock.yaml` (will be regenerated)
10. **Force push** to `hak-public` main branch

### Authentication

The sync uses a GitHub PAT stored as `PUBLIC_REPO_TOKEN` secret in the private repo. The PAT needs:
- `repo` scope (to push to `hak-public`)
- NO `workflow` scope needed (we exclude workflow files from sync)

## What Gets Excluded

Controlled by `.opensource-exclude` in the repo root. Current exclusions:

### Internal Tooling
- `devbox`, `devbox.yaml`, `defaults.yaml` — DevBox configuration
- `.githooks/` — Git hooks (DevBox-managed, replaced by `.husky/` in public repo)
- `.gherkin-lintrc` — Gherkin linter config (internal tool)
- `.agent-channel` — Agent communication

### Infrastructure
- `infra/` — Terraform, AWS config
- `docker-compose.yml` — Local dev orchestration
- `.env.example` — Environment template with internal values

### Packages
- `packages/tara-auth/` — Estonian eID authentication (security-sensitive)
- `packages/task-channel/` — Internal agent task communication

### E2E Tests
- `packages/frontend/e2e/` — Depends on AWS Secrets Manager, Cognito test users

### CI/CD
- All workflows except what's in public repo
- `.github/dependabot.yml`, `.github/workflows/codeql.yml`

### Config Files
- `babel.config.js`, `jest.config.js`, `jest.setup.ts` — Reference internal packages
- `knip.json`, `.npmrc`, `.gitleaks.toml` — Internal tools/config

### Internal Docs
- `README.md`, `CONTRIBUTING.md` — Replaced by `*.public.md` versions
- `docs/DEPLOYMENT.md` — Internal deployment guide
- `internal/` — This directory

## What Gets Modified During Sync

These files exist in the private repo but are **transformed** during sync:

| File | Transformation |
|---|---|
| `package.json` | Scripts replaced, `prepare: husky` added, internal devDeps removed, URLs rewritten |
| `packages/frontend/package.json` | Workspace deps on excluded packages removed |
| `eslint.config.mjs` | DevBox comment removed |
| `.gitignore` | Internal path references removed |
| `README.public.md` → `README.md` | Renamed |
| `CONTRIBUTING.public.md` → `CONTRIBUTING.md` | Renamed |

### Pre-commit Hooks (Public Repo)

The public repo uses **Husky + lint-staged** instead of DevBox:

- `.husky/pre-commit` runs `pnpm lint-staged`
- `lint-staged` runs ESLint on staged `.ts/.tsx/.js/.mjs/.cjs` files
- `"prepare": "husky"` in `package.json` activates hooks on `pnpm install`
- Full lint + typecheck + tests run in CI (`.github/workflows/build.yml`)

## How to Add/Remove Content from Public Repo

### To exclude something new:
1. Add the path to `.opensource-exclude`
2. If needed, add cleanup logic to `scripts/sync-to-public.sh`
3. Merge to main — sync will run automatically

### To open-source a package:
1. Remove the path from `.opensource-exclude`
2. Update `README.public.md` and `CONTRIBUTING.public.md`
3. Check for hardcoded secrets, internal URLs, AWS account IDs
4. Merge to main — sync will run automatically

### Testing changes locally:
```bash
# Dry run — shows what would be removed
scripts/sync-to-public.sh --dry-run

# Dry run — outputs filtered tree to a directory for inspection
scripts/sync-to-public.sh --dry-run --output /tmp/hak-public-preview
```

## Public Repo Configuration

### Repository Settings
- **Description:** HAK — Estonian Language Learning Platform
- **Topics:** estonian, language-learning, text-to-speech, react, typescript, morphological-analysis, education, open-source, serverless, monorepo
- **Discussions:** Enabled
- **Wiki:** Disabled
- **Projects:** Disabled

### Branch Protection (main)
- Required PR reviews: 1
- Dismiss stale reviews: Yes
- Enforce admins: No (sync needs to bypass)
- Allow force pushes: Yes (sync uses force push)
- Required conversation resolution: Yes

## Security Checklist

Before opening new content, verify:

- [ ] No hardcoded API keys, tokens, or secrets
- [ ] No AWS account IDs or ARNs
- [ ] No internal domain names (except `askend-lab.com` which is known/accepted)
- [ ] No Cognito user pool IDs or client IDs (use env vars with empty defaults)
- [ ] No references to internal tools (DevBox, agent-channel)
- [ ] No E2E test credentials or AWS Secrets Manager references
- [ ] `scripts/sync-to-public.sh --dry-run --output /tmp/check` passes inspection
