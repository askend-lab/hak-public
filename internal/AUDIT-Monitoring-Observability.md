# Аудит: Мониторинг, Логирование и Observability

**Дата:** 2026-02-27
**Автор:** Kate
**Статус:** Аудит текущего состояния

---

## Резюме

Система HAK имеет **базовый, но функциональный** уровень мониторинга. Основные компоненты (CloudWatch alarms → SNS → Slack, Sentry для фронтенда, X-Ray tracing для Lambda) развёрнуты. Однако есть значительные пробелы: нет централизованного log aggregation, нет uptime мониторинга, нет алертинга на CI/CD failures, Sentry настроен минимально (replays отключены), и нет runbooks для реагирования на инциденты.

---

## 1. Что есть сейчас

### 1.1 Infrastructure Monitoring (CloudWatch)

**CloudWatch Alarms** (`infra/cloudwatch-alarms.tf`):
| Alarm | Что мониторит | Порог | Период |
|-------|--------------|-------|--------|
| `api-5xx-errors` | API Gateway 5XX | > 0 | 60s |
| `api-4xx-errors` | API Gateway 4XX | > 10 | 5min |
| `lambda-errors` | Lambda errors (simplestore) | > 3 за 2 периода | 5min |
| `dynamodb-throttling` | DynamoDB throttled requests | > 1 | 5min |
| `api-high-latency` | API Gateway p99 latency | > 5s за 3 периода | 5min |
| `merlin-sqs-depth` | SQS queue depth (synthesis) | > 50 | 60s |
| `merlin-ecs-high-tasks` | ECS worker count at max | ≥ 2 | 5min |
| `waf-blocked-high` | WAF blocked requests | > 100 | 5min |

**CloudWatch Dashboard** (`infra/cloudwatch-dashboard.tf`):
- API Gateway: requests, latency (avg + p99), errors (4xx + 5xx)
- ECS/Fargate: running task count
- Lambda: invocations, duration, errors
- DynamoDB: read/write capacity, throttled requests
- CloudFront: requests, bytes downloaded, error rate

**Alerting Pipeline** (`infra/slack-notifications.tf`):
- SNS topic `hak-alerts-{env}` → Lambda → Slack webhook
- Парсит CloudWatch alarm JSON, отправляет цветные уведомления (🚨 ALARM / ✅ OK)
- Зависит от `var.slack_webhook_url` (по умолчанию пустая строка!)

### 1.2 Security Monitoring

**GuardDuty** (`infra/guardduty.tf`):
- Включен только в dev (count = var.env == "dev")
- S3 data source включен
- Findings → EventBridge → SNS → Slack

**WAF** (`infra/waf.tf`):
- 4 правила: rate limiting (IP), rate limiting (synthesize), geo-blocking, AWS managed rules
- CloudWatch metrics для каждого правила
- WAF logs → CloudWatch Log Group (90 дней, только BLOCK и COUNT)

**Budget Alerts** (`infra/budgets.tf`):
- 70%, 90%, 100% actual + 100% forecasted → SNS → Slack

### 1.3 Application Logging

**Shared Logger** (`packages/shared/src/logger.ts`):
- 4 уровня: debug, info, warn, error
- В Lambda: JSON формат (structured logging) — автодетект через `AWS_LAMBDA_FUNCTION_NAME`
- Вне Lambda: plain text `[timestamp] [LEVEL] message`
- `withContext()` — добавление requestId, handler name и т.д.
- `LOG_LEVEL` env var — настраиваемый уровень
- Log retention: 30 дней (Serverless Lambda), 90 дней (WAF, ECS)

**Handler Error Handling:**
| Пакет | Паттерн | Logging |
|-------|---------|---------|
| `store` | try/catch в `executeRoute()` | `logger.error("[SimpleStore] Handler error", { requestId, error })` |
| `auth` | try/catch в каждом handler | `logger.withContext({ handler, requestId })` |
| `tts-api` | try/catch + `QueueFullError` отдельно | `logger.withContext({ handler, requestId })` |
| `morphology-api` | Общий `handleError()` | `logger.error(prefix, extractErrorMessage(error))` |
| `shared` | `wrapLambdaHandler()` | Разделяет AppError (warn) и unhandled (error) |

**X-Ray Tracing:**
- Включен для Lambda и API Gateway: `store`, `auth`, `tts-api` (через `serverless.yml`)
- IAM permissions: `xray:PutTraceSegments`, `xray:PutTelemetryRecords`
- **Не** включен для: морфологический API (только Lambda tracing, нет apiGateway)

