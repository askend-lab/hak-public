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

## 6. План действий (чеклист)

### Фаза 1: Критические user-facing сбои (приоритет №1)

**1.1 Все 500-ки → алерт в Slack**
- [ ] Добавить CloudWatch alarm на Lambda errors для `tts-api` (synthesize + status)
- [ ] Добавить CloudWatch alarm на Lambda errors для `auth` (все handlers)
- [ ] Добавить CloudWatch alarm на Lambda errors для `morphology-api` (analyze + variants)
- [ ] Проверить что существующий alarm для `simplestore` корректно работает
- [ ] Проверить что `slack_webhook_url` задан в dev и prod tfvars/secrets

**1.2 Synthesis flow — мониторинг от начала до конца**
- [ ] Alarm на SQS Dead Letter Queue depth > 0 (worker не смог обработать → звук потерян)
- [ ] Alarm на synthesis Lambda 503 (QueueFullError) — клиент не может генерировать
- [ ] Alarm на ECS task failures / stopped tasks (worker crash)
- [ ] Frontend: отправлять synthesis timeout в Sentry (30 попыток polling без результата)
- [ ] Frontend: отправлять Audio.onerror в Sentry (S3 audio не загрузился)

**1.3 Frontend → Sentry полноценно**
- [ ] Включить `replaysOnErrorSampleRate: 1.0` (запись сессии при каждой ошибке)
- [ ] Включить `tracesSampleRate: 0.1` (10% запросов трейсятся)
- [ ] Добавить глобальный перехват неожиданных 4xx от API как Sentry events (фронт не должен получать 400 — если получил, это наш баг)
- [ ] Добавить `Sentry.captureMessage()` для synthesis timeout, audio playback failure
- [ ] Настроить Sentry alert rules: email/Slack на новые ошибки

**1.4 Frontend error classification**
- [ ] В `synthesize.ts`: обернуть `throw new Error("Synthesis request failed")` в Sentry.captureException
- [ ] В `synthesize.ts`: обернуть `throw new Error("Synthesis timed out")` в Sentry.captureException
- [ ] В `orchestratorHelpers.ts`: все `logger.error("Failed to synthesize:", error)` → + Sentry.captureException
- [ ] В `audioPlayer.ts`: `reject(new Error("Audio playback failed"))` → + Sentry.captureException

### Фаза 2: Uptime и CI/CD visibility

**2.1 Uptime monitoring**
- [ ] Добавить Route53 health check на `https://{domain}/` (или CloudWatch Synthetics canary)
- [ ] Health check alarm → SNS → Slack (сайт down)
- [ ] Добавить health check на `/api/synthesize` health endpoint
- [ ] Добавить health check на `/api/analyze` health endpoint

**2.2 CI/CD алертинг**
- [ ] Добавить Slack notification step в `build.yml` при failure
- [ ] Добавить Slack notification step в `deploy.yml` при failure
- [ ] Добавить Slack notification step в `deploy.yml` при успешном деплое
- [ ] Сделать smoke tests (`continue-on-error: true` → алерт при неудаче, не блокирует, но уведомляет)

**2.3 Security**
- [ ] Включить GuardDuty в prod (убрать `count = var.env == "dev"`)
- [ ] Добавить CloudWatch alarm на Cognito failed auth attempts (brute force protection)

### Фаза 3: Observability зрелость

**3.1 Distributed tracing**
- [ ] Добавить X-Ray tracing для morphology-api API Gateway
- [ ] Пробросить X-Request-Id (correlation ID) от CloudFront до Lambda через headers
- [ ] Добавить requestId в Sentry breadcrumbs для frontend→backend корреляции

**3.2 Log Insights и метрики**
- [ ] Создать CloudWatch Logs Insights saved queries: top errors, slow requests, synthesis failures
- [ ] Добавить custom CloudWatch metric: synthesis requests/min
- [ ] Добавить custom CloudWatch metric: synthesis success rate
- [ ] Добавить custom CloudWatch metric: average synthesis duration (queue → ready)

**3.3 Operational readiness**
- [ ] Создать runbook для каждого CloudWatch alarm (что делать при срабатывании)
- [ ] Создать Sentry project dashboard с ключевыми графиками
- [ ] Добавить `/dashboard` или build-info.json endpoint для быстрой проверки версии в production

### Решение по 400 vs 500

**Решение:** бэкенд оставляем как есть (400 для невалидных запросов — корректно для универсального API). На фронтенде: любой неожиданный 4xx (который фронтенд не должен вызывать) трактуется как internal error и отправляется в Sentry.

- [ ] Создать frontend utility `reportUnexpectedApiError(response, context)` — отправляет в Sentry если response.status >= 400 и это не ожидаемый клиентский error
- [ ] Применить в `SimpleStoreAdapter` — save/get/delete/query
- [ ] Применить в `synthesize.ts` — POST /api/synthesize
- [ ] Применить в `analyzeApi.ts` — POST /api/analyze, POST /api/variants
