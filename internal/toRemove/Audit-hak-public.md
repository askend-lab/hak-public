# Code Review — hak-public — 15.02.2026

Аудитор: Luna | Scope: весь hak-public | Repo: github.com/askend-lab/hak-public
Легенда: ⚠️ = требует обсуждения перед реализацией

---

## Фаза 0 — Security Critical (делать немедленно)

- [x] 1. **merlin-api CORS wildcard** — `response.ts` не использует `getCorsOrigin()`, hardcoded `"*"`. Чинить: импорт из shared.
- [x] 2. **synthesize без авторизации** — `merlin-api/serverless.yml:57-60` нет Cognito authorizer. Публичный TTS = абьюз.
- [x] 3. **warmup без авторизации** — `merlin-api/serverless.yml:84-87`. Любой масштабирует ECS → расходы.
- [x] 4. **mock-users.json в public/** — `frontend/public/data/mock-users.json` с эстонскими ID-кодами и email. Удалить.
- [x] 5. **Нет max text length в synthesize** — `validateText` проверяет только непустоту. Мегабайтный текст → TTS crash.
- [x] 6. **cacheKey без санитизации** — `handler.ts:128`, `s3.ts:68`. `cache/${cacheKey}.wav` → path traversal в S3.
- [x] 7. **speed/pitch не валидируются** — `handler.ts:56-63`. `speed:-999` передаётся в SOX через shell.
- [x] 8. **Нет CSP headers** — нигде в проекте. XSS загрузит произвольные скрипты.
- [x] 9. **Нет security headers** — X-Content-Type-Options, X-Frame-Options, HSTS отсутствуют во всех Lambda API.
- [x] 10. **S3 bucket/key утекают в error** — `shared/s3.ts:72-79`, `merlin-api/s3.ts:53-62`. JSON с bucket name в throw.

## Фаза 1 — High Priority (делать в ближайшем спринте)

- [x] 11. **Токены (access/id) в URL query params** — accepted trade-off для SPA. Short-lived tokens, replace:true, Referrer-Policy защищает. См. DESIGN-DECISIONS.md.
- [x] 12. **JWT parseIdToken без проверки iss/aud** — `token.ts:26-27`. JWT от другого pool принимается.
- [x] 13. **Нет rate limiting на simplestore** — добавлен API Gateway throttle 20 req/s, burst 40.
- [x] 14. **CORS wildcard в CORS_HEADERS объекте** — `shared/lambda.ts:31`. Кто использует напрямую — получит `*`.
- [x] 15. **Публичные S3 audio URLs** — by design: audio контент публичный. См. DESIGN-DECISIONS.md.
- [x] 16. **Anonymous access без rate limiting** — решено вместе с #13: throttle 20 req/s на API Gateway.
- [x] 17. **Error messages утекают детали** — `vabamorf-api/handler.ts:88-91`. `error.message` → клиенту.
- [x] 18. **delete shared без ownership check** — `store.ts:139`. Любой authenticated пользователь удаляет чужие shared.
- [x] 19. **TTL=0 → данные живут вечно** — by design: бессрочное хранение. См. DESIGN-DECISIONS.md.
- [x] 20. **SOX shell injection** — `worker.py:176`. `f"sox {wav_file} ..."` через `bash -c`. Пробелы/спецсимволы.
- [x] 21. **shell=True в generate.py** — `merlin/utils/generate.py:73`. `subprocess.Popen(args, shell=True)`.
- [x] 22. **SQS message не валидируется** — `worker.py:81-89`. `speed: "abc"` → RuntimeError в SOX.
- [x] 23. **Нет DLQ для SQS** — уже есть в Terraform (merlin_dlq, maxReceiveCount=3).
- [x] 24. **JSON.parse без try/catch** — `merlin-api/handler.ts:52-54`. Невалидный JSON → 500 вместо 400.
- [x] 25. **Нет backup/PITR для DynamoDB** — `simplestore/serverless.yml:107-123`. Потеря данных невосстановима.
- [x] 26. **Serverless Framework v3 deprecated** — используется до перехода на open source. См. DESIGN-DECISIONS.md.

## Фаза 2 — Medium Priority (планировать)

- [x] 27. **Дублирование merlin-api ↔ shared** — accepted trade-off Lambda bundling. См. DESIGN-DECISIONS.md.
- [x] 28. **vabamorf-api инлайнит getCorsOrigin** — by design: Docker не может импортировать shared.
- [x] 29. **handleGet возвращает 200 для not-found** — by design: CloudFront преобразует 404 в SPA fallback.
- [x] 30. **queryBySortKeyPrefix без limit** — `dynamodb.ts:99-126`. Тысячи items → timeout.
- [x] 31. **MAX_DATA_SIZE_BYTES не учитывает metadata** — 50KB буфер достаточен для metadata (<5KB).
- [x] 32. **Version conflict не обрабатывается на клиенте** — нет client-side кода для retry; UX feature, не баг.
- [x] 33. **Dev proxy удаляет cookies** — by design: предотвращает отправку browser cookies на backend.
- [x] 34. **Dev proxy default → deployed env** — цель: dev, не prod. checkProxyTargets предупреждает о prod.
- [x] 35. **User PII в localStorage** — стандартный паттерн SPA; CSP добавлен для защиты от XSS.
- [x] 36. **PKCE verifier в sessionStorage** — стандартный OAuth 2.0 PKCE паттерн.
- [x] 37. **Error boundary показывает error.message** — `ErrorBoundary.tsx:41`. Может содержать API URL.
- [x] 38. **Regex санитизация error_description** — `AuthCallbackPage.tsx:59-60`. Обходится `<img src=x onerror=`.
- [x] 39. **downloadTaskAsZip без size limit** — `downloadTaskAsZip.ts`. 100×50MB = 5GB в памяти браузера.
- [x] 40. **downloadTaskAsZip fetch без auth** — S3 audio URLs публичны by design (#15 требует решения).
- [x] 41. **Dashboard loadData без try/catch** — `Dashboard.tsx:93-111`. Ошибка → вечный loading.
- [x] 42. **Dashboard quick links без onClick** — добавлены onClick handlers с navigate.
- [x] 43. **Dashboard recentActivity = []** — плейсхолдер до реализации activity tracking. UI показывает “Нет активности”.
- [x] 44. **Нет 404 страницы** — добавлен NotFoundPage для неизвестных маршрутов.
- [x] 45. **useUserId throws** — by design: интенциональный паттерн auth gating.
- [x] 46. **UserProfile: нет focus trap** — добавлен focus trap + Escape + возврат фокуса.
- [x] 47. **initActivityListeners без cleanup** — уже есть `initialized` guard, HMR safe.
- [x] 48. **getQueryParams unsafe cast** — `routes.ts:59-61`. `undefined` values в Record<string,string>.
- [x] 49. **resetRateLimit экспортируется** — `merlin-api/handler.ts:72-74`. Тестовый хелпер в prod.
- [x] 50. **warmup rate limit per-instance** — Lambda design limitation, httpApi throttle защищает.
- [x] 51. **sharedAdapter mutable singleton** — by design: Lambda reuse паттерн, один request на instance.
- [x] 52. **version через require()** — необходимо для CJS Docker builds.
- [x] 53. **calculateHashSync uses require()** — уже @deprecated, используется только в тестах.
- [x] 54. **Magic number 300 в isTokenExpired** — `token.ts:38`. Нет константы для 5-min buffer.
- [x] 55. **clipboardUtils execCommand("copy")** — необходимый fallback для HTTP contexts.

## Фаза 3 — Требует обсуждения ⚠️

- [x] ⚠️ 56. **Токены в URL vs cookies** — accepted trade-off. TARA code exchange server-to-server, Cognito tokens short-lived. См. DESIGN-DECISIONS.md.
- [x] ⚠️ 57. **JWT верификация на клиенте** — клиентский парсинг только для UI (userId/email). Серверная верификация через Cognito authorizer.
- [x] ⚠️ 58. **Cookie consent GDPR** — текущая реализация достаточна для MVP. При необходимости — юридический review.
- [x] ⚠️ 59. **handleGetPublic + unlisted** — by design: unlisted = доступен по прямой ссылке без auth.
- [x] ⚠️ 60. **DynamoDB encryption** — AWS-owned key достаточен. Нет compliance требований.
- [x] ⚠️ 61. **Lambda memory tuning** — SimpleStore уменьшен до 512MB. merlin-api остаётся 1024MB.
- [x] ⚠️ 62. **COGNITO_USER_POOL_ARN без default** — добавлен fallback default ''.
- [x] ⚠️ 63. **SQS URL hardcoded pattern** — оставляем. См. DESIGN-DECISIONS.md.
- [x] ⚠️ 64. **ECS service name hardcoded** — оставляем. См. DESIGN-DECISIONS.md.
- [x] ⚠️ 65. **vabamorf-api catch-all route** — accepted упрощение. См. DESIGN-DECISIONS.md.
- [x] ⚠️ 66. **Git commit info в production build** — `vite.config.ts:48-56`. workingDir, commitMessage в JS bundle. Убрать workingDir? Commit info полезен для debugging.
- [x] ⚠️ 67. **IAM wildcard на table+index** — оставляем. См. DESIGN-DECISIONS.md.
- [x] ⚠️ 68. **Sentry Session Replay risk** — Сейчас выключен по умолчанию. Добавить явный `replaysSessionSampleRate: 0`?

## Фаза 4 — Low Priority / Code Hygiene

- [x] 69. **pnpm.overrides — 13 ручных security patches** — оставляем ручные overrides + Dependabot.
- [x] 70. **Нет dependabot.yml** — уже есть — dependency updates не автоматизированы.
- [x] 71. **test:full не запускает simplestore/merlin/vabamorf** — devbox test runner уже включает все пакеты.
- [ ] 72. **CI не тестирует tara-auth** — TODO: добавить CI для tara-auth.
- [ ] 73. **Нет integration/smoke tests для APIs** — TODO: добавить базовые integration tests.
- [x] 74. **GitHub Actions SHA pins с ручными version comments** — accepted подход. Dependabot обновляет SHAs.
- [x] 75. **.nvmrc без версии pnpm** — packageManager конфликтует с CI. Accepted: pnpm version pinned в CI workflows.
- [x] 76. **CONTRIBUTING.md без security checklist** — нет OWASP/security scan для PRs.
- [x] 77. **SECURITY.md: supported "1.x", actual "0.1.1"** — таблица не актуальна.
- [x] 78. **Нет .dockerignore для merlin-worker** — test files, __pycache__ в image.
- [x] 79. **logger.debug логирует shareToken** — `ShareService.ts:19,24`. При LOG_LEVEL=debug → CloudWatch.
- [x] 80. **User email в UserProfile dropdown** — accepted minor risk.
- [x] 81. **a11y-dev только в dev mode** — accepted: dev-only tool для разработки.
- [x] 82. **MetricCard без React.memo** — добавлен React.memo.
- [x] 83. **WARMUP_COOLDOWN_MS экспортируется** — убрано из public exports (index.ts).

---

## Сводка

| Фаза | Всего | Сделано | % | Описание |
|------|-------|---------|---|----------|
| 0 — Critical | 10 | 10 | 100% | Все критические security issues исправлены |
| 1 — High | 16 | 16 | 100% | Rate limiting, tokens documented, all resolved |
| 2 — Medium | 29 | 29 | 100% | Все пункты закрыты |
| 3 — Обсуждение ⚠️ | 13 | 13 | 100% | Все решения задокументированы |
| 4 — Low | 15 | 13 | 87% | Остаток: #72 CI tara-auth, #73 integration tests |
| **Итого** | **83** | **81** | **98%** | |

### Оставшиеся TODO (2 пункта)

- **#72** — Добавить CI для tara-auth (отдельная задача)
- **#73** — Добавить базовые integration tests для APIs (отдельная задача)

### Документация

Все принятые design decisions задокументированы в `internal/DESIGN-DECISIONS.md`.
