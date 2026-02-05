# Code Review: A01 - packages/shared

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🔴 NEEDS WORK

---

## Summary

Модуль `@hak/shared` претендует быть "общими утилитами", но выглядит как наспех собранный набор функций с сомнительными решениями.

**Критичность:** 🔴 High (3) | 🟠 Medium (8) | 🟡 Low (6)

---

## 🔴 CRITICAL Issues

### [ ] CRIT-01: `require()` в ESM модуле

**Файл:** `hash.ts`  
**Проблема:** Используется `require()` в модуле с `"type": "module"`

```typescript
export function calculateHashSync(text: string): string {
  // ...
  const crypto = require('node:crypto');  // ← WTF?!
  return crypto.createHash('sha256').update(text).digest('hex');
}
```

Это **НЕ РАБОТАЕТ** в чистом ESM окружении! `require` не определён в ESM.
Либо используй динамический `import()`, либо убери эту функцию.

---

### [ ] CRIT-02: Нет валидации `LogLevel` из env

**Файл:** `logger.ts`

```typescript
const getLogLevel = (): LogLevel => {
  // ...
  return process.env.LOG_LEVEL as LogLevel;  // ← UNSAFE CAST!
  // ...
};
```

Если кто-то поставит `LOG_LEVEL=banana`, код молча примет это как валидный уровень. Нужна валидация:

```typescript
const validLevels = ['debug', 'info', 'warn', 'error'];
if (!validLevels.includes(level)) return 'info';
```

---

### [ ] CRIT-03: `window` declare без проверки

**Файл:** `hash.ts`

```typescript
declare const window: { crypto?: { subtle?: SubtleCryptoLike } } | undefined;
```

Это объявление ПЕРЕЗАПИСЫВАЕТ глобальный тип `window`. В браузере `window` имеет гораздо больше свойств. Это может сломать типы в других частях проекта.

Правильно: использовать `typeof globalThis.window` или проверять `typeof window !== 'undefined'` без переобъявления.

---

## 🟠 MEDIUM Issues

### [ ] MED-01: Дублирование логики валидации

**Файлы:** `hash.ts`

```typescript
// calculateHash:
if (!text || text.trim().length === 0) {
  throw new Error('Text cannot be empty');
}

// calculateHashSync:
if (!text || text.trim().length === 0) {
  throw new Error('Text cannot be empty');
}
```

Одна и та же проверка скопирована. Вынеси в приватную функцию `validateText()`.

---

### [ ] MED-02: `isEmpty` — инверсия `isNonEmpty`

**Файл:** `utils.ts`

```typescript
export function isEmpty(value: string | null | undefined): boolean {
  return !isNonEmpty(value);
}
```

Зачем две функции? Это увеличивает API surface без пользы.  
Либо одна функция, либо хотя бы объясни в комментарии, зачем нужны обе.

---

### [ ] MED-03: Тесты констант бесполезны

**Файл:** `constants.test.ts`

```typescript
it('should have MAX_AUDIO_TEXT_LENGTH', () => {
  expect(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBe(1000);
});
```

Это **не тест**. Это snapshot значения. Если кто-то изменит константу на 2000 (законно!), тест упадёт. Тесты должны проверять *поведение*, не *значения констант*.

Удали этот файл или напиши нормальные тесты (например, что значения положительные числа).

---

### [ ] MED-04: README не документирует все экспорты

**Файл:** `README.md`

Документированы только `calculateHash` и `calculateHashSync`.  
Где документация для:
- `createLogger`, `logger`
- `TEXT_LIMITS`, `TIMING`
- `sleep`, `isNonEmpty`, `isEmpty`

Open source проект должен иметь полную документацию API.

---

### [ ] MED-05: Нет типов для возвращаемого значения hash

**Файл:** `hash.ts`

```typescript
export async function calculateHash(text: string): Promise<string>
```

`string` — слишком общий тип. Лучше создать branded type:

```typescript
type Sha256Hash = string & { readonly __brand: 'sha256' };
```

Это предотвратит случайное использование обычных строк как хешей.

---

### [ ] MED-06: `sleep` не обрабатывает отрицательные значения

**Файл:** `utils.ts`

```typescript
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

Что будет при `sleep(-1000)`? `setTimeout` с отрицательным значением ведёт себя как `setTimeout(fn, 0)`.  
Это неочевидное поведение. Добавь валидацию или хотя бы документацию.

---

### [ ] MED-07: Logger не поддерживает structured logging

**Файл:** `logger.ts`

В 2026 году логгер должен поддерживать JSON output для production:

```typescript
// Сейчас:
[2026-02-05T16:00:00.000Z] [INFO] message

// Нужно:
{"timestamp":"2026-02-05T16:00:00.000Z","level":"info","message":"message"}
```

Для Lambda/CloudWatch structured logs критически важны.

---

### [ ] MED-08: Тест `index.test.ts` — smoke test, не unit test

**Файл:** `index.test.ts`

```typescript
it('should export calculateHash', () => {
  expect(typeof calculateHash).toBe('function');
});
```

Это не тестирует функциональность. Это проверяет, что экспорт существует. TypeScript уже это гарантирует на этапе компиляции.

Такие тесты создают иллюзию покрытия без реальной пользы.

---

## 🟡 LOW Issues

### [ ] LOW-01: Inconsistent naming

- `calculateHash` — глагол
- `isNonEmpty` — предикат
- `TEXT_LIMITS` — существительное

Это нормально для разных типов, но `isNonEmpty` выглядит странно.  
Почему не `hasContent` или `isNotBlank`? "NonEmpty" — двойное отрицание в голове.

---

### [ ] LOW-02: Magic numbers без объяснения

**Файл:** `constants.ts`

```typescript
MAX_AUDIO_TEXT_LENGTH: 1000,
MAX_MORPHOLOGY_TEXT_LENGTH: 10000,
```

Откуда эти числа? Почему 1000, а не 999 или 1024?  
Добавь комментарий с обоснованием или ссылкой на требования.

---

### [ ] LOW-03: Версии зависимостей — `^`

**Файл:** `package.json`

```json
"@types/jest": "^29.0.0",
"jest": "^29.0.0",
```

Для open source лучше использовать точные версии или хотя бы `~`.  
`^29.0.0` может подтянуть 29.99.99 с breaking changes.

---

### [ ] LOW-04: Нет CHANGELOG

Для open source нужен CHANGELOG.md с историей изменений.

---

### [ ] LOW-05: `jest.config.cjs` — почему `.cjs`?

Проект использует ESM (`"type": "module"`), но jest config в CommonJS.  
Это работает, но выглядит как костыль. Лучше `jest.config.ts` или объяснить почему.

---

### [ ] LOW-06: Нет проверки на Unicode в hash

**Файл:** `hash.ts`

```typescript
const encoder = new TextEncoder();
const data = encoder.encode(text);
```

Это корректно для UTF-8, но нет теста с Unicode символами (эмодзи, эстонские буквы õ, ü, ö, ä).

Добавь тест:
```typescript
it('handles Estonian characters', async () => {
  const hash = await calculateHash('Tere, maailm! Õlu ja öö.');
  expect(hash).toBeDefined();
});
```

---

## Action Items

1. **Срочно:** Исправить `require()` в ESM
2. **Срочно:** Добавить валидацию LOG_LEVEL
3. **Срочно:** Убрать declare window
4. Дополнить README полной документацией
5. Пересмотреть тесты констант
6. Добавить branded types для hash
7. Добавить structured logging mode

---

**Verdict:** НЕ готово для open source. Требуется существенная доработка.
