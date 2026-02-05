# Code Review Plan for Open Source Release

**Цель:** Подготовить репозиторий HAK к выкладыванию в open source.  
**Метод:** Злобный код-ревью каждого модуля с чекбоксами.

## Как работать с этим планом

1. Агент берёт **один незанятый блок** (без галочки)
2. Ставит `[🔄]` — "в работе"
3. Делает ревью, пишет findings в `/docs/code-review/` 
4. Ставит `[✅]` — завершено
5. Берёт следующий блок

**Важно:** Каждый блок — независимая единица работы. Агенты не пересекаются.

---

## Part A: Backend Modules (10 блоков)

### [✅] A01. packages/shared
- `src/` — utils, logger, hash, constants
- Проверить: экспорты, типизация, тесты

### [✅] A02. packages/simplestore/src/core
- store.ts, types.ts, validation.ts
- Проверить: бизнес-логика, типы

### [✅] A03. packages/simplestore/src/adapters + lambda
- memory.ts, dynamodb.ts, handler.ts, routes.ts
- Проверить: DI, error handling

### [ ] A04. packages/simplestore/test
- Все тесты simplestore
- Проверить: покрытие, качество тестов

### [ ] A05. packages/audio-api
- src/ + test/
- Проверить: S3/SQS интеграция, error handling

### [ ] A06. packages/vabamorf-api/src
- handler, parser, validation, types
- Проверить: парсинг, типизация

### [ ] A07. packages/vabamorf-api/test
- Все тесты vabamorf
- Проверить: edge cases, mocks

### [ ] A08. packages/merlin-api + merlin-worker
- TTS интеграция
- Проверить: async flow, error handling

### [ ] A09. packages/gherkin-parser
- Парсер Gherkin спецификаций
- Проверить: корректность парсинга

### [ ] A10. packages/specifications
- Gherkin features (auth, playlist, sharing, synthesis, tasks)
- Проверить: качество спецификаций, покрытие

---

## Part B: Frontend — Services (6 блоков)

### [ ] B01. frontend/src/services/auth
- Аутентификация, токены
- Проверить: безопасность, error handling

### [ ] B02. frontend/src/services/repository
- API клиент, data access
- Проверить: типизация, error handling

### [ ] B03. frontend/src/services/storage
- LocalStorage, persistence
- Проверить: сериализация, edge cases

### [ ] B04. frontend/src/services/merlin + vabamorf
- TTS и морфология клиенты
- Проверить: интеграция, типы

### [ ] B05. frontend/src/services/specs
- Спецификации клиент
- Проверить: типы, features

### [ ] B06. frontend/src/services/__mocks__
- Моки для тестов
- Проверить: соответствие реальным API

---

## Part C: Frontend — Components (6 блоков)

### [ ] C01. frontend/src/components/ui
- Базовые UI компоненты
- Проверить: переиспользуемость, a11y, стили

### [ ] C02. frontend/src/components/TaskDetailView
- Просмотр задач
- Проверить: логика, hooks

### [ ] C03. frontend/src/components/SentenceSynthesis
- Синтез предложений
- Проверить: состояние, UX

### [ ] C04. frontend/src/components/PronunciationVariants
- Варианты произношения
- Проверить: логика выбора

### [ ] C05. frontend/src/components/onboarding
- Onboarding flow
- Проверить: UX, состояние

### [ ] C06. frontend/src/components/specs
- Компоненты спецификаций
- Проверить: отображение данных

---

## Part D: Frontend — Core (6 блоков)

### [ ] D01. frontend/src/pages
- Все страницы приложения
- Проверить: роутинг, layout

### [ ] D02. frontend/src/hooks
- Кастомные хуки (включая synthesis/)
- Проверить: реактивность, зависимости

### [ ] D03. frontend/src/contexts
- React контексты
- Проверить: провайдеры, подписки

### [ ] D04. frontend/src/types + config
- Типы и конфигурация
- Проверить: полнота, консистентность

### [ ] D05. frontend/src/styles
- Стили (base, components, tokens, abstracts)
- Проверить: консистентность, CSS-in-JS

### [ ] D06. frontend/src/utils + data + test + features
- Утилиты, данные, тесты
- Проверить: helpers, mocks, step definitions

---

## Part E: Infrastructure & Config (5 блоков)

### [ ] E01. infra/*.tf (main, variables, outputs)
- Базовая конфигурация Terraform
- Проверить: секреты, best practices

### [ ] E02. infra/ (API Gateway, DynamoDB, Route53, website)
- AWS ресурсы
- Проверить: security, naming

### [ ] E03. infra/ (CloudFront, CloudWatch)
- CDN и мониторинг
- Проверить: алармы, dashboards

### [ ] E04. infra/ (audio, merlin, slack-notifications)
- Специализированные ресурсы
- Проверить: интеграции

### [ ] E05. .github/workflows
- CI/CD пайплайны
- Проверить: секреты, jobs, безопасность

---

## Part F: Root & Documentation (3 блока)

### [ ] F01. Root config files
- package.json, tsconfig, eslint, jest, babel
- Проверить: версии, настройки

### [ ] F02. docs/
- Документация проекта
- Проверить: актуальность, полнота

### [ ] F03. README, BACKLOG, scripts/
- Точка входа для контрибьюторов
- Проверить: инструкции, onboarding

---

## Part G: Final Review (1 блок)

### [ ] G01. Cross-module review
- Консистентность между модулями
- Общие паттерны и проблемы
- Итоговые рекомендации

---

## Findings Directory Structure

```
docs/code-review/
├── A01-shared.md
├── A02-simplestore-core.md
├── ...
├── G01-final-review.md
└── SUMMARY.md
```

---

**Total: 37 review blocks**

Каждый блок можно выполнить за ~10-15 минут. 
При 4 агентах параллельно = ~2-3 часа на весь проект.
