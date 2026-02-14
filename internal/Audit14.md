# Code Review — HAK Public — 13.02.2026

Аудитор: Security & Code Quality Review (придирчивый режим)
Scope: весь проект hak-public (frontend, backend APIs, shared, infra)

---

## SECURITY & AUTH

- [ ] 1. **TARA токены передаются через URL query parameters** (`AuthCallbackPage.tsx:24-26`).
  Токены в URL сохраняются в browser history, server logs, Referer headers — утечка credentials.

- [ ] 2. **Refresh token хранится в localStorage** (`storage.ts:54-58`).
  Любой XSS-вектор даёт злоумышленнику долгоживущий refresh token для перманентного доступа к аккаунту.

- [ ] 3. **JWT подпись не верифицируется на клиенте** (`token.ts:17-19`).
  Комментарий признаёт это — но подменённый id_token может навязать произвольный user identity клиенту.

- [x] 4. **Hardcoded Cognito credentials в исходниках** (`config.ts:49-51`).
  userPoolId, clientId, domain зашиты как fallback-значения — при fork/clone чужой код будет бить в ваш Cognito.

- [ ] 5. **PKCE code_verifier в sessionStorage** (`config.ts:66`).
  XSS может прочитать code_verifier до завершения OAuth flow и выполнить code exchange вместо пользователя.

- [x] 6. **`JSON.parse` без валидации схемы при чтении из localStorage** (`storage.ts:30`, `OnboardingContext.tsx:55`).
  Повреждённые или подменённые данные в localStorage приведут к непредсказуемому поведению.

- [x] 7. **Share token — всего 8 байт энтропии** (`shareTokenUtils.ts:4,10`).
  Генерируется 16 байт, но `substring(0, 16)` — это 16 hex-символов = 8 байт = 2^64 — перебираемо при отсутствии rate limit.

- [x] 8. **CORS `Access-Control-Allow-Origin: *`** (`lambda.ts:20`).
  Wildcard CORS позволяет любому сайту делать authenticated-запросы к API, если браузер отправит credentials.

- [ ] 9. **Нет rate limiting на API endpoints** (все serverless.yml).
  Synthesis, analyze, audio generate — все без throttling. Абьюзер может генерировать тысячи аудио за минуту.

- [x] 10. **Debug endpoint `/debug/error` доступен без аутентификации** (`handler.ts:134`).
  Любой может триггерить 500-ки и спамить мониторинг/alerting-систему.

- [ ] 11. **Audio API endpoints полностью без аутентификации** (`audio-api/serverless.yml:51-70`).
  generate, health, warm — все public. Кто угодно может генерировать аудио за ваш счёт (AWS billing).

- [ ] 12. **Merlin API endpoints без аутентификации** (`merlin-api/serverless.yml:48-81`).
  synthesize, status, warmup — public. Прямой финансовый риск: ECS scale-up по запросам злоумышленника.

- [ ] 13. **Vabamorf API полностью открыт** (`vabamorf-api/serverless.yml:30-35`).
  `/{proxy+}` + ANY method — абсолютно любой HTTP-запрос принимается без auth.

- [x] 14. **`useUserId()` возвращает `"test-user"` для неаутентифицированных** (`useUserId.ts:12`).
  Все анонимные пользователи делят один userId — могут видеть и перезаписывать данные друг друга.

- [x] 15. **Нет Content-Security-Policy** (ни в index.html, ни в response headers).
  Без CSP любой инъецированный скрипт выполнится в контексте приложения без ограничений.

- [x] 16. **Vite dev proxy молча проксирует в production** (`vite.config.ts:91-102,113,173`).
  Разработчик по умолчанию работает с prod-данными, включая merlin-prod. Случайная мутация — и данные потеряны.

- [ ] 17. **Google Fonts загружается без SRI** (`index.html:8-9`).
  Компрометация CDN Google Fonts позволит инъекцию произвольного CSS/JS.

- [ ] 18. **`errorDescription` из URL рендерится напрямую** (`AuthCallbackPage.tsx:60`).
  Атакующий может сконструировать URL с `error_description=<img onerror=...>` — potential reflected XSS.

- [ ] 19. **Нет ограничения размера data в SimpleStore save** (`validation.ts`).
  Валидируется pk/sk/type/ttl, но `data` может быть произвольного размера. DynamoDB item limit 400KB, но до этого — memory pressure на Lambda.

- [x] 20. **`Access-Control-Allow-Methods` не включает DELETE** (`lambda.ts:23`).
  Заявлены GET,POST,OPTIONS, но simplestore имеет DELETE endpoint — CORS preflight для DELETE будет rejected.

