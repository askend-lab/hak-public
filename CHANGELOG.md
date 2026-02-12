# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-02-11

### Changed

- Revised architecture documentation to match actual project state
- Moved ARCHITECTURE.md to project root for visibility

## [0.1.0] - 2024-01-01

### Added

- Initial release of HAK — Estonian Language Learning Platform
- React frontend with Vite, SCSS/BEM design system, Vitest
- simplestore REST API (Lambda + DynamoDB)
- audio-api for audio upload and playback (Lambda + S3)
- merlin-api TTS gateway (Lambda)
- merlin-worker speech synthesis engine (Docker/ECS + Python/Merlin)
- vabamorf-api Estonian morphological analysis (Lambda + native binary)
- tara-auth Estonian eID authentication (Lambda + Cognito)
- Shared types and utilities package
- BDD specifications with Gherkin
- Terraform infrastructure for AWS deployment
- DevBox quality system with pre-commit hooks
- CI/CD pipelines (GitHub Actions)
