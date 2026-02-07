# Code Review: A02 - packages/simplestore/src/core

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟠 NEEDS IMPROVEMENTS

---

## Summary

Ядро `simplestore` — неплохая попытка чистой архитектуры с DI, но есть проблемы с дублированием, неочевидными контрактами и пропущенной функциональностью.

**Критичность:** 🔴 High (2) | 🟠 Medium (7) | 🟡 Low (4)

---

## 🔴 CRITICAL Issues

### [ ] CRIT-01: Дублирование DEFAULT_CONFIG

**Файлы:** `store.ts` и `validation.ts`

```typescript
// store.ts:14-17
const DEFAULT_CONFIG: StoreConfig = {
  maxTtlSeconds: 31536000,
  keyDelimiter: '#'
};

// validation.ts:17-20
const DEFAULT_CONFIG: StoreConfig = {
  maxTtlSeconds: 31536000, // 1 year
  keyDelimiter: '#'
};
```

**Проблема:** Один и тот же конфиг в двух местах. При изменении забудут обновить второй.  
**Решение:** Вынести в `constants.ts` или экспортировать из одного места.

---

### [ ] CRIT-02: `save()` не проверяет права на update

**Файл:** `store.ts`

```typescript
async save(request: StoreRequest): Promise<StoreResult> {
  const ttlResult = parseTtl(request.ttl, this.config);
  // ...
  await this.adapter.put(item);  // ← Просто перезаписывает!
  return this.success(item);
}
```

**Проблема:** Любой может перезаписать чужой item в `public` типе!  
Для `private` — защита через PK (включает userId), но для `public`/`unlisted` владелец теряет контроль.

**Ожидаемое поведение:** Перед update проверить `isOwner()`, как в `delete()`.

---

## 🟠 MEDIUM Issues

### [ ] MED-01: buildKeys экспортируется как функция, а не метод

**Файл:** `store.ts`

```typescript
// Re-export key building functions for external use
export { buildPartitionKey, buildSortKey, buildKeys };
```

Но эти функции определены как `function`, а не методы класса Store.  
При этом они используют `delimiter` как параметр, а не из `this.config`.

**Проблема:** Дублирование — Store и внешний код могут использовать разные delimiters.

---

### [ ] MED-02: `createItem` всегда ставит текущую дату для createdAt

**Файл:** `store.ts`

```typescript
private createItem(request: StoreRequest): StoreItem {
  const now = new Date().toISOString();
  return {
    // ...
    createdAt: now,  // ← Всегда новая дата!
    updatedAt: now,
    // ...
  };
}
```

**Проблема:** При update `createdAt` должен сохраняться от оригинала.  
Сейчас каждый `save()` перезаписывает `createdAt`.

---

### [ ] MED-03: StoreResult имеет `item` И `items` одновременно

**Файл:** `types.ts`

```typescript
export interface StoreResult {
  readonly success: boolean;
  readonly item?: StoreItem;
  readonly items?: StoreItem[];
  readonly error?: string;
}
```

**Проблема:** Неясно, когда какое поле заполнено. Лучше discriminated union:

```typescript
type StoreResult = 
  | { success: true; item: StoreItem }
  | { success: true; items: StoreItem[] }
  | { success: false; error: string };
```

---

### [ ] MED-04: `String(error)` теряет stack trace

**Файл:** `store.ts`

```typescript
} catch (error) {
  return this.failure(String(error));  // ← Плохо!
}
```

**Проблема:** `String(error)` на объекте Error даёт `"[object Error]"` или только message без stack.  
Для отладки это катастрофа.

**Решение:**
```typescript
const message = error instanceof Error ? error.message : String(error);
// + логировать полный error отдельно
```

---

### [ ] MED-05: Нет pagination в query()

**Файл:** `store.ts`

```typescript
async query(entityPkPrefix: string, type: DataType): Promise<StoreResult> {
  const items = await this.adapter.queryBySortKeyPrefix(pk, entityPkPrefix);
  return this.successItems(items);  // ← Все items сразу?!
}
```

**Проблема:** DynamoDB может вернуть тысячи записей. Нет limit/cursor.  
Это потенциальный OOM и timeout.

---

### [ ] MED-06: validateRequiredString не проверяет injection

**Файл:** `validation.ts`

```typescript
function validateRequiredString(value: unknown, name: string, errors: string[]): void {
  if (typeof value !== 'string') { /* ... */ }
  else if (value.trim() === '') { /* ... */ }
  // ← Нет проверки на спецсимволы!
}
```

**Проблема:** `pk` и `sk` напрямую идут в ключи DynamoDB.  
Символ `#` (delimiter) в pk/sk сломает логику `buildKeys`.

**Пример атаки:**
```
pk: "hack#admin"  → может пересечься с другим partition
```

---

### [ ] MED-07: VALID_TYPES дублируется с DataType

**Файл:** `validation.ts`

```typescript
const VALID_TYPES: readonly DataType[] = ['private', 'unlisted', 'public', 'shared'] as const;
```

**Файл:** `types.ts`

```typescript
export type DataType = 'private' | 'unlisted' | 'public' | 'shared';
```

**Проблема:** Если добавить новый тип в DataType, забудут обновить VALID_TYPES.  
Нужно генерировать одно из другого.

---

## 🟡 LOW Issues

### [ ] LOW-01: Magic number 31536000

**Файлы:** `store.ts`, `validation.ts`

```typescript
maxTtlSeconds: 31536000,  // 1 year (только в одном файле комментарий!)
```

Вынести в именованную константу: `const ONE_YEAR_SECONDS = 31536000`.

---

### [ ] LOW-02: Inconsistent naming — PK vs pk

**Файлы:** `types.ts`, `store.ts`

```typescript
// StoreRequest:
readonly pk: string;
readonly sk: string;

// StoreItem:
readonly PK: string;
readonly SK: string;
```

`pk`/`sk` в request, `PK`/`SK` в item. Это DynamoDB convention, но сбивает с толку.  
Добавить комментарий, объясняющий разницу.

---

### [ ] LOW-03: `parseTtl` возвращает `value`, но `save()` игнорирует его

**Файл:** `store.ts`

```typescript
const ttlResult = parseTtl(request.ttl, this.config);
if (!ttlResult.valid) {
  return this.failure(ttlResult.error);
}
// ttlResult.value НЕ используется!
// Вместо этого:
ttl: this.calculateTtl(request.ttl)
```

Зачем `parseTtl` возвращает `value`, если он не используется?

---

### [ ] LOW-04: Нет JSDoc для публичных методов Store

**Файл:** `store.ts`

Есть краткие комментарии `/** Creates or updates... */`, но нет:
- `@param` описаний
- `@returns` описаний
- `@throws` (хотя ничего не бросается — всё в Result)

Для open source нужна полная документация API.

---

## Action Items

1. **Срочно:** Добавить проверку ownership в `save()` для update
2. **Срочно:** Вынести DEFAULT_CONFIG в одно место
3. Добавить валидацию спецсимволов в pk/sk
4. Сохранять `createdAt` при update
5. Рассмотреть discriminated union для StoreResult
6. Добавить pagination в query
7. Улучшить error handling (сохранять stack)

---

**Verdict:** 🟠 Архитектура неплохая, но есть дыры в безопасности и консистентности.
