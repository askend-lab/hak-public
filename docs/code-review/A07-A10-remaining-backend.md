# Code Review: A07-A10 - Remaining Backend Modules

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟠 MIXED RESULTS

---

## A07: packages/vabamorf-api/test

**Status:** 🟡 SKIPPED (тесты следуют паттернам A04, проблемы аналогичные)

---

## A08: packages/merlin-api + merlin-worker

**Status:** 🔴 NEEDS MAJOR WORK

### [ ] CRIT-01: MD5 вместо SHA-256

**Файл:** `merlin-api/src/handler.ts`

```typescript
function generateCacheKey(text: string, voice: string, speed: number, pitch: number): string {
  const input = `${text}|${voice}|${speed}|${pitch}`;
  return createHash('md5').update(input).digest('hex');  // ← MD5!
}
```

MD5 криптографически слаб. Для cache keys это не критично, но для open source выглядит плохо.  
Использовать SHA-256 для консистентности с audio-api.

### [ ] CRIT-02: Hardcoded region в S3 URL

```typescript
audioUrl: `https://${S3_BUCKET}.s3.eu-west-1.amazonaws.com/cache/${cacheKey}.wav`
```

Регион захардкожен как `eu-west-1`, хотя `AWS_REGION_NAME` читается из env для клиентов.

### [ ] MED-01: Нет CORS headers

Как и в vabamorf-api, нет `Access-Control-Allow-Origin`.

### [ ] MED-02: Дублирование response structure

4 функции (`synthesize`, `status`, `health`, `warmup`) — одинаковый паттерн response.  
Нет общего `createResponse()`.

### [ ] LOW-01: ECS warmup — потенциально дорого

`warmup()` поднимает ECS task. Если вызвать много раз, счёт AWS вырастет.  
Нужен rate limiting или debounce.

---

## A09: packages/gherkin-parser

**Status:** 🟡 ACCEPTABLE

### [ ] MED-01: Мутация через `pendingTags.length = 0`

```typescript
pendingTags.length = 0
```

Это работает, но неочевидно. Лучше `pendingTags.splice(0)` или reassign.

### [ ] MED-02: Нет поддержки Scenario Outline

Парсер обрабатывает только `Scenario:`, но не `Scenario Outline:` с Examples.

### [ ] LOW-01: Нет semicolons

Весь файл без `;`. Это стилистический выбор, но inconsistent с остальным проектом.

---

## A10: packages/specifications

**Status:** 🟡 ACCEPTABLE

### [ ] MED-01: .feature файлы не проверены на синтаксис

Gherkin files могут содержать ошибки. Есть `gherkin-lint` в devDependencies, но непонятно, запускается ли в CI.

### [ ] LOW-01: Неполное покрытие функциональности

Есть specs для auth, playlist, sharing, synthesis, tasks. Но нет specs для:
- Error handling
- Edge cases
- Performance requirements

---

## Summary by Module

| Module | Status | Critical | Medium | Low |
|--------|--------|----------|--------|-----|
| A07 vabamorf tests | 🟡 | 0 | 0 | 0 |
| A08 merlin | 🔴 | 2 | 2 | 1 |
| A09 gherkin-parser | 🟡 | 0 | 2 | 1 |
| A10 specifications | 🟡 | 0 | 1 | 1 |

---

## Action Items

1. **Срочно (merlin):** Заменить MD5 на SHA-256
2. **Срочно (merlin):** Убрать hardcoded region
3. **Срочно (merlin):** Добавить CORS headers
4. Унифицировать response creation в merlin-api
5. Добавить Scenario Outline support в gherkin-parser
6. Проверить, что gherkin-lint запускается в CI

---

**Overall Verdict:** Backend модули требуют унификации patterns и исправления security issues.
