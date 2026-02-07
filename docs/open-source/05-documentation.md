# Phase 4: Documentation

> MEDIUM — essential for community adoption and contributor onboarding.
> Every item: 🔧 = DevBox hook exists, ✅ = all green.

## Automated Verification (DevBox hooks)

| 🔧 | ✅ | Requirement | Hook | Tool |
|---|---|-------------|------|------|
| [x] | [x] | Markdown ≤200 lines | `markdown-size` | wc -l |
| [x] | [x] | No broken links in docs | `broken-links` | markdown-link-check |
| [x] | [ ] | English-only code | `language-check` | grep patterns |
| [x] | [x] | Docs have metrics | `metrics-required` | devbox |

## Manual Gates

### README & Architecture
- [ ] Rewrite `README.md` for OSS audience (screenshots, quick start, badges)
- [ ] Add "Built with AI" section
- [ ] Create `docs/ARCHITECTURE.md` with Mermaid diagrams
- [ ] Create ADRs in `docs/adr/`

### Guides
- [ ] Create `docs/DEPLOYMENT.md` (AWS setup from scratch)
- [ ] Create `docs/API.md` (all Lambda endpoints, consider OpenAPI)
- [ ] Create `docs/GETTING_STARTED.md` (contributor onboarding)

### Cleanup
- [ ] Translate Russian-language documents → English
- [ ] JSDoc on all exported functions
