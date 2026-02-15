# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-02-15

### Added

- Interactive lesson creation with text-to-speech audio
- Estonian speech synthesis via Merlin TTS engine
- Morphological analysis with stress and pronunciation variants (Vabamorf)
- Audio pipeline: synthesis queue, S3 caching, playback
- Teacher and student roles with onboarding flow
- Responsive design for desktop and mobile
- WCAG-compliant accessibility (axe-core validated)
- BDD specifications in Gherkin
- Playwright E2E tests
- CI/CD with GitHub Actions (lint, typecheck, test)
- Content Security Policy (report-only mode)
- API throttling on all endpoints

### Security

- Lambda concurrency limits on all API functions
- API Gateway throttling configured per endpoint
- Content Security Policy headers (report-only)
- CORS headers with configurable allowed origins
- No secrets or credentials in client-side code

[Unreleased]: https://github.com/askend-lab/hak-public/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/askend-lab/hak-public/releases/tag/v0.1.0
