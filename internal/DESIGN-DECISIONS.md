# Design Decisions — hak

Документ фиксирует принятые архитектурные и security решения, чтобы избежать повторных обсуждений.

---

## Authentication

### Токены в URL query params (#11, #56)
**Решение:** Accepted trade-off для SPA архитектуры.

TARA использует стандартный OAuth2 Authorization Code flow:
1. tara-auth обменивает code на токены server-to-server (не через браузер)
2. Cognito access/id tokens (short-lived, ~1 час) передаются фронтенду через URL params
3. Refresh token передаётся ТОЛЬКО через httpOnly cookie (никогда не доступен JS)
4. Фронтенд сразу делает `navigate("/", { replace: true })` — токены удаляются из URL и browser history
5. `Cache-Control: no-store` предотвращает кеширование
6. `Referrer-Policy: no-referrer` предотвращает утечку через Referer header
7. CSP защищает от XSS, который мог бы перехватить токены

**Альтернатива:** Все токены в httpOnly cookies — но тогда JS не может прочитать id_token для извлечения userId/email, что необходимо для SPA.

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

### Rate limiting (#13, #16)
**Решение:** Добавлен throttle 20 req/s для simplestore API Gateway. merlin-api уже имеет rate limiting.

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

*Последнее обновление: 2026-02-15 (Luna, по результатам обсуждения с Alex)*
