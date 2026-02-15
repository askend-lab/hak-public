# Design Decisions — hak

Документ фиксирует принятые архитектурные и security решения, чтобы избежать повторных обсуждений.

---

## Authentication

### Передача токенов после TARA callback (#11, #56, C1)
**Решение:** Токены передаются через Secure cookies (после fix C1).

TARA использует стандартный OAuth2 Authorization Code flow:
1. tara-auth обменивает code на токены server-to-server (не через браузер)
2. Cognito access/id tokens устанавливаются как Secure cookies в 302 redirect
3. Refresh token передаётся ТОЛЬКО через httpOnly cookie (никогда не доступен JS)
4. URL redirect содержит только `?auth=success` — токены НЕ в URL
5. Фронтенд читает access/id token из `document.cookie`, затем делает `navigate("/", { replace: true })`
6. `Cache-Control: no-store` предотвращает кеширование
7. `Referrer-Policy: no-referrer` предотвращает утечку через Referer header
8. CSP защищает от XSS
9. POST endpoints защищены CSRF-валидацией Origin header

**История:** Ранее токены передавались через URL query params (accepted trade-off). Fix C1 (2026-02) перенёс их в cookies для устранения утечки через browser history, CloudFront logs и Referer headers.

### JWT верификация на клиенте (#57)
**Решение:** Клиентский парсинг JWT — только для UI (извлечение userId, email). Серверная верификация через Cognito authorizer на каждом API запросе.

## Data Storage

### Публичные S3 audio URLs (#15)
**Решение:** By design. Audio контент — публичный. Signed URLs не требуются.

### TTL для shared/unlisted данных (#19)
**Решение:** Текущее поведение (бессрочное хранение) — by design. DynamoDB TTL включён для других целей.

### DynamoDB encryption (#60)
**Решение:** AWS-owned key достаточен. Нет compliance требований (HIPAA/PCI), CMK не нужен.

### handleGetPublic + unlisted (#59)
**Решение:** By design. Unlisted = доступен по прямой ссылке без аутентификации. Это intentional паттерн (аналогично unlisted YouTube видео).

## API & Infrastructure

### Rate limiting (#13, #16, M8)
**Решение:** API Gateway throttling на всех сервисах:
- simplestore: 10 req/s, burst 20
- merlin-api: 2 req/s, burst 4
- AWS WAF: 100 req/5 min per IP (AWS minimum)

### Lambda memory (#61)
**Решение:** SimpleStore уменьшен до 512MB (достаточно для CRUD операций). merlin-api остаётся 1024MB.

### Serverless Framework v3 (#26)
**Решение:** Используется до перехода на open source. Миграция на v4/SST/CDK запланирована позже.

### Дедупликация merlin-api ↔ shared (#27)
**Решение:** Оставляем текущую структуру. merlin-api не может импортировать shared из-за Lambda bundling. Это принятый trade-off.

### SQS URL / ECS service name hardcoded (#63, #64)
**Решение:** Оставляем hardcode. Динамические ссылки усложняют конфигурацию без значимой выгоды.

### vabamorf-api catch-all route (#65)
**Решение:** `ANY /{proxy+}` — принятое архитектурное упрощение.

### IAM wildcard на table+index (#67)
**Решение:** `!GetAtt DataTable.Arn` покрывает таблицу и будущие GSI. Оставляем — ограничение по отдельным индексам избыточно.

## Frontend & UX

### Cookie consent GDPR (#58)
**Решение:** Текущая реализация достаточна для MVP. При необходимости — юридический review.

### pnpm.overrides (#69)
**Решение:** Ручные overrides + Dependabot. Автоматизация не приоритетна.

### GitHub Actions SHA pins (#74, #75)
**Решение:** Текущий подход с SHA pins + version comments. `packageManager` конфликтует с CI.

---

### CORS fallback behavior (#M12)
**Решение:** `getCorsOrigin()` возвращает `"null"` (restrictive) если `ALLOWED_ORIGIN` env var отсутствует. Ранее fallback был `"*"`. Все Lambda обязаны иметь `ALLOWED_ORIGIN` в env.

### Log retention (#M10, #M11)
**Решение:** Минимум 90 дней для всех security-relevant логов (WAF, ECS). CloudTrail — 365 дней.

### merlin_audio S3 encryption/versioning (#D1, #D2)
**Решение:** Deferred. Контент публичный и regenerable. Encryption at rest бесплатен, но требует bucket recreation. Versioning не нужен для cache-keyed файлов.

---

*Последнее обновление: 2026-02-15 (Sam, security audit round 2 — CORS fallback, log retention, merlin_audio decisions)*
