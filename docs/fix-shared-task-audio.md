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

### Шаг 1+2: Тесты + реализация doSynthesize() и fetchAudioUrl() — S3 кэш
- [x] Написать тесты в `audioPlaybackHelpers.test.ts` (6 тестов):
  - doSynthesize() проверяет S3 кэш (computeCacheKey + checkCachedAudio) перед synthesizeWithPolling()
  - doSynthesize() играет из кэша без вызова synthesizeWithPolling()
  - doSynthesize() fallback на synthesizeWithPolling() когда S3 кэш пуст
  - fetchAudioUrl() проверяет S3 кэш перед synthesizeWithPolling()
  - fetchAudioUrl() возвращает cached URL без synthesizeWithPolling()
  - fetchAudioUrl() fallback на synthesizeWithPolling() когда S3 кэш пуст
- [x] Изменить `audioPlaybackHelpers.ts`: добавить `tryBackendCache()` (computeCacheKey + checkCachedAudio) в `doSynthesize()` и `fetchAudioUrl()` перед `synthesizeWithPolling()`
- [x] Все 6 тестов проходят
- [x] **КОММИТ**: `fix: add S3 cache check before auth in audioPlaybackHelpers`

### Шаг 3: Проверка
- [x] Существующие тесты orchestratorHelpers проходят (3/3)
- [x] Существующие тесты useAudioPlaybackCore проходят (10/10)
- [x] Существующие тесты useSharedTaskAudio проходят (8/8)
- [x] Полный test suite проходит: 275 файлов, 2034 тестов, 0 ошибок
- [x] **КОММИТ**: `docs: mark plan steps as complete`
