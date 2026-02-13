#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2024-2026 Askend Lab
#
# Synchronize the internal HAK repository to the public open-source repository.
# Reads .opensource-exclude for paths to remove, then pushes a clean copy.
#
# Usage:
#   scripts/sync-to-public.sh <public-repo-url>        # push to public repo
#   scripts/sync-to-public.sh --dry-run                 # preview what would be removed
#   scripts/sync-to-public.sh --dry-run --output /tmp/x # copy filtered tree to a directory
#
# Requirements: git, rsync

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXCLUDE_FILE="$REPO_ROOT/.opensource-exclude"
BRANCH="main"

# --- Parse arguments ---
DRY_RUN=false
OUTPUT_DIR=""
PUBLIC_REPO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)  DRY_RUN=true; shift ;;
    --output)   OUTPUT_DIR="$2"; shift 2 ;;
    --branch)   BRANCH="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--dry-run] [--output DIR] [--branch BRANCH] [PUBLIC_REPO_URL]"
      echo ""
      echo "  PUBLIC_REPO_URL   Git remote URL for the public repository"
      echo "  --dry-run         Preview excluded files without pushing"
      echo "  --output DIR      Copy filtered tree to DIR (implies --dry-run)"
      echo "  --branch BRANCH   Branch to sync (default: main)"
      exit 0
      ;;
    *)          PUBLIC_REPO="$1"; shift ;;
  esac
done

if [[ -n "$OUTPUT_DIR" ]]; then
  DRY_RUN=true
fi

if [[ "$DRY_RUN" == "false" && -z "$PUBLIC_REPO" ]]; then
  echo "Error: PUBLIC_REPO_URL is required (or use --dry-run)"
  echo "Usage: $0 [--dry-run] [--output DIR] PUBLIC_REPO_URL"
  exit 1
fi

# --- Read exclude patterns ---
if [[ ! -f "$EXCLUDE_FILE" ]]; then
  echo "Error: $EXCLUDE_FILE not found"
  exit 1
fi

EXCLUDES=()
while IFS= read -r line; do
  # Skip comments and empty lines
  line="${line%%#*}"
  line="$(echo "$line" | xargs)"
  [[ -z "$line" ]] && continue
  EXCLUDES+=("$line")
done < "$EXCLUDE_FILE"

echo "=== HAK Open-Source Sync ==="
echo "Source:  $REPO_ROOT (branch: $BRANCH)"
echo "Excludes: ${#EXCLUDES[@]} patterns from .opensource-exclude"
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Mode:    DRY RUN"
else
  echo "Target:  $PUBLIC_REPO"
fi
echo ""

# --- Create temporary working directory ---
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo ">>> Cloning current branch ($BRANCH) to temp directory..."
git clone --single-branch --branch "$BRANCH" "$REPO_ROOT" "$WORK_DIR/repo" --quiet

cd "$WORK_DIR/repo"

# --- Remove excluded paths ---
echo ">>> Removing excluded paths..."
REMOVED_COUNT=0
for pattern in "${EXCLUDES[@]}"; do
  # -e checks existing files, -L catches broken symlinks (e.g. defaults.yaml → devbox)
  if [[ -e "$pattern" || -L "$pattern" ]]; then
    echo "  - $pattern"
    rm -rf "$pattern"
    REMOVED_COUNT=$((REMOVED_COUNT + 1))
  fi
done
echo "  Removed $REMOVED_COUNT paths"

# --- Remove the exclude file itself (meta, not for public) ---
rm -f .opensource-exclude
rm -rf scripts/sync-to-public.sh

# --- Replace docs with public versions (*.public.md → *.md) ---
echo ">>> Replacing docs with public versions..."
for pub_file in *.public.md; do
  [[ ! -f "$pub_file" ]] && continue
  target="${pub_file%.public.md}.md"
  echo "  $pub_file → $target"
  mv "$pub_file" "$target"
done

# --- Copy public CI workflow (build.public.yml → .github/workflows/build.yml) ---
echo ">>> Setting up public CI workflow..."
if [[ -f .github/workflows/build.public.yml ]]; then
  mkdir -p .github/workflows
  mv .github/workflows/build.public.yml .github/workflows/build.yml
  echo "  build.public.yml → .github/workflows/build.yml"
fi

# --- Copy public .env.example ---
echo ">>> Setting up .env.example..."
if [[ -f .env.example.public ]]; then
  mv .env.example.public .env.example
  echo "  .env.example.public → .env.example"