## DATA & STATE

- [ ] 21. **Все задачи пользователя в одном DynamoDB item** (`SimpleStoreAdapter.ts:77-79`).
  `loadUserTasks` читает один ключ с массивом всех задач. DynamoDB item limit = 400KB — при росте данных будет crash.

- [ ] 22. **`saveUserTasks` перезаписывает весь массив задач** (`SimpleStoreAdapter.ts:82-84`).
  Каждое изменение одной задачи перезаписывает все задачи — потеря данных при параллельных операциях.

- [ ] 23. **Нет optimistic locking / version check** (`TaskRepository.ts`).
  Два окна браузера → два read → два write → второй тихо перезатрёт изменения первого.

- [ ] 24. **`deleteTask` не удаляет unlisted copy** (`TaskRepository.ts:125-136`).
  Удалённая задача остаётся доступной по share token навсегда — data leak.

- [x] 25. **`addTextEntriesToTask` делает double read** (`TaskRepository.ts:138-187`).
  Сначала читает все задачи, потом вызывает `updateTask`, который снова читает все задачи.

- [ ] 26. **`handleGet` возвращает 200 для not-found** (`routes.ts:133-137`).
  HTTP 200 с `{ item: null }` — нарушение HTTP-семантики, затрудняет мониторинг и клиентскую обработку.

- [ ] 27. **Нет пагинации задач** (`TaskRepository.ts:18-29`).
  Все задачи загружаются целиком. При 100+ задачах — медленный UI и большой payload.

- [ ] 28. **TTL=0 по умолчанию — данные живут вечно** (`SimpleStoreAdapter.ts:17`).
  Unlisted shared tasks никогда не удаляются — рост хранилища без контроля.

- [ ] 29. **sessionStorage как inter-page transport** (`SharedTaskPage.tsx:82`, `useAppRedirects.ts:33`).
  `COPIED_ENTRIES_KEY` передаёт данные между страницами через sessionStorage — ненадёжно и race-prone.

- [ ] 30. **`getUserTasks` и `getUserCreatedTasks` — идентичные реализации** (`TaskRepository.ts:18-42`).
  Две функции с одинаковым телом — либо баг (должны фильтровать по-разному), либо мёртвый код.

## FRONTEND ARCHITECTURE

- [ ] 31. **`useSynthesis` — 310 строк, 20+ return values** (`useSynthesis.ts`).
  Чудовищный hook, нарушает Single Responsibility. Невозможно тестировать изолированно.

- [ ] 32. **`SynthesisPageContext` — god context** (`SynthesisPageContext.tsx:21-32`).
  Один context объединяет synthesis, tasks, drag-drop, variants, menu — любое изменение перерендерит всё дерево.

- [ ] 33. **`useTaskHandlers` сливает три hooks через spread** (`useTaskHandlers.ts:77-81`).
  `...modals, ...crud, ...entries` — если два hook вернут одноимённое свойство, один тихо затрёт другой.

- [ ] 34. **Singleton `DataService.getInstance()`** (`dataService.ts:29-35`).
  Глобальное состояние, невозможность параллельного тестирования, скрытое связывание.

- [x] 35. **Нет Error Boundary вокруг lazy routes** (`main.tsx:48-57`).
  Suspense есть, ErrorBoundary обёртывает всё приложение — но ошибка в одном route убьёт всё.

- [x] 36. **Глубокая вложенность тернарных операторов** (`useCurrentView.ts:29-41`).
  6 уровней вложенных ternary — нечитаемо и error-prone.

- [x] 37. **`"use client"` в не-Next.js приложении** (`LoginModal.tsx:4`, `UserProfile.tsx:4`, и др.).
  Директива бессмысленна в Vite+React. Создаёт ложное впечатление server-side rendering.

- [x] 38. **Module-level side effects в `warmAudioWorker.ts:48-54`**.
  Event listeners регистрируются при импорте модуля. Невозможно контролировать lifecycle, ломает тесты.

- [x] 39. **`_taskName` accepted but unused** (`ShareTaskModal.tsx:19`).
  Параметр принимается и сразу переименовывается в `_taskName` — мёртвый код в API компонента.

- [x] 40. **Нет TypeScript `strict: true` в tsconfig** (не найден strict flag).
  Без strict mode — implicit any, nullable без проверок, слабая типобезопасность.

## API & NETWORK

- [ ] 41. **`postJSON` не отправляет auth headers** (`analyzeApi.ts:21-32`).
  Все POST-запросы к analyze/synthesize идут без Authorization — API полагается только на отсутствие auth.

