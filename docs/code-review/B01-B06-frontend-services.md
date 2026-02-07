# Code Review: B01-B06 - Frontend Services

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟠 NEEDS IMPROVEMENTS

---

## B01: frontend/src/services/auth

**Status:** 🔴 SECURITY CONCERNS

### [ ] CRIT-01: Hardcoded Cognito credentials

**Файл:** `config.ts`

```typescript
export const cognitoConfig = {
  region: 'eu-west-1',
  userPoolId: 'eu-west-1_wlRtuLkG2',  // ← PUBLIC ID IN CODE!
  clientId: '64tf6nf61n6sgftqif6q975hka',  // ← PUBLIC CLIENT ID!
  domain: 'askend-lab-auth.auth.eu-west-1.amazoncognito.com',
  // ...
};
```

**Для open source это КАТАСТРОФА!**  
Любой может использовать ваш Cognito User Pool.

**Решение:** Читать из env variables или `.env` файла (с `.env.example` для контрибьюторов).

### [ ] CRIT-02: Дублирование token exchange logic

**Файлы:** `config.ts` и `context.tsx`

```typescript
// config.ts:exchangeCodeForTokens
const response = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {/*...*/});

// context.tsx:handleCodeCallback
const response = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {/*...*/});
```

Один и тот же код в двух местах! `exchangeCodeForTokens` даже не используется.

### [ ] MED-01: JWT parsing без валидации

```typescript
function parseIdToken(idToken: string): User | null {
  const payload = JSON.parse(atob(parts[1]));  // ← Нет signature verification!
  return { id: payload.sub, email: payload.email, /*...*/ };
}
```

Парсим JWT без проверки подписи. Клиент может подделать payload.

### [ ] MED-02: Hardcoded localhost ports

```typescript
return 'http://localhost:5181/auth/callback';  // ← Magic port
return 'http://localhost:4001';  // ← Another magic port
```

---

## B02: frontend/src/services/repository

**Status:** 🟠 COMPLEXITY WARNING

### [ ] MED-01: TaskRepository — 300 lines, слишком много responsibility

Один класс делает:
- CRUD операций
- Merge baseline + user tasks
- Baseline additions
- Share tokens
- Entry management

Нарушение SRP. Разбить на несколько repositories.

### [ ] MED-02: Magic ID generation

```typescript
id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
```

`Math.random()` не криптографически безопасен. Использовать `crypto.randomUUID()`.

### [ ] MED-03: Mutation через `forEach`

```typescript
newTask.entries.forEach(entry => {
  entry.taskId = newTask.id;  // ← Мутация после создания
});
```

Создавай объекты сразу правильно, не мутируй после.

### [ ] LOW-01: `|| []` vs `?? []`

```typescript
entries: task.entries || [],
entryCount: task.entries?.length || 0,
```

Inconsistent — где-то `||`, где-то `??`. Для массивов `|| []` ок, но будьте консистентны.

---

## B03-B06: Остальные сервисы (storage, merlin, vabamorf, specs)

**Status:** 🟡 ACCEPTABLE (паттерны аналогичные B01-B02)

### Общие проблемы:

- [ ] **MED:** Нет централизованного error handling
- [ ] **MED:** Нет retry logic для network requests
- [ ] **LOW:** Inconsistent naming (camelCase vs PascalCase для файлов)
- [ ] **LOW:** Нет JSDoc для публичных методов

---

## Summary

| Module | Status | Critical | Medium | Low |
|--------|--------|----------|--------|-----|
| B01 auth | 🔴 | 2 | 2 | 0 |
| B02 repository | 🟠 | 0 | 3 | 1 |
| B03-B06 others | 🟡 | 0 | 2 | 2 |

---

## Action Items

1. **КРИТИЧНО:** Вынести Cognito config в env variables
2. **КРИТИЧНО:** Удалить дублирование token exchange
3. Разбить TaskRepository на меньшие классы
4. Использовать `crypto.randomUUID()` для ID
5. Добавить retry logic для API calls
6. Добавить JWT signature verification (или доверять только серверу)

---

**Verdict:** 🟠 Auth модуль требует срочного внимания перед open source!