### 1.4 Frontend Error Tracking

**Sentry** (`packages/frontend/src/main.tsx`):
- DSN через `VITE_SENTRY_DSN` env var
- Включен только в production и при наличии tracking consent
- `replaysSessionSampleRate: 0` — сессии НЕ записываются
- `replaysOnErrorSampleRate: 0` — ошибки НЕ воспроизводятся
- `tracesSampleRate` — не настроен (по умолчанию 0)
- **Фактически**: Sentry ловит только `captureException` из ErrorBoundary

**ErrorBoundary** (`packages/frontend/src/components/ErrorBoundary.tsx`):
- Оборачивает всё приложение в `main.tsx`
- `componentDidCatch` → `logger.error()` + `Sentry.captureException()`
- UI: "Midagi läks valesti" + retry button + link to home

**Frontend API Error Handling:**
- `SimpleStoreAdapter` использует `logger.error()` для невалидных данных
- Fetch errors → try/catch в hooks → user-facing error states
- **Нет глобального перехвата** `window.onerror` или `unhandledrejection`

### 1.5 CI/CD Monitoring

**GitHub Actions:**
- Build, Test, E2E, CodeQL, Terraform — все имеют `timeout-minutes`
- Smoke tests после деплоя (`continue-on-error: true` — не блокирует)
- Deployment summary записывается в `$GITHUB_STEP_SUMMARY`
- **Нет Slack нотификаций** при failures в CI/CD
- **Нет Slack нотификаций** при успешных деплоях

### 1.6 Health Checks

- `/health` endpoints: store, morphology-api, tts-api — все возвращают `{ status: "ok" }`
- **Нет** автоматического uptime мониторинга (нет cron, нет external pinger)
- **Нет** synthetic monitoring

---

## 2. Пробелы и Риски

### 🔴 Критические (можем пропустить даунтайм)

| # | Проблема | Риск | Рекомендация |
|---|---------|------|--------------|
| G1 | **Нет uptime monitoring** | Сайт может быть down, а мы не знаем | Добавить Route53 health check или CloudWatch Synthetics canary на главные endpoints |
| G2 | **Slack webhook URL может быть пустым** | `var.slack_webhook_url` default = "" — все алерты уходят в никуда | Добавить validation и alarm на отсутствие webhook |
| G3 | **Нет алертов на CI/CD failures** | Деплой сломался — никто не знает | Добавить Slack notification step в build.yml / deploy.yml (на failure) |
| G4 | **Smoke tests не блокируют деплой** | `continue-on-error: true` — деплоим сломанное и не знаем | Сделать smoke tests блокирующими или добавить алерт при неудаче |
| G5 | **GuardDuty только в dev** | Prod не мониторится на security threats | Включить GuardDuty в prod |

### 🟡 Значительные (снижают visibility)

| # | Проблема | Риск | Рекомендация |
|---|---------|------|--------------|
| G6 | **Sentry минимальный** | replays=0, traces=0 — ловим только ErrorBoundary exceptions | Включить `replaysOnErrorSampleRate: 1.0`, `tracesSampleRate: 0.1` |
| G7 | **Нет window.onerror / unhandledrejection** | JS ошибки вне React tree не ловятся | Sentry автоматически ловит если правильно настроен — проверить |
| G8 | **Нет CloudWatch alarms на tts-api, auth, morphology-api Lambda** | Errors в этих Lambda — без алертов | Добавить Lambda error alarms для всех функций |
| G9 | **Нет Dead Letter Queue monitoring** | SQS DLQ может копить failed messages | Добавить CloudWatch alarm на DLQ depth > 0 |
| G10 | **Нет алертов на деплой** | Не знаем когда что задеплоили | Добавить Slack notification при успешном деплое в deploy.yml |
| G11 | **Нет log aggregation/search** | Логи в CloudWatch — неудобно искать по нескольким Lambda | Рассмотреть CloudWatch Logs Insights queries или CloudWatch Contributor Insights |

### 🟢 Улучшения (nice to have)

| # | Проблема | Рекомендация |
|---|---------|--------------|
| G12 | Нет correlation ID через весь pipeline | Передавать X-Request-Id от CloudFront до Lambda |
| G13 | Нет custom CloudWatch metrics | Добавить бизнес-метрики: synthesize requests/min, avg sentence count |
| G14 | Нет runbooks / incident response playbook | Создать для каждого alarm: что делать когда сработал |
| G15 | Нет dashboard для Sentry в production | Настроить Sentry project dashboard, alert rules |
| G16 | morphology-api не имеет API Gateway tracing | Добавить `apiGateway: true` в serverless.yml |