- [x] 42. **Нет AbortController в `synthesizeWithPolling`** (`synthesize.ts:50-64`).
  Пользователь уходит со страницы — polling продолжается 30 секунд в фоне.

- [x] 43. **`pollForAudio` не отменяем** (`synthesize.ts:25-39`).
  30 попыток × 1 сек — если компонент unmount, запросы продолжатся. Memory leak + wasted bandwidth.

- [ ] 44. **Нет retry logic на failed API calls** (synthesize, analyze, variants).
  Однократный сбой сети = полный отказ. Нет exponential backoff, нет retry.

- [x] 45. **`SimpleStoreAdapter.get` шлёт auth headers для public endpoint** (`SimpleStoreAdapter.ts:62-64`).
  `/get-public` вызывается с `Authorization: Bearer ...` — токен утекает на не требующий auth endpoint.

- [ ] 46. **`warmAudioWorker` пингует Merlin на каждое mousemove** (`warmAudioWorker.ts:48-54`).
  Throttle 60 сек, но listener на mousemove — каждое движение мыши вызывает функцию для проверки таймера.

- [x] 47. **`fetchAudioBlob` не проверяет размер ответа** (`downloadTaskAsZip.ts:34-40`).
  Злонамеренный audioUrl может вернуть гигабайтный blob — browser out of memory.

- [ ] 48. **Sequential audio download в ZIP export** (`downloadTaskAsZip.ts:86-96`).
  Аудио скачивается последовательно. 100 записей × 2сек = 200 секунд ожидания.

- [x] 49. **`JSON.parse(event.body)` без try/catch** (`audio-api/handler.ts:49`).
  Невалидный JSON тело запроса вызовет unhandled exception — 500 вместо 400.

- [ ] 50. **Merlin CORS ограничен двумя origins, а shared lambda.ts — wildcard** (`merlin-api/serverless.yml:13-16`).
  Непоследовательная CORS-политика: один API строгий, остальные — открытые.

## UI & UX

- [x] 51. **Индекс как key в MetricCard** (`Dashboard.tsx:138`).
  `key={i}` — при изменении порядка метрик React перерендерит неправильные элементы.

- [ ] 52. **Hardcoded fake data в Dashboard** (`Dashboard.tsx:108-110`).
  Активность "Sisselogimine" захардкожена — Dashboard показывает ложные данные.

- [x] 53. **Footer содержит мёртвые ссылки `href="#"`** (`Footer.tsx:29,32`).
  "Portaalist" и "Versiooniajalugu" ведут в никуда — broken navigation.

- [x] 54. **Email захардкожен в Footer** (`Footer.tsx:89,98`).
  `kristjan.suluste@eki.ee` — персональный email в коде. При смене ответственного — правка в коде.

- [x] 55. **ConfirmationModal: cancelText="Cancel" на английском** (`ConfirmationModal.tsx:24`).
  Всё приложение на эстонском, но дефолтная кнопка отмены — на английском.

- [x] 56. **Нет max count у notifications** (`NotificationContainer.tsx:54`).
  `setNotifications(prev => [...prev, notification])` — без лимита. Массовые ошибки = сотни toast.

- [x] 57. **BaseModal ставит `overflow: "unset"` при cleanup** (`BaseModal.tsx:125`).
  Не восстанавливает оригинальное значение. Если overflow было не default — layout break.

- [ ] 58. **Backdrop div с `onKeyDown` без `tabIndex`** (`BuildInfoModal.tsx:107`).
  `role="presentation"` div не получит keyboard focus — `onKeyDown` handler никогда не сработает.

- [ ] 59. **Drag-and-drop без keyboard-accessible альтернативы** (`SynthesisView.tsx:66-75`).
  WCAG 2.1 требует keyboard-доступную альтернативу для drag-and-drop. Отсутствует.

- [ ] 60. **Нет ARIA live region для synthesis loading states** (SentenceSynthesisItem).
  Screen reader не узнает о смене состояния play/loading/error — invisible state changes.

## INFRASTRUCTURE & DEVOPS

- [ ] 61. **Serverless Framework v3 — maintenance mode с 2024** (все serverless.yml).
  Четыре TODO в коде, но миграция не выполнена. Security patches для v3 не гарантированы.

- [ ] 62. **Mixed API types: REST API vs HTTP API** (`simplestore` vs `merlin-api`).
  simplestore использует REST API (`http:`), merlin — HTTP API (`httpApi:`). Разная семантика авторизации.

