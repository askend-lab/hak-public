# Architecture

## System Overview

```mermaid
graph TB
    subgraph Client
        FE[React SPA<br/>Vite + TailwindCSS]
    end

    subgraph AWS Cloud
        CF[CloudFront CDN]
        S3_WEB[S3 Static Assets]
        APIGW[API Gateway]

        subgraph Lambda Functions
            SS[simplestore<br/>REST API]
            AA[audio-api<br/>Audio Processing]
            MA[merlin-api<br/>TTS Gateway]
            VA[vabamorf-api<br/>Morphology]
        end

        DDB[(DynamoDB)]
        S3_A[S3 Audio Bucket]
        SQS[SQS Queue]
        MW[merlin-worker<br/>Docker / ECS]
    end

    FE --> CF --> S3_WEB
    FE --> APIGW
    APIGW --> SS
    APIGW --> AA
    APIGW --> MA
    APIGW --> VA
    SS --> DDB
    AA --> S3_A
    MA --> SQS --> MW
    MW --> S3_A
```

## Monorepo Structure

```mermaid
graph LR
    subgraph packages
        FE[frontend]
        SS[simplestore]
        AA[audio-api]
        MA[merlin-api]
        MW[merlin-worker]
        VA[vabamorf-api]
        SH[shared]
        SP[specifications]
        GP[gherkin-parser]
    end

    FE --> SH
    SS --> SH
    AA --> SH
    SP --> GP
```

## Package Details

| Package | Tech | Runtime | Purpose |
|---------|------|---------|---------|
| `frontend` | React, Vite, TailwindCSS, Vitest | S3 + CloudFront | Teacher/student UI |
| `simplestore` | Express, DynamoDB SDK | Lambda | Lessons, users, progress CRUD |
| `audio-api` | Express, S3 SDK | Lambda | Audio upload, playback, storage |
| `merlin-api` | Express, SQS SDK | Lambda | TTS request gateway |
| `merlin-worker` | Python, Conda, Merlin | Docker (ECS) | Estonian speech synthesis |
| `vabamorf-api` | Express, native binary | Lambda (Docker) | Estonian morphological analysis |
| `shared` | TypeScript | — | Shared types, utilities, constants |
| `specifications` | Gherkin | — | BDD feature specifications |
| `gherkin-parser` | TypeScript | — | Gherkin-to-test mapping |

## Data Flow — Lesson Playback

```mermaid
sequenceDiagram
    participant S as Student Browser
    participant CF as CloudFront
    participant API as API Gateway
    participant SS as simplestore
    participant DB as DynamoDB
    participant AA as audio-api
    participant S3 as S3 Audio

    S->>CF: Load app
    CF->>S: React SPA
    S->>API: GET /lessons/:id
    API->>SS: Route
    SS->>DB: Query lesson
    DB-->>SS: Lesson data
    SS-->>S: Lesson JSON
    S->>API: GET /audio/:key
    API->>AA: Route
    AA->>S3: GetObject
    S3-->>AA: Audio file
    AA-->>S: Audio stream
```

## Data Flow — TTS Synthesis

```mermaid
sequenceDiagram
    participant T as Teacher Browser
    participant API as API Gateway
    participant MA as merlin-api
    participant SQS as SQS Queue
    participant MW as merlin-worker
    participant S3 as S3 Audio

    T->>API: POST /synthesize {text, voice}
    API->>MA: Route
    MA->>SQS: SendMessage
    MA-->>T: 202 Accepted {jobId}
    SQS->>MW: ReceiveMessage
    MW->>MW: Merlin synthesis
    MW->>S3: PutObject (wav)
    T->>API: GET /audio/status/:jobId
    API->>MA: Route
    MA-->>T: {status: ready, url}
```

## Infrastructure (Terraform)

```
infra/
  main.tf              # Provider, backend config
  variables.tf         # Input variables
  terraform.tfvars     # Environment values (not in git)
  api-gateway.tf       # API Gateway routes
  dynamodb.tf          # DynamoDB tables
  website.tf           # S3 + CloudFront for frontend
  audio.tf             # S3 audio bucket + Lambda
  ecr.tf               # ECR for Docker images
  cloudfront.tf        # CDN distribution
  route53.tf           # DNS records
  cloudwatch-*.tf      # Monitoring, alarms, dashboard
  slack-notifications.tf  # Alert notifications
```

## Quality System

Pre-commit hooks enforce quality on every commit:

```
commit → DevBox hooks (pre-commit stage)
  ├── TypeScript strict (run-typecheck)
  ├── ESLint zero warnings (run-lint)
  ├── All tests pass (run-tests)
  ├── TDD enforcement (test-required)
  ├── No any types (no-any)
  ├── No floating promises (no-floating-promises)
  ├── Import order (import-order)
  ├── No console.log (no-console)
  ├── Copy-paste detection (jscpd)
  ├── File size limits (source-size, markdown-size)
  ├── Language check (language-check)
  ├── Broken links (broken-links)
  ├── Dependency audit (security-audit)
  ├── Secret detection (secret-detection)
  ├── License check (license-check)
  └── Unused deps (dependency-check)
```
