# Code Review: A04 - packages/simplestore/test

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟡 ACCEPTABLE WITH NOTES

---

## Summary

Тесты simplestore — одни из лучших в проекте. Хорошая структура, boundary tests, error handling. Но есть проблемы с test isolation и некоторые "ленивые" assertions.

**Критичность:** 🔴 High (1) | 🟠 Medium (4) | 🟡 Low (5)

---

## 🔴 CRITICAL Issues

### [ ] CRIT-01: Глобальные side effects в setup.ts

**Файл:** `setup.ts`

```typescript
// Set test environment variables
process.env.APP_NAME = 'test-app';
process.env.TENANT = 'test-tenant';
process.env.ENVIRONMENT = 'test';
process.env.TABLE_NAME = 'test-table';
process.env.IS_OFFLINE = 'true';
```

**Проблема:** Эти переменные устанавливаются при импорте файла и НИКОГДА не сбрасываются!  
Если тест изменит `process.env.APP_NAME`, это повлияет на все последующие тесты.

**Решение:** Использовать `beforeEach`/`afterEach` для сохранения и восстановления env:
```typescript
let originalEnv: NodeJS.ProcessEnv;
beforeEach(() => { originalEnv = { ...process.env }; });
afterEach(() => { process.env = originalEnv; });
```

---

## 🟠 MEDIUM Issues

### [ ] MED-01: Ленивые assertions с массивами статусов

**Файл:** `handler.test.ts`

```typescript
it('should handle valid delete params', async () => {
  const event = createDeleteEvent('/delete', { pk: 'test', sk: 'sort', type: 'public' });
  const result = await handler(event);
  expect([200, 403, 404]).toContain(result.statusCode);  // ← WTF?!
});

it('should return 200 with valid params', async () => {
  const event = createGetEvent('/query', { prefix: 'test-', type: 'public' });
  const result = await handler(event);
  expect([200, 500]).toContain(result.statusCode);  // ← ЭТО НЕ ТЕСТ!
});
```

**Проблема:** "Любой из этих статусов ОК" — это не assertion, это признание "я не знаю, что должно происходить".

Тесты должны быть детерминированными. Если результат зависит от state — настрой state правильно.

---

### [ ] MED-02: Нет теста на update (save existing item)

**Файл:** `store.test.ts`

Есть тесты на `save` нового item, но нет теста:
- Что происходит при save уже существующего item?
- Сохраняется ли `createdAt`? (спойлер: нет, см. A02-CRIT)
- Проверяется ли ownership при update?

---

### [ ] MED-03: InMemoryDynamoDB vs InMemoryAdapter

**Файлы:** `mockDynamoDB.ts`, `../src/adapters/memory.ts`

В тестах используется `InMemoryDynamoDB` из `mockDynamoDB.ts`, но в production адаптерах есть `InMemoryAdapter`.

Это два разных класса с одинаковой целью! Риск рассинхронизации поведения.

---

### [ ] MED-04: Нет тестов на concurrent access

Нет тестов на race conditions:
- Два параллельных save на один ключ
- Delete во время read
- Query во время batch write

Для serverless это критично — Lambda instances работают параллельно.

---

## 🟡 LOW Issues

### [ ] LOW-01: Копипаста в тестах events

**Файл:** `handler.test.ts`

```typescript
it('should return 400 for missing query params', async () => {
  const event = createGetEvent('/get', {});
  // ...
});

it('should return 400 for null queryStringParameters', async () => {
  const event = createGetEvent('/get', null);
  // ...
});
```

Эти два теста проверяют одно и то же поведение. `{}` и `null` для handler практически идентичны.

---

### [ ] LOW-02: Неинформативные имена тестов

**Файл:** `handler.test.ts`

```typescript
describe('save endpoint validation', () => {
  it('should return 400 for validation errors', async () => { /* ... */ });
  it('should process valid save request', async () => { /* ... */ });
});
```

"should process valid save request" — что именно проверяется? Что возвращает 200? Что сохраняет данные?

Лучше: "should return 200 and saved item for valid request"

---

### [ ] LOW-03: Magic values в тестах

**Файл:** `store.test.ts`

```typescript
const result = await store.save({
  pk: 'entity1',
  sk: 'sort1',
  type: 'private',
  ttl: 3600,  // ← Почему 3600? Это важно?
  data: { name: 'test' }
});
```

Вынести в константы или объяснить комментарием:
```typescript
const ONE_HOUR = 3600;
```

---

### [ ] LOW-04: Нет тестов Estonian characters

**Файл:** `boundary.test.ts`

Есть тесты на `#` в ключах, но нет тестов на:
- Эстонские символы: `õ`, `ä`, `ö`, `ü`
- Emoji в data
- Очень длинные строки

Для языковой платформы это важно.

---

### [ ] LOW-05: FailingDynamoDB — inline class

**Файл:** `store.test.ts`

```typescript
class FailingDynamoDB implements StorageAdapter {
  put(): Promise<void> { throw new Error('DB error'); }
  // ...
}
```

Этот mock полезен, но определён inline в тесте. Вынести в `mockDynamoDB.ts` рядом с `InMemoryDynamoDB`.

---

## Positive Notes 👍

Несмотря на критику, тесты хорошие:

1. **Boundary tests** — отдельный файл для edge cases
2. **Error handling tests** — проверяют failing adapter
3. **Data type isolation** — проверяют, что private != public
4. **Validation coverage** — все validation rules покрыты
5. **Clean structure** — describe/it организация понятная

---

## Action Items

1. **Срочно:** Исправить глобальные env в setup.ts
2. Заменить "любой из статусов" на конкретные assertions
3. Добавить тесты на update existing item
4. Унифицировать InMemoryDynamoDB и InMemoryAdapter
5. Добавить тесты на Unicode/Estonian characters

---

**Verdict:** 🟡 Тесты лучше среднего по проекту, но есть room for improvement.
