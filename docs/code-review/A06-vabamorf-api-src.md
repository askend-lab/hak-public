# Code Review: A06 - packages/vabamorf-api/src

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟠 NEEDS IMPROVEMENTS

---

## Summary

Vabamorf API — интеграция с эстонским морфологическим анализатором через child process. Архитектура рабочая, но есть серьёзные проблемы с глобальным состоянием и race conditions.

**Критичность:** 🔴 High (3) | 🟠 Medium (3) | 🟡 Low (2)

---

## 🔴 CRITICAL Issues

### [ ] CRIT-01: Глобальный singleton с race condition

**Файл:** `vmetajson.ts`

```typescript
let process: ChildProcess | null = null;
let pendingResolve: ((value: VmetajsonResponse) => void) | null = null;
let pendingReject: ((reason: Error) => void) | null = null;
let buffer = '';
```

**Проблема:** Только ОДИН pending request за раз!  
Если два запроса придут одновременно, второй перезапишет `pendingResolve` первого.

**Сценарий:**
1. Request A приходит, `pendingResolve = resolveA`
2. Request B приходит, `pendingResolve = resolveB` (resolveA потерян!)
3. vmetajson отвечает на A
4. `resolveB(responseForA)` — неправильный ответ!
5. Request A зависает навсегда

**Решение:** Очередь запросов или Map<requestId, resolver>.

---

### [ ] CRIT-02: `process` как имя переменной

**Файл:** `vmetajson.ts`

```typescript
let process: ChildProcess | null = null;
```

**Проблема:** `process` — глобальный объект Node.js!  
Эта переменная SHADOWING глобальный `process`. Если где-то в файле нужен `process.env`, получишь `undefined` или ошибку.

**Решение:** Переименовать в `vmetajsonProcess` или `childProcess`.

---

### [ ] CRIT-03: Нет CORS headers

**Файл:** `validation.ts`

```typescript
export function createResponse(statusCode: number, body: object): LambdaResponse {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }  // ← Где CORS?
  };
}
```

В отличие от других API, здесь нет `Access-Control-Allow-Origin`.  
Frontend не сможет вызвать этот API напрямую.

---

## 🟠 MEDIUM Issues

### [ ] MED-01: Magic number 10000 не из shared

**Файл:** `handler.ts`

```typescript
const MAX_TEXT_LENGTH = 10000;
```

**Файл:** `@hak/shared/constants.ts`

```typescript
MAX_MORPHOLOGY_TEXT_LENGTH: 10000,
```

Есть константа в shared, но не используется! Дублирование.

---

### [ ] MED-02: `ensureInitialized()` вызывается на каждый request

**Файл:** `handler.ts`

```typescript
function parseAndValidate<T>(event: APIGatewayProxyEvent, fieldName: string, maxLength?: number): ParseResult<T> {
  ensureInitialized();  // ← Каждый раз!
  // ...
}
```

Это не проблема сама по себе (idempotent), но создаёт overhead. Lambda warm start уже должен был инициализировать.

Лучше: инициализировать в top-level scope модуля.

---

### [ ] MED-03: Hardcoded timeout 5000ms

**Файл:** `vmetajson.ts`

```typescript
const timeout = setTimeout(() => {
  // ...
  reject(new Error('vmetajson timeout'));
}, 5000);  // ← Magic number
```

Нет конфигурации таймаута. Для длинных текстов 5 секунд может быть мало.

---

## 🟡 LOW Issues

### [ ] LOW-01: Версия hardcoded

**Файл:** `handler.ts`

```typescript
export function healthHandler(): APIGatewayProxyResult {
  return createResponse(HTTP_STATUS.OK, {
    status: 'ok',
    version: '1.0.0'  // ← Hardcoded!
  });
}
```

Читать из package.json или env.

---

### [ ] LOW-02: stderr игнорируется

**Файл:** `vmetajson.ts`

```typescript
process = spawn(binaryPath, [`--path=${dictPath}`], {
  stdio: ['pipe', 'pipe', 'ignore']  // ← stderr: 'ignore'
});
```

Ошибки vmetajson binary потеряны. Хотя бы логировать.

---

## Positive Notes 👍

1. **Чистый парсинг** — `parser.ts` и `parser-helpers.ts` хорошо разделены
2. **Типизация** — все интерфейсы в `types.ts`
3. **Валидация** — discriminated unions для результатов

---

## Action Items

1. **Срочно:** Исправить race condition в vmetajson (очередь запросов)
2. **Срочно:** Переименовать `process` переменную
3. **Срочно:** Добавить CORS headers
4. Использовать `TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH` из shared
5. Сделать timeout конфигурируемым
6. Логировать stderr

---

**Verdict:** 🟠 Работает, но race condition — бомба замедленного действия.
