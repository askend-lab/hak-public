# Code Review: A03 - packages/simplestore/src/adapters + lambda

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟠 NEEDS IMPROVEMENTS

---

## Summary

Adapters — чистая реализация паттерна. Lambda handler — тонкий, как и должен быть. Но есть проблемы с глобальным состоянием, отсутствием pagination и security holes.

**Критичность:** 🔴 High (3) | 🟠 Medium (5) | 🟡 Low (4)

---

## 🔴 CRITICAL Issues

### [ ] CRIT-01: Глобальный mutable state в Lambda

**Файл:** `handler.ts`

```typescript
/** Shared adapter instance for persistence across calls */
let sharedAdapter: StorageAdapter | null = null;

/** Set adapter (for testing or custom adapters) */
export function setAdapter(adapter: StorageAdapter | null): void {
  sharedAdapter = adapter;
}
```

**Проблема:** Глобальная переменная + публичный setter = race conditions в тестах.  
Если два теста параллельно вызовут `setAdapter()`, они перезапишут друг друга.

**Решение:** Использовать dependency injection через параметры или factory function.

---

### [ ] CRIT-02: `'anonymous'` userId — потенциальная коллизия

**Файл:** `handler.ts`

```typescript
// For anonymous shared access, use 'anonymous' as userId
const effectiveUserId = userId || 'anonymous';
```

**Проблема:** Что если реальный пользователь Cognito имеет ID `'anonymous'`?  
Все его данные станут доступны анонимным пользователям!

**Решение:** Использовать невозможный UUID формат: `'__anonymous__'` или `'00000000-0000-0000-0000-000000000000'`.

---

### [ ] CRIT-03: DynamoDB query без pagination

**Файл:** `dynamodb.ts`

```typescript
async queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]> {
  const result = await this.docClient.send(new QueryCommand({
    // ...
  }));
  return (result.Items ?? []) as StoreItem[];  // ← Только первая страница!
}
```

**Проблема:** DynamoDB Query возвращает max 1MB данных. Если больше — нужен `LastEvaluatedKey` для pagination.  
Текущий код молча теряет данные!

**Решение:**
```typescript
async queryBySortKeyPrefix(pk: string, skPrefix: string, limit?: number): Promise<StoreItem[]> {
  const items: StoreItem[] = [];
  let lastKey: Record<string, unknown> | undefined;
  
  do {
    const result = await this.docClient.send(new QueryCommand({
      // ...
      ExclusiveStartKey: lastKey,
      Limit: limit
    }));
    items.push(...(result.Items as StoreItem[] ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey && (!limit || items.length < limit));
  
  return items;
}
```

---

## 🟠 MEDIUM Issues

### [ ] MED-01: InMemoryAdapter использует hardcoded delimiter

**Файл:** `memory.ts`

```typescript
private buildKey(pk: string, sk: string): string {
  return `${pk}#${sk}`;  // ← Hardcoded '#'!
}
```

**Проблема:** `Store` использует configurable `keyDelimiter`, но InMemoryAdapter захардкодил `#`.  
Если конфиг изменится, тесты не отловят проблему.

---

### [ ] MED-02: `as` casts вместо type guards

**Файлы:** `routes.ts`, `dynamodb.ts`

```typescript
// routes.ts
const request: StoreRequest = {
  pk: body.pk as string,
  sk: body.sk as string,
  type: body.type as DataType,
  // ...
};

// dynamodb.ts
return (result.Item as StoreItem) ?? null;
```

**Проблема:** `as` — небезопасный cast. Runtime может отличаться от ожиданий.  
После валидации лучше использовать явное преобразование или type guards.

---

### [ ] MED-03: CORS `'*'` в production

**Файл:** `routes.ts`

```typescript
headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
```

**Проблема:** `*` разрешает запросы с любого домена. Для production нужен whitelist.

**Решение:** Читать разрешённые origins из env и проверять `Origin` header.

---

### [ ] MED-04: Проглатывание ошибок в catch

**Файл:** `handler.ts`

```typescript
} catch {
  return createResponse(HTTP_STATUS.INTERNAL_ERROR, { error: HTTP_ERRORS.INTERNAL });
}
```

**Проблема:** Ошибка не логируется! В production невозможно будет понять, что случилось.

**Решение:**
```typescript
} catch (error) {
  console.error('Handler error:', error);
  return createResponse(HTTP_STATUS.INTERNAL_ERROR, { error: HTTP_ERRORS.INTERNAL });
}
```

---

### [ ] MED-05: Дублирование PUBLIC_READABLE_TYPES

**Файл:** `routes.ts` и `handler.ts`

```typescript
// routes.ts:142
const PUBLIC_READABLE_TYPES = ['unlisted', 'public', 'shared'];

// handler.ts:108
return type === 'shared' || type === 'unlisted' || type === 'public';
```

Одна и та же логика в двух местах. Вынести в общую константу/функцию.

---

## 🟡 LOW Issues

### [ ] LOW-01: `handleDebugError` — security risk

**Файл:** `routes.ts`

```typescript
export async function handleDebugError(): Promise<APIGatewayProxyResult> {
  console.error('[DEBUG] Intentional 500 error triggered for monitoring test');
  return createResponse(HTTP_STATUS.INTERNAL_ERROR, { /* ... */ });
}
```

Debug endpoint без авторизации в production? Это можно использовать для DoS или для спама CloudWatch алармов.

---

### [ ] LOW-02: Inconsistent parameter naming

**Файл:** `routes.ts`

```typescript
// handleQuery
const { prefix, type } = event.queryStringParameters ?? {};

// handleGet
const { pk, sk, type } = event.queryStringParameters ?? {};
```

В query используется `prefix`, в get — `pk`. Но семантически это одно и то же (entity key).  
Может сбивать с толку.

---

### [ ] LOW-03: `getEnv` возвращает default без warning

**Файл:** `handler.ts`

```typescript
function getEnv(name: string, defaultValue: string): string {
  const value = process.env[name];
  return (value && value.trim() !== '') ? value : defaultValue;
}
```

В production если `APP_NAME` не задан, тихо используется `'default'`.  
Хотя бы логировать warning при fallback.

---

### [ ] LOW-04: Нет rate limiting

Lambda + API Gateway могут иметь throttling на уровне AWS, но в коде нет никакой защиты от abuse.  
Для open source стоит задокументировать рекомендации по rate limiting.

---

## Action Items

1. **Срочно:** Добавить pagination в DynamoDB query
2. **Срочно:** Заменить `'anonymous'` на безопасный ID
3. **Срочно:** Логировать ошибки в catch блоках
4. Рефакторить global state в handler
5. Вынести PUBLIC_READABLE_TYPES в общее место
6. Настроить CORS для production

---

**Verdict:** 🟠 Паттерны правильные, но есть дыры в production-readiness.