- [ ] 63. **`COGNITO_USER_POOL_ARN` через env var без валидации** (`simplestore/serverless.yml:134`).
  Если env var не задан — deploy пройдёт с пустым ARN, authorizer будет broken.

- [ ] 64. **Нет WAF перед API Gateway** (все serverless.yml).
  Без Web Application Firewall — нет protection от SQL injection, DDoS, bot abuse на edge.

- [ ] 65. **CI/CD не запускает security audit** (`.github/workflows/build.yml`).
  `pnpm audit` не вызывается — уязвимости в dependencies не обнаруживаются автоматически.

- [ ] 66. **Нет SAST/DAST в pipeline** (`.github/workflows/build.yml`).
  Нет Snyk, Trivy, CodeQL — статический и динамический анализ безопасности отсутствует.

- [ ] 67. **`pnpm overrides` для CVE — ручное управление** (`package.json:43-55`).
  13 overrides для security patches. Без automated vulnerability scanning это рухнет.

- [x] 68. **Нет dependabot/renovate конфигурации** (`.github/`).
  Зависимости не обновляются автоматически — security patches приходят с задержкой.

- [ ] 69. **`build.yml` не кэширует pnpm store** (`.github/workflows/build.yml`).
  `cache: pnpm` в setup-node, но нет explicit store caching — CI медленнее чем нужно.

- [ ] 70. **Нет staging environment** (`serverless.yml` — только dev и prod).
  Изменения идут dev → prod без промежуточного staging — нет canary/smoke testing.

## CODE QUALITY

- [x] 71. **`console.error` вместо logger** (`ShareService.ts:27`).
  Один прямой `console.error` среди logger-вызовов — непоследовательное логирование.

- [x] 72. **`isVabamorfMarker` — array.includes вместо Set** (`phoneticMarkers.ts:119-133`).
  Создаёт новый array при каждом вызове и ищет линейно. В hot path (char-by-char processing).

- [x] 73. **String concatenation в цикле** (`phoneticMarkers.ts:54-69`).
  `result += char` в цикле — O(n²) string building вместо array.join().

- [x] 74. **`generateShareToken` truncates entropy** (`shareTokenUtils.ts:10`).
  Генерирует 16 random bytes (32 hex chars), затем `substring(0, 16)` — выбрасывает половину энтропии.

- [ ] 75. **`processedRef` не защищает от StrictMode double-mount** (`AuthCallbackPage.tsx:14,18`).
  В dev mode React вызовет effect дважды. Ref спасает от второго, но первый уже сделал side-effect (navigation).

- [ ] 76. **`getEntryPlayUrl` создаёт blob URL без гарантии revoke** (`task.ts:56`).
  Каждый вызов создаёт `URL.createObjectURL` — caller должен revoke, но API не enforces это.

- [x] 77. **`handlePlayAll` читает stale state через closure** (`useSharedTaskAudio.ts:179`).
  `isPlayingAll`, `isLoadingPlayAll` замкнуты в useCallback — при быстром повторном вызове видят stale значения.

- [x] 78. **`navigator.clipboard.writeText` без feature detection** (`clipboardUtils.ts:16`).
  В HTTP (не HTTPS) контексте clipboard API недоступен — unhandled rejection.

- [ ] 79. **`a.click()` download не работает в Safari iOS** (`downloadTaskAsZip.ts:104-106`, `useSynthesis.ts:138-140`).
  Программный `a.click()` для download блокируется Safari на iOS — файл не скачается.

- [x] 80. **`sanitizeFilename` может разрезать multi-byte char** (`downloadTaskAsZip.ts:13`).
  `.slice(0, 80)` режет по JS code units — может разрезать эмодзи или Unicode символ пополам.

## PRIVACY & COMPLIANCE

- [x] 81. **Sentry `replayIntegration()` записывает сессии** (`main.tsx:15`).
  Session replay записывает действия пользователя (клики, ввод). Для гос. сервиса Эстонии — GDPR concern.

- [ ] 82. **`tracesSampleRate: 0.1` — 10% трейсов уходят в Sentry** (`main.tsx:17`).
  Данные об активности пользователей отправляются третьей стороне без явного consent.

- [ ] 83. **Build info показывает `workingDir` в production** (`BuildInfo.tsx:131-136`).
  Путь к рабочей директории разработчика виден в UI — information disclosure.

- [x] 84. **User ID отображается в профиле** (`UserProfile.tsx:49,75`).
  Cognito sub (UUID) показан пользователю — внутренний идентификатор не должен быть в UI.

- [ ] 85. **Shared tasks доступны без аутентификации навечно** (`SharedTaskPage.tsx`).
  Share token = permanent public access. Нет expiration, нет revoke, нет audit log.