fi

# --- Clean up pnpm-workspace.yaml (still points to packages/*) ---
# No change needed — pnpm ignores missing directories silently.

# --- Clean up root package.json ---
# Remove scripts that reference internal tools (devbox, kill-ports, backend)
echo ">>> Cleaning package.json..."
if command -v node &>/dev/null; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Remove internal scripts (devbox-dependent)
    const internalScripts = [
      'dx', 'dx:cli',
      'postinstall', 'kill-ports', 'start:backend'
    ];
    for (const s of internalScripts) {
      delete pkg.scripts[s];
    }

    // Replace devbox-dependent scripts with standalone equivalents
    pkg.scripts.prepare = 'husky';
    pkg.scripts.test = 'pnpm -r --filter=@hak/frontend run test:full && pnpm -r --filter=@hak/shared run test:full';
    pkg.scripts['test:full'] = pkg.scripts.test;
    pkg.scripts['test:coverage'] = 'pnpm -r --filter=@hak/frontend run test:coverage';
    pkg.scripts.start = 'pnpm --filter @hak/frontend dev';
    pkg.scripts.build = 'pnpm --filter @hak/frontend build';
    pkg.scripts.typecheck = 'pnpm --filter @hak/frontend --filter @hak/shared exec tsc --noEmit';
    pkg.scripts.lint = 'eslint --max-warnings=0 .';
    pkg.scripts.check = 'pnpm lint && pnpm typecheck && pnpm test:all';

    // Remove internal-only devDependencies
    for (const d of ['gherkin-lint', 'gitleaks', 'knip', 'madge']) delete pkg.devDependencies[d];

    // Rewrite repository URLs from private to public repo
    if (pkg.repository?.url) {
      pkg.repository.url = pkg.repository.url.replace('askend-lab/hak.git', 'askend-lab/hak-public.git');
    }
    if (pkg.bugs?.url) {
      pkg.bugs.url = pkg.bugs.url.replace('askend-lab/hak/', 'askend-lab/hak-public/');
    }
    if (pkg.homepage) {
      pkg.homepage = pkg.homepage.replace('askend-lab/hak#', 'askend-lab/hak-public#');
    }

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    console.log('  Cleaned package.json scripts and URLs');
  "
else
  echo "  Warning: node not available, skipping package.json cleanup"
fi

# --- Clean up frontend package.json (remove workspace deps on excluded packages) ---
echo ">>> Cleaning frontend package.json..."
if [[ -f packages/frontend/package.json ]] && command -v node &>/dev/null; then
  node -e "
    const fs = require('fs');
    const path = require('path');

    // Discover which workspace packages still exist
    const packagesDir = 'packages';
    const existingPackages = new Set();
    if (fs.existsSync(packagesDir)) {
      for (const dir of fs.readdirSync(packagesDir)) {
        const pkgJson = path.join(packagesDir, dir, 'package.json');
        if (fs.existsSync(pkgJson)) {
          const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
          existingPackages.add(pkg.name);
        }
      }
    }
    console.log('  Existing workspace packages:', [...existingPackages].join(', '));

    // Clean frontend package.json
    const frontendPkgPath = 'packages/frontend/package.json';
    const pkg = JSON.parse(fs.readFileSync(frontendPkgPath, 'utf8'));

    for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!pkg[depType]) continue;
      for (const [name, version] of Object.entries(pkg[depType])) {
        if (String(version).startsWith('workspace:') && !existingPackages.has(name)) {
          console.log('  Removing ' + depType + ': ' + name + '@' + version);
          delete pkg[depType][name];
        }
      }
    }

    fs.writeFileSync(frontendPkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('  Cleaned frontend package.json');
  "
fi

# --- Delete stale pnpm-lock.yaml (will be regenerated by pnpm install) ---
echo ">>> Removing stale pnpm-lock.yaml..."
rm -f pnpm-lock.yaml
echo "  Removed (will be regenerated by pnpm install)"

# --- Clean up docs/adr/README.md (remove broken ADR links if any excluded) ---
# Currently all ADRs are included in public repo, no cleanup needed

# --- Clean up eslint.config.mjs (remove DevBox reference) ---
echo ">>> Cleaning eslint.config.mjs..."
if [[ -f eslint.config.mjs ]]; then
  sed -i 's/from DevBox with/with/' eslint.config.mjs
  echo "  Removed DevBox reference"
fi

# --- Clean up tsconfig.json (jest.setup.ts is excluded, remove from include) ---
echo ">>> Cleaning tsconfig.json..."
if [[ -f tsconfig.json ]]; then
  node -e "
    const fs = require('fs');
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    tsconfig.include = tsconfig.include?.filter(p => p !== 'jest.setup.ts') ?? [];
    if (tsconfig.include.length === 0) delete tsconfig.include;
    fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2) + '\n');
    console.log('  Removed jest.setup.ts from include');
  "
