# Code Review: A05 - packages/audio-api

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟠 NEEDS IMPROVEMENTS

---

## Summary

Audio API — простой сервис для TTS с кэшированием в S3. Код чистый, но есть проблемы с дублированием, hardcoded URLs и dead code.

**Критичность:** 🔴 High (2) | 🟠 Medium (4) | 🟡 Low (3)

---

## 🔴 CRITICAL Issues

### [ ] CRIT-01: Hardcoded S3 URL format

**Файл:** `handler.ts`

```typescript
return createSuccessResponse({
  status: 'ready',
  url: `https://${bucketName}.s3.amazonaws.com/${key}`,  // ← HARDCODED!
  hash
});
```

**Проблема:**
1. Не работает для других регионов (формат URL отличается)
2. Не работает с CloudFront CDN
3. Не работает с custom domains

**Решение:** Использовать `getSignedUrl()` или читать base URL из env.

---

### [ ] CRIT-02: `getConfig()` — dead code!

**Файл:** `config.ts`

```typescript
export function getConfig(): Config {
  const env = process.env.ENV;
  // ...
  return {
    bucketName: `hak-audio-${env}`,
    queueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/hak-audio-generation-${env}`,
  };
}
```

**Файл:** `handler.ts`

```typescript
function getRequiredEnvVars(): { bucketName: string; queueUrl: string } {
  const bucketName = process.env.BUCKET_NAME ?? '';
  const queueUrl = process.env.QUEUE_URL ?? '';
  // ...
}
```

Две разные функции для получения конфига! `getConfig()` нигде не используется.  
Либо удалить, либо унифицировать.

---

## 🟠 MEDIUM Issues

### [ ] MED-01: Дублирование CORS headers

**Файл:** `index.ts`

```typescript
// lambdaHandler:
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
},

// healthHandler:
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
},

// warmHandler:
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
},
```

Три раза одно и то же (с вариациями). Вынести в `createCorsResponse()`.

---

### [ ] MED-02: `hash.ts` — зачем отдельный файл?

**Файл:** `hash.ts`

```typescript
export { calculateHashSync as calculateHash } from '@hak/shared';
```

Одна строка. Зачем?  
Если для переименования `Sync` → без суффикса — сделай это в `@hak/shared` или в месте использования.

---

### [ ] MED-03: Нет retry logic для SQS

**Файл:** `sqs.ts`

```typescript
export async function publishToQueue(/*...*/): Promise<void> {
  const command = new SendMessageCommand({/*...*/});
  await sqsClient.send(command);  // ← Один раз и всё
}
```

SQS может временно отказать (throttling). Нет retry, нет exponential backoff.

---

### [ ] MED-04: `as S3Error` — unsafe cast

**Файл:** `s3.ts`

```typescript
} catch (error: unknown) {
  const s3Error = error as S3Error;  // ← Предполагаем структуру
  const statusCode = s3Error.$metadata?.httpStatusCode;
  // ...
}
```

Если AWS SDK изменит формат ошибки, код сломается молча.  
Лучше проверять instanceof или структуру явно.

---

## 🟡 LOW Issues

### [ ] LOW-01: `MAX_TEXT_LENGTH` — локальная переменная

**Файл:** `handler.ts`

```typescript
const MAX_TEXT_LENGTH = TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH;
```

Зачем локальный alias? Используй `TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH` напрямую.

---

### [ ] LOW-02: Нет input sanitization для hash

**Файл:** `handler.ts`

```typescript
const hash = calculateHash(text);
const key = `cache/${hash}.mp3`;
```

Hash от user input напрямую идёт в S3 key.  
Хотя SHA-256 hex-safe, стоит добавить явную валидацию формата hash.

---

### [ ] LOW-03: `warmHandler` дублирует error handling

**Файл:** `index.ts`

```typescript
export async function warmHandler(): Promise</*...*/> {
  // ...
  } catch (error) {
    return {
      statusCode: 500,
      headers: { /* CORS headers */ },
      body: JSON.stringify({ error: error instanceof Error ? error.message : '...' }),
    };
  }
}
```

Тот же pattern, что в `lambdaHandler`. Централизовать error handling.

---

## Positive Notes 👍

1. **DI для S3/SQS clients** — легко мокать в тестах
2. **Чистая валидация** — `validateText()` возвращает discriminated union
3. **Типизированные интерфейсы** — `S3ClientLike`, `SQSClientLike`

---

## Action Items

1. **Срочно:** Убрать hardcoded S3 URL, использовать CloudFront или env
2. **Срочно:** Удалить или использовать `getConfig()`
3. Централизовать CORS headers
4. Добавить retry logic для SQS
5. Удалить файл `hash.ts` — одна строка не стоит отдельного файла

---

**Verdict:** 🟠 Чистый код с dead code и hardcoded values.