---

## 3. Сценарии: "Как мы узнаем?"

| Сценарий | Как узнаем сейчас | Пробел |
|----------|------------------|--------|
| **Сайт недоступен** | Никак (нет uptime check) | 🔴 G1 |
| **API возвращает 5XX** | CloudWatch alarm → Slack (если webhook настроен) | 🟡 G2 |
| **Lambda падает** | Alarm на simplestore только; tts/auth/morphology — нет | 🟡 G8 |
| **DynamoDB throttling** | CloudWatch alarm → Slack | ✅ Работает |
| **Высокая латентность** | CloudWatch alarm (p99 > 5s) → Slack | ✅ Работает |
| **Frontend JS crash** | Sentry (только ErrorBoundary) | 🟡 G6 |
| **Деплой сломался** | GitHub Actions UI (нужно зайти и посмотреть) | 🔴 G3 |
| **Превышен бюджет** | Budget alerts → SNS → Slack | ✅ Работает |
| **DDoS / rate limiting** | WAF alarm (> 100 blocked) → Slack | ✅ Работает |
| **Security threat** | GuardDuty → Slack (только dev!) | 🔴 G5 |
| **SQS queue stuck** | CloudWatch alarm (queue depth > 50) | ✅ Работает |
| **Workers перегружены** | CloudWatch alarm (ECS tasks ≥ 2) | ✅ Работает |
| **User reports bug** | Нет формы обратной связи | 🟢 Рассмотреть |

---

## 4. Приоритеты по исправлению

### Фаза 1: Критические пробелы (1-2 дня)
1. **G1** — Uptime monitoring: Route53 health check на `https://{domain}/` + alarm → Slack
2. **G2** — Validation: проверить что `slack_webhook_url` задан в обоих envs
3. **G3** — CI/CD Slack alerts: добавить step в build.yml и deploy.yml
4. **G5** — Включить GuardDuty в prod

### Фаза 2: Расширение coverage (3-5 дней)
5. **G6** — Sentry: включить replays on error, traces sampling
6. **G8** — Lambda alarms для tts-api, auth, morphology-api
7. **G4** — Сделать smoke tests блокирующими или алертующими
8. **G10** — Deploy notifications в Slack
9. **G9** — DLQ alarm

### Фаза 3: Зрелость (по мере необходимости)
10. **G12** — Correlation IDs
11. **G11** — Log Insights saved queries
12. **G13** — Custom business metrics
13. **G14** — Runbooks
14. **G16** — Полный X-Ray tracing

---

## 5. Текущий поток данных

```
┌─────────────┐     ┌──────────────┐     ┌─────────┐     ┌───────┐
│ CloudWatch  │────▶│  SNS Topic   │────▶│ Lambda  │────▶│ Slack │
│   Alarms    │     │ hak-alerts-* │     │notifier │     │channel│
└─────────────┘     └──────────────┘     └─────────┘     └───────┘
                           ▲
                           │
                    ┌──────┴──────┐
                    │ EventBridge │
                    │ (GuardDuty) │
                    └─────────────┘
                           ▲
                           │
                    ┌──────┴──────┐
                    │   Budget    │
                    │   Alerts    │
                    └─────────────┘

┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Sentry     │ (minimal: ErrorBoundary only)
│  React App  │     │   (cloud)    │
└─────────────┘     └──────────────┘

┌─────────────┐     ┌──────────────┐
│  Lambda     │────▶│  CloudWatch  │ (structured JSON logs, 30 days)
│  Handlers   │     │    Logs      │
└─────────────┘     └──────────────┘

┌─────────────┐     ┌──────────────┐
│  Lambda     │────▶│   X-Ray      │ (store, auth, tts-api)
│  + API GW   │     │   Traces     │
└─────────────┘     └──────────────┘

┌─────────────┐     ┌──────────────┐
│  GitHub     │────▶│  GitHub UI   │ (no Slack notifications)
│  Actions    │     │  only        │
└─────────────┘     └──────────────┘
```

---

## 6. Верификация по Terraform (источник истины)

### 6.1 Slack Webhook (алертинг)

**Статус: ⚠️ ПОТЕНЦИАЛЬНАЯ ПРОБЛЕМА**