fi

# --- Clean up PR template (fix typecheck command) ---
echo ">>> Cleaning pull_request_template.md..."
if [[ -f .github/pull_request_template.md ]]; then
  sed -i 's/pnpm -r exec tsc --noEmit/pnpm typecheck/' .github/pull_request_template.md
  echo "  Fixed typecheck command"
fi

# --- Clean up ARCHITECTURE.md (remove infra/ section and DevBox references) ---
echo ">>> Cleaning ARCHITECTURE.md..."
if [[ -f ARCHITECTURE.md ]]; then
  # Remove the Infrastructure section that references infra/ (which is excluded)
  node -e "
    const fs = require('fs');
    let content = fs.readFileSync('ARCHITECTURE.md', 'utf8');
    // Remove ## Infrastructure section (everything from '## Infrastructure' to next '##' or end)
    content = content.replace(/## Infrastructure\n[\s\S]*?(?=\n## |\n*$)/, '');
    // Replace DevBox reference in Quality System section
    content = content.replace('Pre-commit hooks (DevBox) enforce', 'Pre-commit hooks enforce');
    // Remove tara-auth references (package excluded from public repo)
    content = content.replace(/^- \*\*tara-auth\*\* —.*\n/gm, '');
    // Fix backend count (Five → Four, since tara-auth is excluded)
    content = content.replace('Five Lambda functions', 'Four Lambda functions');
    // Remove Infrastructure line from Quality System (no infra in public repo)
    content = content.replace(/^- \*\*Infrastructure\*\* —.*\n/gm, '');
    // Rewrite Quality System intro (no pre-commit hooks in public repo)
    content = content.replace(
      'Pre-commit hooks enforce quality on every commit. The commit is rejected if any check fails.',
      'Quality checks run in CI on every pull request. The PR is blocked if any check fails.'
    );
    fs.writeFileSync('ARCHITECTURE.md', content);
    console.log('  Removed infra/ section, DevBox ref, tara-auth refs, Infrastructure quality line, hooks claim');
  "
fi

# --- Clean up ADR 003 (replace DevBox with standard hooks) ---
echo ">>> Cleaning ADR docs..."
if [[ -f docs/adr/003-tdd-devbox.md ]]; then
  sed -i 's/DevBox pre-commit hooks/pre-commit hooks/g' docs/adr/003-tdd-devbox.md
  sed -i 's/DevBox Hooks/Pre-commit Hooks/g' docs/adr/003-tdd-devbox.md
  sed -i 's/DevBox is a custom tool — needs replacement with husky for OSS/Custom internal tool replaced with standard hooks/' docs/adr/003-tdd-devbox.md
  echo "  Cleaned DevBox references in ADR 003"
fi
if [[ -f docs/adr/README.md ]]; then
  sed -i 's/TDD with DevBox hooks/TDD with pre-commit hooks/' docs/adr/README.md
fi
# Rename ADR 003 file and update link
if [[ -f docs/adr/003-tdd-devbox.md ]]; then
  mv docs/adr/003-tdd-devbox.md docs/adr/003-tdd-hooks.md
  [[ -f docs/adr/README.md ]] && sed -i 's/003-tdd-devbox\.md/003-tdd-hooks.md/' docs/adr/README.md
  echo "  Renamed 003-tdd-devbox.md → 003-tdd-hooks.md"
fi

# --- Clean up package.json scripts (frontend: e2e refs, merlin-api: deploy scripts) ---
echo ">>> Cleaning package scripts..."
if command -v node &>/dev/null; then
  node -e "
    const fs = require('fs');
    // Frontend: remove test:a11y scripts (e2e/ excluded)
    if (fs.existsSync('packages/frontend/package.json')) {
      const fp = JSON.parse(fs.readFileSync('packages/frontend/package.json', 'utf8'));
      delete fp.scripts['test:a11y']; delete fp.scripts['test:a11y:report'];
      fs.writeFileSync('packages/frontend/package.json', JSON.stringify(fp, null, 2) + '\n');
    }
    // merlin-api: remove deploy scripts, add test:full
    if (fs.existsSync('packages/merlin-api/package.json')) {
      const mp = JSON.parse(fs.readFileSync('packages/merlin-api/package.json', 'utf8'));
      delete mp.scripts['deploy']; delete mp.scripts['deploy:dev']; delete mp.scripts['deploy:prod'];
      if (!mp.scripts['test:full']) mp.scripts['test:full'] = mp.scripts['test'] || 'jest';
      fs.writeFileSync('packages/merlin-api/package.json', JSON.stringify(mp, null, 2) + '\n');
    }
    console.log('  Cleaned frontend and merlin-api scripts');
  "
fi

# --- Clean up main.tsx (remove Build timestamp comment) ---
if [[ -f packages/frontend/src/main.tsx ]]; then
  sed -i '/^\/\/ Build [0-9]\{14\}$/d' packages/frontend/src/main.tsx
fi

# --- Remove SPTK prebuilt binaries (Docker rebuilds from source via compile_tools.sh) ---
echo ">>> Removing SPTK build artifacts..."
rm -rf packages/merlin-worker/tools/SPTK-3.9/build 2>/dev/null
rm -f packages/merlin-worker/tools/SPTK-3.9/lib/libSPTK.a 2>/dev/null
echo "  Removed SPTK-3.9/build/ and duplicate libSPTK.a"

# --- Clean up .gitignore (remove internal/unused patterns) ---
echo ">>> Cleaning .gitignore..."
if [[ -f .gitignore ]]; then
  sed -i -e '/packages\/frontend\/src\/services\/merlin\//d' \
    -e '/packages\/frontend\/src\/services\/vabamorf\//d' \
    -e '/packages\/frontend\/cucumber-results/d' \
    -e '/\.agent-channel/d' \
    -e '/^\.terraform/d' -e '/^\*\.tfstate/d' -e '/^\*\.tfplan/d' -e '/^tfplan-/d' \
    -e '/^\.vs$/d' -e '/^\*\.suo$/d' -e '/^\*\.sln$/d' -e '/^\*\.vcxproj/d' \
    -e '/^\.lhci$/d' -e '/^\.stryker-tmp$/d' \
    -e '/^$/N;/^\n$/d' .gitignore
  echo "  Cleaned .gitignore"
fi

# --- Summary ---
echo ""
echo ">>> Files remaining in public repo:"
find . -maxdepth 2 -not -path './.git/*' -not -path './.git' -not -path './node_modules/*' | sort | head -60
echo ""

TOTAL_FILES=$(find . -type f -not -path './.git/*' -not -path './node_modules/*' | wc -l)
echo "Total files: $TOTAL_FILES"

# --- Dry run: copy to output or just stop ---
if [[ "$DRY_RUN" == "true" ]]; then
  if [[ -n "$OUTPUT_DIR" ]]; then
    echo ""
    echo ">>> Copying filtered tree to $OUTPUT_DIR..."
    mkdir -p "$OUTPUT_DIR"
    rsync -a --exclude='.git' --exclude='node_modules' "$WORK_DIR/repo/" "$OUTPUT_DIR/"
    echo "Done! Inspect: $OUTPUT_DIR"
  else
    echo ""
    echo "Dry run complete. No changes pushed."
    echo "Use --output DIR to save the filtered tree for inspection."
  fi
  exit 0
fi

# --- Push to public repository ---
echo ">>> Pushing to public repository: $PUBLIC_REPO"

# Configure git identity for the temp clone
git config user.email "noreply@users.noreply.github.com"
git config user.name "HAK Open-Source Sync"

# Remove existing origin and add public repo
git remote remove origin
git remote add origin "$PUBLIC_REPO"

# Force push the cleaned branch
# (First time: creates the branch. Subsequent: updates it.)
git add -A
git commit -m "sync: update from internal repository

Automated sync from askend-lab/hak internal repository.
Excludes internal tooling, infrastructure, and backend packages." --allow-empty

git push --force origin "$BRANCH"

echo ""
echo "=== Sync complete! ==="
echo "Public repo updated: $PUBLIC_REPO (branch: $BRANCH)"
