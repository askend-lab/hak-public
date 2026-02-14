# План улучшения HAK Public — пошаговый

Бюджет: ≤ €10/мес дополнительных расходов.
Порядок: от самого критичного и бесплатного к менее срочному.

---

## Фаза 1 — Немедленная защита (бесплатно, 1 день)

- [x] **1.1. Lambda concurrency limits на все API**
  Добавить `reservedConcurrency` в serverless.yml каждого сервиса.
  Это потолок параллельных Lambda — при превышении AWS возвращает 429.
  Файлы: `audio-api/serverless.yml`, `merlin-api/serverless.yml`, `vabamorf-api/serverless.yml`.
  Стоимость: $0.

- [x] **1.2. Убрать Sentry Session Replay**
  Удалить `replayIntegration()`, `replaysSessionSampleRate`, `replaysOnErrorSampleRate` из `main.tsx`.
  Error tracking и browser tracing остаются — они не требуют consent.
  Стоимость: $0. GDPR-риск устранён.

- [x] **1.3. Убрать debug endpoint**
  Удалить `/debug/error` из `simplestore/serverless.yml` и handler.
  Открытый endpoint для генерации 500 — лишняя attack surface.
  Стоимость: $0.

## Фаза 2 — API Gateway throttling (бесплатно, 1 день)

- [x] **2.1. Throttling на audio-api (REST API)**
  Добавить `provider.apiGateway.throttle` с `rateLimit: 10`, `burstLimit: 20`.
  REST API поддерживает это нативно в Serverless Framework.
  Стоимость: $0 (встроено в API Gateway).

- [x] **2.2. Throttling на merlin-api (HTTP API)**
  Добавить CloudFormation resource для `AWS::ApiGatewayV2::Stage` с
  `DefaultRouteSettings.ThrottlingRateLimit: 5`, `ThrottlingBurstLimit: 10`.
  Стоимость: $0.

- [x] **2.3. Throttling на vabamorf-api (HTTP API)**
  Аналогично merlin-api: `ThrottlingRateLimit: 20`, `ThrottlingBurstLimit: 50`.
  Морфологический анализ легче, можно лимит выше.
  Стоимость: $0.

## Фаза 3 — Content-Security-Policy (бесплатно, 2 дня)

- [x] **3.1. Составить список внешних ресурсов**
  Открыть prod в браузере, проверить Network tab. Зафиксировать все домены:
  fonts.googleapis.com, fonts.gstatic.com, *.ingest.sentry.io, browser.sentry-cdn.com,
  merlin-*, vabamorf-*, *.amazonaws.com (для аудио).

- [x] **3.2. Добавить CSP в Report-Only режиме**
  Meta tag в `index.html`:
  `<meta http-equiv="Content-Security-Policy-Report-Only" content="...">`
  Это не блокирует ничего, только логирует нарушения в консоль браузера.
  Стоимость: $0.

- [ ] **3.3. Мониторинг 1-2 недели**
  Проверять console.log в prod на CSP violations. Корректировать policy если нужно.

- [ ] **3.4. Переключить CSP на enforce**
  Заменить `Content-Security-Policy-Report-Only` на `Content-Security-Policy`.
  Стоимость: $0.

## Фаза 4 — WAF (≤ €10/мес, 1 день)

- [ ] **4.1. Создать AWS WAF Web ACL**
  Один Web ACL на все API ($5/мес). Правила:
  - Rate limit 300 req / 5 min per IP ($1/мес)
  - AWSManagedRulesCommonRuleSet — бесплатный managed rule group ($1/мес за правило)
  Итого: ~$7-8/мес ≈ €7/мес.

- [ ] **4.2. Включить WAF в Count режиме**
  Привязать Web ACL ко всем трём API Gateway stages.
  Count mode = логирует, не блокирует. Безопасно включить сразу.

- [ ] **4.3. Мониторинг 1 неделю**
  Проверить CloudWatch WAF metrics. Убедиться что легитимный трафик не попадает под rate limit.

- [ ] **4.4. Переключить WAF на Block**
  Изменить действие с Count на Block. Теперь абьюзеры блокируются per-IP,
  легитимные юзеры продолжают работать.

## Фаза 5 — Serverless v3 → v4 (бесплатно, 3 дня)

- [x] **5.1. Проверить совместимость плагинов**
  Все плагины совместимы с v4:
  - serverless-offline 14.4.0: peerDep `serverless: ^4.0.0`
  - serverless-domain-manager 9.1.0: peerDep `serverless: >=3`
  - serverless-esbuild 1.57.0: compatible
  ⚠️ **Serverless v4 требует Dashboard account или license key** (бесплатно для open source,
  но нужна настройка `SERVERLESS_ACCESS_KEY` в CI/CD).

- [x] **5.2. Мигрировать vabamorf-api (пилот)**
  Самый простой сервис: 1 function, 1 плагин. Обновить frameworkVersion,
  deploy в dev, smoke test.

- [x] **5.3. Мигрировать audio-api**
  2 плагина, 3 functions. Deploy в dev, проверить /generate, /health, /warm.

- [x] **5.4. Мигрировать merlin-api**
  1 плагин, 4 functions. Deploy в dev, проверить /synthesize, /status, /health, /warmup.

- [x] **5.5. Мигрировать simplestore**
  3 плагина, DynamoDB resources. Самый сложный — тестировать тщательно.

- [ ] **5.6. Deploy всех сервисов в prod**
  После успешного тестирования в dev — deploy в prod по одному.

---

## Итого

| Фаза | Что               | Время  | Стоимость      | Эффект                              |
|------|--------------------|--------|----------------|-------------------------------------|
| 1    | Lambda limits, Sentry, debug | 1 день | $0     | Защита кошелька + GDPR              |
| 2    | API throttling     | 1 день | $0             | Ограничение req/sec per endpoint    |
| 3    | CSP                | 2 дня  | $0             | Защита от XSS                       |
| 4    | WAF                | 1 день | ~€7/мес        | Per-IP rate limit + managed rules   |
| 5    | Serverless v4      | 3 дня  | $0             | Актуальный framework, security patches |

**Общее время: ~8 рабочих дней. Доп. расходы: ~€7/мес.**