- `var.slack_webhook_url` default = `""` в `variables.tf`
- НЕ задан в `dev.tfvars` и `prod.tfvars`
- Передаётся через `TF_VAR_slack_webhook_url` из GitHub secret `SLACK_WEBHOOK_URL` при `terraform apply`
- Lambda notifier (`slack-notifications.tf`) при пустом URL: `print("SLACK_WEBHOOK_URL not set")` → возвращает 500
- **Проблема:** если secret не задан в GitHub, ВСЕ алерты уходят в никуда молча
- **Принцип fail-fast:** система должна ПАДАТЬ если webhook не сконфигурирован

### 6.2 DLQ (Dead Letter Queue)

**Статус: ✅ СУЩЕСТВУЕТ, но без мониторинга**

- `aws_sqs_queue.merlin_dlq` в `merlin/main.tf`
- `maxReceiveCount = 3` — после 3 неудачных обработок сообщение уходит в DLQ
- Retention: 14 дней
- **Нет CloudWatch alarm** на DLQ depth → сообщения копятся незаметно

### 6.3 Sentry DSN

**Статус: ⚠️ ЗАВИСИТ ОТ GITHUB SECRET**

- `VITE_SENTRY_DSN` передаётся из `secrets.VITE_SENTRY_DSN` в `build.yml` при сборке frontend
- Если secret пустой → `dsn: ""` → Sentry отключен
- `enabled: import.meta.env.PROD && hasTrackingConsent()` — в dev отключен, в prod зависит от cookie consent
- **Принцип fail-fast:** если DSN пустой, в production build это должно быть ошибкой

### 6.4 Lambda Alarm Coverage

**Статус: 🔴 ПОКРЫТИЕ ТОЛЬКО 1 ИЗ 4 СЕРВИСОВ**

| Сервис | Serverless service name | Lambda function names | Alarm? |
|--------|------------------------|----------------------|--------|
| `store` | `simplestore` | `simplestore-{env}-api` | ✅ Есть (errors > 3) |
| `tts-api` | `merlin-api` | `merlin-api-{env}-synthesize`, `merlin-api-{env}-status`, `merlin-api-{env}-health` | ❌ НЕТ |
| `auth` | `tara-auth` | `tara-auth-{env}-taraStart`, `tara-auth-{env}-taraCallback`, `tara-auth-{env}-tokenRefresh`, `tara-auth-{env}-tokenExchange`, `tara-auth-{env}-health` | ❌ НЕТ |
| `morphology-api` | `vabamorf-api` | `vabamorf-api-{env}-api` | ❌ НЕТ |

API Gateway alarms (`api_5xx_errors`, `api_4xx_errors`, `api_high_latency`) привязаны ТОЛЬКО к `${var.env}-simplestore`. Другие API Gateways не мониторятся.

### 6.5 Dashboard Coverage

**Статус: ⚠️ ЕСТЬ, НО НЕПОЛНЫЙ**

Dashboard `hak-activity-{env}` показывает:
- ✅ API Gateway (requests, latency, errors) — но только для `hak-api-{env}`
- ✅ ECS running tasks
- ✅ Lambda (invocations, duration, errors) — но только `simplestore-{env}-api`
- ✅ DynamoDB (capacity, throttling)
- ✅ CloudFront (requests, bytes, error rate)
- ❌ НЕТ: synthesis queue depth
- ❌ НЕТ: DLQ depth
- ❌ НЕТ: tts-api / auth / morphology-api Lambda метрики
- ❌ НЕТ: WAF blocked requests
- ❌ НЕТ: активные IP / пользователи

---

## 7. План действий (чеклист, ревизия 2)

**Принципы (от Alex):**
1. Fail-fast: если не сконфигурировано → система не запускается
2. Нет graceful degradation
3. Всё через Terraform
4. Мониторим всё

### Фаза 0: Верификация текущей инфраструктуры

- [ ] Добавить Terraform validation: `slack_webhook_url` обязателен (не может быть пустым), система не деплоится без него
- [ ] Добавить проверку в Slack notifier Lambda: если webhook возвращает ошибку → alarm (сейчас ошибка глотается)
- [ ] Добавить validation в frontend build: `VITE_SENTRY_DSN` обязателен для production build (fail build если пустой)

### Фаза 1: Все 500-ки → алерт

**1.1 Lambda error alarms (Terraform: cloudwatch-alarms.tf)**
- [ ] Alarm `merlin-api-{env}-lambda-errors`: Lambda errors для `merlin-api-{env}-synthesize` + `merlin-api-{env}-status`
- [ ] Alarm `tara-auth-{env}-lambda-errors`: Lambda errors для всех `tara-auth-{env}-*` функций
- [ ] Alarm `vabamorf-api-{env}-lambda-errors`: Lambda errors для `vabamorf-api-{env}-api`
- [ ] Убедиться что существующий alarm `simplestore-{env}-api` корректен (FunctionName match)

