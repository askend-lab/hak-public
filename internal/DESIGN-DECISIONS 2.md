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

### Auto-approve + auto-merge PRs (#SEC-04)
**Решение:** By design. Репозиторий приватный с одним разработчиком. Auto-approve + auto-merge ускоряет CI/CD workflow. Пересмотреть при росте команды или переходе на public repo.

### access_token / id_token cookies не HttpOnly (#SEC-03)
**Решение:** By design. Фронтенд читает access/id token из `document.cookie` для формирования `Authorization` header.

Mitigation layers:
1. Refresh token — HttpOnly (JS не может его прочитать)
2. Access/id tokens short-lived (1 час)
3. CSP блокирует inline scripts и external script sources
4. CSRF origin validation на всех POST endpoints
5. SameSite=Lax предотвращает отправку cookies при cross-site requests
6. HSTS preload предотвращает downgrade-атаки

BFF-паттерн (Backend-for-Frontend) рассмотрен и отклонён — добавляет latency и сложность без значимой выгоды при наличии вышеуказанных mitigations.

### refreshHandler возвращает токены в JSON body (#SEC-05)
**Решение:** By design. Consistent с `exchangeCodeHandler`. Токены уже доступны через non-HttpOnly cookies. Endpoint защищён CSRF origin validation. Дополнительной экспозиции нет.

### Публичные API без аутентификации — merlin-api, vabamorf-api (#C2)
**Решение:** By design. Эти API обслуживают основной learning experience и должны быть доступны без логина. Защита:
- API Gateway throttling (merlin: 2/s burst 4, vabamorf: 5/s)
- AWS WAF rate limiting (100 req/5 min per IP)
- Input validation на всех endpoints
- Cache-key дедупликация предотвращает повторную генерацию

### S3 audio без CloudFront (#SEC-01b)
**Решение:** Evaluated and rejected. Причина: synthesis polling flow требует мгновенной доступности файла после `put_object` в S3. CloudFront — CDN с edge caching, что вносит задержку при первом запросе (cache miss → origin fetch). Direct S3 URL доступен мгновенно.

Audio контент:
- Non-sensitive (публичный образовательный материал)
- Hash-keyed URLs (непредсказуемые)
- CORS ограничен на app domains (fix SEC-01a, 2026-02-16)
- S3 bucket policy — read-only для `*` (by design #15)

### ECR MUTABLE tag policy (#SEC-02)
**Решение:** ECR repository `merlin-worker` использует `MUTABLE` tags. CI pushит `:latest` при каждом билде, ECS task definition ссылается на `:latest`. `scan_on_push = true` обеспечивает сканирование каждого нового image.

IMMUTABLE tags рассмотрены и отклонены — потребовали бы динамического обновления ECS task definition с SHA тегом при каждом деплое, что усложняет CI/CD без значимой выгоды для single-developer проекта.

---

*Последнее обновление: 2026-02-16 (Sam, security audit round 3 — auto-approve, token cookies, CloudFront rejection, ECR mutability, public APIs)*
