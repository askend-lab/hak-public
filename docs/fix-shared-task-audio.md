# Fix: Shared Task Audio Playback Without Auth

## Проблема
На странице shared task (`/shared/task/:token`) аудио не воспроизводится без авторизации.
Ошибка: `AuthRequiredError: Authentication required` + HTTP 401.

## Корневая причина
В системе два отдельных пути воспроизведения аудио. Один (orchestratorHelpers.ts) уже
проверяет S3 кэш перед авторизацией. Другой (audioPlaybackHelpers.ts) — нет.

## Затронутые компоненты
- **Shared task page** — `useSharedTaskAudio` → `useAudioPlaybackCore` → `audioPlaybackHelpers.ts`
- **Task detail page** — `useAudioPlayback` → `useAudioPlaybackCore` → `audioPlaybackHelpers.ts`

## План изменений

### Код

- [ ] **audioPlaybackHelpers.ts: doSynthesize()** — добавить проверку S3 кэша через `computeCacheKey()` + `checkCachedAudio()` перед вызовом `synthesizeWithPolling()`. Если аудио в кэше — играть из кэша, если нет — текущий путь (синтез с авторизацией).

- [ ] **audioPlaybackHelpers.ts: fetchAudioUrl()** — аналогичное изменение для пути "Play All". Сначала проверить S3 кэш, потом synthesizeWithPolling().

### Тесты

- [ ] **audioPlaybackHelpers.test.ts** — добавить тесты:
  - doSynthesize() проверяет S3 кэш перед synthesizeWithPolling()
  - doSynthesize() играет из кэша без вызова synthesizeWithPolling()
  - doSynthesize() fallback на synthesizeWithPolling() когда кэш пуст
  - fetchAudioUrl() проверяет S3 кэш перед synthesizeWithPolling()
  - fetchAudioUrl() возвращает cached URL без synthesizeWithPolling()
  - fetchAudioUrl() fallback на synthesizeWithPolling() когда кэш пуст

- [ ] **useSharedTaskAudio.test.ts** — обновить тесты shared task аудио для нового поведения

- [ ] **useAudioPlaybackCore.test.ts** — убедиться что существующие тесты проходят

### Проверка

- [ ] Существующие тесты orchestratorHelpers проходят (не затронуты)
- [ ] Существующие тесты useAudioPlaybackCore проходят
- [ ] Новые тесты audioPlaybackHelpers проходят
- [ ] Полный `npm test` / `vitest` проходит без ошибок