- [x] 86. **Нет cookie consent / privacy banner** (index.html, App.tsx).
  Приложение использует localStorage, Sentry, Google Fonts — но consent не запрашивается.

- [x] 87. **`logger.debug("Sharing task:", task)` логирует весь объект задачи** (`ShareService.ts:19`).
  В debug-логи попадает полное содержимое задачи включая пользовательский текст.

- [x] 88. **Personal email в исходном коде** (`Footer.tsx:89`).
  GDPR: персональные данные (email) в публичном open-source репозитории.

## TESTING & RELIABILITY

- [ ] 89. **`DataService.getInstance()` используется в компонентах напрямую** (`Dashboard.tsx:94`, `SharedTaskPage.tsx:48`).
  Singleton вызывается в компонентах без DI — мокировать в тестах крайне неудобно.

- [ ] 90. **Нет integration tests для API endpoints** (`.github/workflows/build.yml`).
  CI запускает unit-тесты, но нет smoke/integration тестов для Lambda handlers.

- [ ] 91. **`new Audio()` не мокируется в тестах** (useSharedTaskAudio.ts, useSynthesis.ts).
  Множественные `new Audio(url)` без абстракции — нетестируемый аудио-код.

- [ ] 92. **Нет tests для auth flow** (`AuthCallbackPage.tsx`).
  TARA callback, code exchange, token refresh — критический код без интеграционного покрытия.

- [ ] 93. **`crypto.randomUUID()` без polyfill** (`NotificationContainer.tsx:43`, `TaskRepository.ts:9`).
  В не-HTTPS или старых браузерах `crypto.randomUUID()` может быть undefined.

- [ ] 94. **Нет health check endpoint для frontend** (vite.config.ts, CI).
  Backend имеет `/health`, frontend — нет. Невозможно мониторить доступность SPA.

## MISC

- [ ] 95. **Serverless v3 TODO × 4** (audio-api, merlin-api, simplestore, vabamorf-api).
  Один и тот же TODO "migrate to Serverless v4" в четырёх файлах — technical debt accumulation.

- [ ] 96. **`getModifiableTasks` — лишняя индирекция** (`TaskRepository.ts:44-46`).
  Просто вызывает `getUserCreatedTasks` — добавляет confusion без добавления логики.

- [ ] 97. **`@hak/simplestore` в devDependencies frontend** (`frontend/package.json:82`).
  Runtime-зависимость backend-пакета в devDependencies фронтенда — подозрительно.

- [ ] 98. **`eslint.base.config.mjs` — 13KB** (корень проекта).
  Конфигурация ESLint размером с небольшой модуль — maintenance nightmare.

- [ ] 99. **Mixed Vitest + Jest** (`frontend/package.json: vitest + jest`).
  Два тестовых фреймворка в одном пакете — confusion, дублирование конфигурации.

- [ ] 100. **`Sentry.init()` вызывается до импорта App** (`main.tsx:9-20`).
  Side-effect до основного кода. При ошибке в Sentry init — всё приложение не загрузится.

Общее впечатление: **7 из 10**.

Почему не ниже:
• Архитектура фронтенда продуманная — feature-based структура, чистое разделение auth/synthesis/tasks/sharing
• Backend (SimpleStore) — элегантный, минималистичный, хорошо абстрагирован (adapter pattern, чистые типы)
• Тесты есть и запускаются в CI — lint, typecheck, unit tests
• PKCE flow для OAuth реализован корректно
• Accessibility: axe-core в dev mode, skip-links, ARIA-атрибуты, focus trap в модалках
• Код чистый, консистентный стиль, SPDX-заголовки, хорошие JSDoc комментарии
• Dependency management: pnpm overrides для CVE, pinned CI actions по SHA

Почему не выше:
• Три backend API (audio, merlin, vabamorf) полностью без аутентификации — это прямой финансовый риск
• Все задачи юзера в одном DynamoDB item — архитектурный потолок, который больно ударит при росте
• Нет CSP, нет WAF, нет rate limiting — для гос. сервиса Эстонии это серьёзный пробел
• Sentry replay без consent — GDPR risk для публичного проекта
• Serverless v3 в maintenance mode × 4 пакета

Если коротко: код написан аккуратно и с пониманием дела, но инфраструктурная безопасность и data layer нуждаются в серьёзной доработке перед production. Как open source проект для контрибьюторов — вполне достойный, но deploy as-is в прод для гос. сервиса я бы не рекомендовал без закрытия хотя бы первых 20 пунктов аудита.