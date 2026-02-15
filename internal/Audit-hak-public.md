# Code Review — hak-public — 15.02.2026

Аудитор: Luna | Scope: весь hak-public | Repo: github.com/askend-lab/hak-public
Легенда: ⚠️ = требует обсуждения перед реализацией

---

## Фаза 0 — Security Critical (делать немедленно)

- [x] 1. **merlin-api CORS wildcard** — `response.ts` не использует `getCorsOrigin()`, hardcoded `"*"`. Чинить: импорт из shared.
- [ ] 2. **synthesize без авторизации** — `merlin-api/serverless.yml:57-60` нет Cognito authorizer. Публичный TTS = абьюз.
- [ ] 3. **warmup без авторизации** — `merlin-api/serverless.yml:84-87`. Любой масштабирует ECS → расходы.
- [x] 4. **mock-users.json в public/** — `frontend/public/data/mock-users.json` с эстонскими ID-кодами и email. Удалить.
- [x] 5. **Нет max text length в synthesize** — `validateText` проверяет только непустоту. Мегабайтный текст → TTS crash.
- [x] 6. **cacheKey без санитизации** — `handler.ts:128`, `s3.ts:68`. `cache/${cacheKey}.wav` → path traversal в S3.
- [x] 7. **speed/pitch не валидируются** — `handler.ts:56-63`. `speed:-999` передаётся в SOX через shell.
- [x] 8. **Нет CSP headers** — нигде в проекте. XSS загрузит произвольные скрипты.
- [x] 9. **Нет security headers** — X-Content-Type-Options, X-Frame-Options, HSTS отсутствуют во всех Lambda API.
- [x] 10. **S3 bucket/key утекают в error** — `shared/s3.ts:72-79`, `merlin-api/s3.ts:53-62`. JSON с bucket name в throw.

## Фаза 1 — High Priority (делать в ближайшем спринте)

- [ ] 11. **Токены (access/id) в URL query params** — `AuthCallbackPage.tsx:24-25`. Видны в history, logs, Referer.
- [x] 12. **JWT parseIdToken без проверки iss/aud** — `token.ts:26-27`. JWT от другого pool принимается.
- [ ] 13. **Нет rate limiting на simplestore** — `simplestore/serverless.yml`. Бомбить `/save`, `/query` без лимитов.
- [x] 14. **CORS wildcard в CORS_HEADERS объекте** — `shared/lambda.ts:31`. Кто использует напрямую — получит `*`.
- [ ] 15. **Публичные S3 audio URLs** — `merlin-api/s3.ts:72-73`. Нет signed URLs, bucket name раскрыт клиенту.
- [ ] 16. **Anonymous access без rate limiting** — `simplestore/handler.ts:113-135`. Brute-force shared/unlisted данных.
- [x] 17. **Error messages утекают детали** — `vabamorf-api/handler.ts:88-91`. `error.message` → клиенту.
- [x] 18. **delete shared без ownership check** — `store.ts:139`. Любой authenticated пользователь удаляет чужие shared.
- [ ] 19. **TTL=0 → данные живут вечно** — `validation.ts:82-84`. Shared/unlisted аккумулируются бесконечно.
- [x] 20. **SOX shell injection** — `worker.py:176`. `f"sox {wav_file} ..."` через `bash -c`. Пробелы/спецсимволы.
- [x] 21. **shell=True в generate.py** — `merlin/utils/generate.py:73`. `subprocess.Popen(args, shell=True)`.
- [x] 22. **SQS message не валидируется** — `worker.py:81-89`. `speed: "abc"` → RuntimeError в SOX.
- [ ] 23. **Нет DLQ для SQS** — отравленные сообщения retry бесконечно.
- [x] 24. **JSON.parse без try/catch** — `merlin-api/handler.ts:52-54`. Невалидный JSON → 500 вместо 400.
- [x] 25. **Нет backup/PITR для DynamoDB** — `simplestore/serverless.yml:107-123`. Потеря данных невосстановима.
- [ ] 26. **Serverless Framework v3 deprecated** — EOL September 2024. Нет security updates.

## Фаза 2 — Medium Priority (планировать)

- [ ] 27. **Дублирование merlin-api ↔ shared** — s3.ts, response.ts, env.ts, HTTP_STATUS. 5+ файлов с копиями.
- [ ] 28. **vabamorf-api инлайнит getCorsOrigin** — `validation.ts:5-7`. Docker причина, но два источника правды.
- [ ] 29. **handleGet возвращает 200 для not-found** — `routes.ts:132-136`. Нарушение HTTP семантики.
- [x] 30. **queryBySortKeyPrefix без limit** — `dynamodb.ts:99-126`. Тысячи items → timeout.
- [ ] 31. **MAX_DATA_SIZE_BYTES не учитывает metadata** — `types.ts:85`. 350KB data + PK/SK → ~400KB DynamoDB limit.
- [ ] 32. **Version conflict не обрабатывается на клиенте** — нет retry при VersionConflictError.
- [ ] 33. **Dev proxy удаляет cookies** — `vite.config.ts:116-118`. Ломает httpOnly refresh flow при dev.
- [ ] 34. **Dev proxy default → deployed env** — `vite.config.ts:113`. Localhost → hak-dev.askend-lab.com.
- [ ] 35. **User PII в localStorage** — `storage.ts:27-38`. email, name в `hak_user` — при XSS утекает.
- [ ] 36. **PKCE verifier в sessionStorage** — `config.ts:67`. При XSS доступен в той же вкладке.
- [x] 37. **Error boundary показывает error.message** — `ErrorBoundary.tsx:41`. Может содержать API URL.
- [x] 38. **Regex санитизация error_description** — `AuthCallbackPage.tsx:59-60`. Обходится `<img src=x onerror=`.
- [x] 39. **downloadTaskAsZip без size limit** — `downloadTaskAsZip.ts`. 100×50MB = 5GB в памяти браузера.
- [ ] 40. **downloadTaskAsZip fetch без auth** — `downloadTaskAsZip.ts:37`. S3 audio без headers.
- [x] 41. **Dashboard loadData без try/catch** — `Dashboard.tsx:93-111`. Ошибка → вечный loading.
- [ ] 42. **Dashboard quick links без onClick** — `Dashboard.tsx:55-63`. Мёртвые кнопки.
- [ ] 43. **Dashboard recentActivity = []** — `Dashboard.tsx:106`. Hardcoded пустой массив.
- [ ] 44. **Нет 404 страницы** — `main.tsx:60`. `path="*"` → App. Любой URL рендерит synthesis.
- [ ] 45. **useUserId throws** — `useUserId.ts:12-14`. Компонент до проверки auth → crash.
- [ ] 46. **UserProfile: нет focus trap** — `UserProfile.tsx:55-88`. Tab уходит за dropdown.
- [ ] 47. **initActivityListeners без cleanup** — `main.tsx:33`. HMR → duplicate listeners.
- [x] 48. **getQueryParams unsafe cast** — `routes.ts:59-61`. `undefined` values в Record<string,string>.
- [x] 49. **resetRateLimit экспортируется** — `merlin-api/handler.ts:72-74`. Тестовый хелпер в prod.
- [ ] 50. **warmup rate limit per-instance** — `handler.ts:70`. Cold start сбрасывает. Concurrent Lambdas обходят.
- [ ] 51. **sharedAdapter mutable singleton** — `handler.ts:35-40`. Race condition при concurrent requests.
- [ ] 52. **version через require()** — `vabamorf-api/handler.ts:21-30`. Хрупкий двойной try/catch.
- [ ] 53. **calculateHashSync uses require()** — `shared/hash.ts:65`. CJS в ESM проекте. Deprecated.
- [x] 54. **Magic number 300 в isTokenExpired** — `token.ts:38`. Нет константы для 5-min buffer.
- [ ] 55. **clipboardUtils execCommand("copy")** — deprecated fallback API.

## Фаза 3 — Требует обсуждения ⚠️

- [ ] ⚠️ 56. **Токены в URL vs cookies** — #11 связан. TARA redirect передаёт tokens в URL. Альтернатива: server-side session, но усложняет архитектуру. Нужно решение.
- [ ] ⚠️ 57. **JWT верификация на клиенте** — #12. Серверная верификация через Cognito есть, клиентская избыточна? Но parseIdToken определяет userId. Обсудить уровень доверия к URL params.
- [ ] ⚠️ 58. **Cookie consent GDPR** — CookieConsent.tsx: одна кнопка "Nõustun", нет отказа. Sentry init до consent. Privacy page не описывает localStorage. Нужен юридический review формулировок.
- [ ] ⚠️ 59. **handleGetPublic + unlisted** — `routes.ts:175-188`. Unlisted данные доступны через public endpoint. By design? Или нужен только shared?
- [ ] ⚠️ 60. **DynamoDB encryption** — `serverless.yml:107-123`. AWS-owned key по умолчанию. CMK нужен для compliance? Зависит от требований.
- [ ] ⚠️ 61. **Lambda memory tuning** — default 1024MB. Simplestore: избыточно. merlin-api: достаточно? Нужен profiling.
- [ ] ⚠️ 62. **COGNITO_USER_POOL_ARN без default** — `serverless.yml:134`. Deployment ломается без env var. Добавить validation в CI или оставить?
- [ ] ⚠️ 63. **SQS URL hardcoded pattern** — `merlin-api/serverless.yml:27`. !GetAtt vs env var конструкция. Cross-stack?
- [ ] ⚠️ 64. **ECS service name hardcoded** — `serverless.yml:51`. Динамическая ссылка усложнит, hardcode прост. Trade-off.
- [ ] ⚠️ 65. **vabamorf-api catch-all route** — `serverless.yml:50-54`. ANY /{proxy+}. Архитектурное решение — менять?
- [x] ⚠️ 66. **Git commit info в production build** — `vite.config.ts:48-56`. workingDir, commitMessage в JS bundle. Убрать workingDir? Commit info полезен для debugging.
- [ ] ⚠️ 67. **IAM wildcard на table+index** — `serverless.yml:61`. !GetAtt DataTable.Arn покрывает и будущие GSI. Ограничить?
- [ ] ⚠️ 68. **Sentry Session Replay risk** — Сейчас выключен по умолчанию. Добавить явный `replaysSessionSampleRate: 0`?

## Фаза 4 — Low Priority / Code Hygiene

- [ ] 69. **pnpm.overrides — 13 ручных security patches** — Автоматизировать через Dependabot/Renovate.
- [x] 70. **Нет dependabot.yml** — уже есть — dependency updates не автоматизированы.
- [ ] 71. **test:full не запускает simplestore/merlin/vabamorf** — `package.json:16-17`. Только frontend+shared.
- [ ] 72. **CI не тестирует tara-auth** — пакет отсутствует в public repo.
- [ ] 73. **Нет integration/smoke tests для APIs** — только unit tests.
- [ ] 74. **GitHub Actions SHA pins с ручными version comments** — могут устареть.
- [ ] 75. **.nvmrc без версии pnpm** — pnpm version только в CI.
- [x] 76. **CONTRIBUTING.md без security checklist** — нет OWASP/security scan для PRs.
- [x] 77. **SECURITY.md: supported "1.x", actual "0.1.1"** — таблица не актуальна.
- [x] 78. **Нет .dockerignore для merlin-worker** — test files, __pycache__ в image.
- [x] 79. **logger.debug логирует shareToken** — `ShareService.ts:19,24`. При LOG_LEVEL=debug → CloudWatch.
- [ ] 80. **User email в UserProfile dropdown** — shoulder surfing risk. Minor.
- [ ] 81. **a11y-dev только в dev mode** — production a11y issues не обнаруживаются.
- [ ] 82. **MetricCard без React.memo** — minor performance, ререндер при state change.
- [ ] 83. **WARMUP_COOLDOWN_MS экспортируется** — internal constant видна снаружи.

---

## Сводка

| Фаза | Кол-во | Описание |
|------|--------|----------|
| 0 — Critical | 10 | Делать немедленно, без обсуждения |
| 1 — High | 16 | Ближайший спринт |
| 2 — Medium | 29 | Планировать |
| 3 — Обсуждение ⚠️ | 13 | Требует решения/trade-off |
| 4 — Low | 15 | Code hygiene, когда будет время |
| **Итого** | **83** | |
