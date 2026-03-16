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

## Методология
- **TDD**: сначала пишем failing тест, потом реализацию
- **Коммит после каждого чекбокса**
- **Одна ветка**: `kate/fix-shared-task-audio`
- **PR не делать** — только локальные коммиты

## План изменений

### Шаг 1: Тесты для doSynthesize() — S3 кэш
- [ ] Написать failing тесты в `audioPlaybackHelpers.test.ts`:
  - doSynthesize() проверяет S3 кэш (computeCacheKey + checkCachedAudio) перед synthesizeWithPolling()
  - doSynthesize() играет из кэша без вызова synthesizeWithPolling()
  - doSynthesize() fallback на synthesizeWithPolling() когда S3 кэш пуст
- [ ] **КОММИТ**: `test: add failing tests for doSynthesize S3 cache check`

### Шаг 2: Реализация doSynthesize() — S3 кэш
- [ ] Изменить `audioPlaybackHelpers.ts: doSynthesize()` — добавить проверку S3 кэша через `computeCacheKey()` + `checkCachedAudio()` перед вызовом `synthesizeWithPolling()`
- [ ] Все тесты из Шага 1 проходят
- [ ] **КОММИТ**: `fix: doSynthesize checks S3 cache before requiring auth`

### Шаг 3: Тесты для fetchAudioUrl() — S3 кэш
- [ ] Написать failing тесты в `audioPlaybackHelpers.test.ts`:
  - fetchAudioUrl() проверяет S3 кэш перед synthesizeWithPolling()
  - fetchAudioUrl() возвращает cached URL без synthesizeWithPolling()
  - fetchAudioUrl() fallback на synthesizeWithPolling() когда S3 кэш пуст
- [ ] **КОММИТ**: `test: add failing tests for fetchAudioUrl S3 cache check`

### Шаг 4: Реализация fetchAudioUrl() — S3 кэш
- [ ] Изменить `audioPlaybackHelpers.ts: fetchAudioUrl()` — добавить проверку S3 кэша перед synthesizeWithPolling()
- [ ] Все тесты из Шага 3 проходят
- [ ] **КОММИТ**: `fix: fetchAudioUrl checks S3 cache before requiring auth`

### Шаг 5: Проверка
- [ ] Существующие тесты orchestratorHelpers проходят (не затронуты)
- [ ] Существующие тесты useAudioPlaybackCore проходят
- [ ] Существующие тесты useSharedTaskAudio проходят
- [ ] Полный test suite проходит без ошибок
- [ ] **КОММИТ**: `test: verify all existing tests pass with S3 cache changes`
