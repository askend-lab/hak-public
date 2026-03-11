# Task for Boxer: Add --cache flag to dead-code (knip) hook

## Problem

The `dead-code` hook in DevBox runs `knip --reporter json` without the `--cache` flag.
Knip supports built-in caching (`--cache`) that stores results in `node_modules/.cache/knip`.

**Measured impact on HAK project:**
- Without cache: **16.4s**
- With cache (cold): **2.6s**
- With cache (warm): **1.5s**

This is a **10x speedup** for the dead-code hook.

## What to change

### File: `quality/hooks/src/hooks/dead-code.js`

**Line 21** — add `--cache` to the knip command:

```js
// Before:
const result = await this.runCommand(`"${knipBin}" --reporter json`, context.cwd, { timeout: TIMEOUT });

// After:
const result = await this.runCommand(`"${knipBin}" --cache --reporter json`, context.cwd, { timeout: TIMEOUT });
```

### Cache location

Knip stores cache in `node_modules/.cache/knip` by default — no extra configuration needed.
The cache is automatically invalidated when files change.

## Optional improvement

Consider also adding a `command` config option to the dead-code hook (like `run-lint` and `run-typecheck` have), so projects can customize the knip command via `devbox.yaml`:

```yaml
hooks:
  dead-code:
    command: "knip --cache --reporter json"
```

This would require refactoring dead-code to extend `CommandRunnerHook` instead of `HookBase`, or adding a simple `config?.command` check in `execute()`.

## Tests

If the dead-code hook has tests, add a test case verifying that `--cache` is included in the command string.