**1.2 API Gateway alarms для КАЖДОГО API**
- [ ] Alarm на 5XX для `merlin-api` HTTP API (tts-api)
- [ ] Alarm на 5XX для `tara-auth` REST API (auth)
- [ ] Alarm на 5XX для `vabamorf-api` REST API (morphology)
- [ ] Оставить существующие 5XX/4XX/latency для `simplestore`

**1.3 Synthesis flow end-to-end**
- [ ] Alarm на DLQ depth > 0 (CRITICAL: клиент не получит звук)
- [ ] Alarm на SQS main queue age > 5 min (сообщение залипло, worker не берёт)
- [ ] Alarm на ECS service running count = 0 в prod (worker вообще не запущен)

### Фаза 2: Frontend error tracking

**2.1 Sentry configuration**
- [ ] Включить `replaysOnErrorSampleRate: 1.0`
- [ ] Включить `tracesSampleRate: 0.1`
- [ ] Убрать try/catch вокруг Sentry.init — если DSN невалидный, пусть падает в console

**2.2 Все API ошибки → Sentry**
- [ ] Создать utility `reportApiError(response, context)` → Sentry.captureException
- [ ] Применить в `synthesize.ts`: synthesis request failed, synthesis timed out
- [ ] Применить в `orchestratorHelpers.ts`: "Failed to synthesize" → + Sentry
- [ ] Применить в `audioPlayer.ts`: "Audio playback failed" → + Sentry
- [ ] Применить в `SimpleStoreAdapter.ts`: все fetch errors → + Sentry
- [ ] Применить в `analyzeApi.ts`: analyze/variants errors → + Sentry
- [ ] Неожиданные 4xx от API → трактовать как internal error → Sentry

### Фаза 3: Dashboard (единое окно)

**3.1 Переработать CloudWatch Dashboard `hak-activity-{env}`:**

**Row 1: Общая активность**
- [ ] API Gateway суммарные requests по ВСЕМ API (или CloudFront requests как proxy)
- [ ] Уникальные IP (CloudFront Viewer Requests metric, или WAF sampled requests)
- [ ] CloudFront error rate (4xx + 5xx)

**Row 2: Synthesis (генерация звука) — отдельно**
- [ ] `merlin-api` Lambda invocations (сколько генераций)
- [ ] SQS queue depth (текущая длина очереди)
- [ ] DLQ depth (потерянные генерации)
- [ ] ECS running tasks + desired count

**Row 3: Morphology (анализ текста) — отдельно**
- [ ] `vabamorf-api` Lambda invocations
- [ ] `vabamorf-api` Lambda errors
- [ ] `vabamorf-api` Lambda duration

**Row 4: Всё остальное (store + auth + infra)**
- [ ] `simplestore` Lambda invocations + errors + duration
- [ ] `tara-auth` Lambda invocations + errors
- [ ] DynamoDB consumed capacity + throttling
- [ ] WAF blocked requests

### Фаза 4: Uptime и CI/CD

**4.1 Uptime**
- [ ] Route53 health check на `https://{domain}/` → alarm → Slack
- [ ] Route53 health check на synthesis API health endpoint

**4.2 CI/CD**
- [ ] Slack notification в `build.yml` при failure
- [ ] Slack notification в `deploy.yml` при failure и при успешном деплое
- [ ] Smoke tests: добавить Slack notification при failure (keep `continue-on-error` но алертить)

**4.3 Security**
- [ ] GuardDuty в prod (убрать `count = var.env == "dev"`)

### Фаза 5: Зрелость

- [ ] X-Ray tracing для morphology-api API Gateway
- [ ] Correlation ID (X-Request-Id) от CloudFront до Lambda
- [ ] CloudWatch Logs Insights saved queries
- [ ] Runbooks для каждого alarm

### Решение по 400 vs 500

**Решение:** бэкенд оставляем как есть (400 = корректный API ответ для невалидных запросов). На фронтенде: любой неожиданный 4xx от API трактуется как internal error и отправляется в Sentry (наш баг — фронтенд не должен отправлять невалидные запросы).

- [ ] Создать frontend utility `reportApiError(response, context)` → Sentry
- [ ] Применить во всех API-вызовах фронтенда
