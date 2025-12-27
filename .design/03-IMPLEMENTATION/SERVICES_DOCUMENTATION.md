# Документация по сервисам Vabamorf и Merlin

## Обзор

Проект использует два сервиса для синтеза эстонской речи:
1. **Vabamorf** (порт 8001) - добавляет фонетические метки к тексту
2. **Merlin** (порт 8002) - синтезирует речь из текста с метками

---

## 1. Vabamorf - Морфологический анализатор

### Назначение
Анализирует эстонский текст и добавляет фонетические метки.

#### Фонетические символы:
- `<` - третья степень долготы (трёхморный слог), ставится перед гласной
- `?` - ударный слог, ставится перед гласной (указывается только если непредсказуем)
- `]` - палатализация, ставится после палатализованной согласной
- `~` - чёткое разделение *n* и *k* в кластере *nk* (только в *soonkond* и *tosinkond*)

#### Границы:
- `+` - граница морфем (основа+окончание)
- `_` - граница составного слова
- `=` - пробел между словами в многословных единицах
- `[` - отделяет флективное окончание от основы

#### Служебные символы:
- `'` - апостроф в иностранных именах для разделения окончания (напр. *Newcastle'i*)
- `()` - сомнительные/редко используемые формы
- `&` - параллельные варианты форм
- `#` - семантическая базовая форма слова

### API

**Health Check:**
```http
GET http://localhost:8001/health
```

**Анализ текста:**
```http
POST http://localhost:8001/analyze
Content-Type: application/json

{
  "text": "Mees peeti kinni"
}
```

**Ответ:**
```json
{
  "stressedText": "m<ees p<ee+ti k<in]ni",
  "originalText": "Mees peeti kinni"
}
```

### Параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `text` | string | Да | Эстонский текст (не пустой, макс 1 MB) |

### Примеры

```javascript
// Node.js
const response = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Tere kena ilm' })
});
const { stressedText } = await response.json();
```

```bash
# curl
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Mees peeti kinni"}'
```

### Коды ошибок
- `200` - успех
- `400` - неверный JSON или пустой text
- `413` - запрос больше 1 MB
- `500` - ошибка обработки

---

## 2. Merlin - TTS (Text-to-Speech)

### Назначение
Синтезирует речь из текста с фонетическими метками.

### API

**Health Check:**
```http
GET http://localhost:8002/health
```

**Синтез речи:**
```http
POST http://localhost:8002/synthesize
Content-Type: application/json

{
  "text": "m<ees p<ee+ti k<in]ni",
  "voice": "efm_l",
  "speed": 1.0,
  "pitch": 0,
  "returnBase64": true
}
```

**Ответ:**
```json
{
  "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "format": "wav"
}
```

### Параметры

| Параметр | Тип | Значения | По умолчанию | Описание |
|----------|-----|----------|--------------|----------|
| `text` | string | - | обязательный | Текст с фонетическими метками |
| `voice` | string | `efm_s`, `efm_l` | `efm_l` | Модель голоса |
| `speed` | float | 0.5 - 2.0 | 1.0 | Скорость речи |
| `pitch` | int | -500 - +500 | 0 | Изменение тона (Hz) |
| `returnBase64` | boolean | true/false | true | Формат возврата |

### Голосовые модели

- **efm_s** - для отдельных слов (short)
- **efm_l** - для предложений (long)

### Примеры

```javascript
// Базовый синтез
const response = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'tere',
    voice: 'efm_s',
    returnBase64: true
  })
});
const { audio } = await response.json();
const audioBuffer = Buffer.from(audio, 'base64');
fs.writeFileSync('output.wav', audioBuffer);
```

```javascript
// С изменением параметров (медленнее и ниже)
const response = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'm<ees p<ee+ti k<in]ni',
    voice: 'efm_l',
    speed: 0.8,    // медленнее
    pitch: -80,    // ниже
    returnBase64: true
  })
});
```

```bash
# curl - сохранить WAV файл
curl -X POST http://localhost:8002/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"tere","voice":"efm_s","returnBase64":false}' \
  --output output.wav
```

### Коды ошибок
- `200` - успех
- `400` - неверные параметры
- `500` - ошибка синтеза или timeout (30 сек)

---

## 3. End-to-End пайплайн

### Полный процесс синтеза

```javascript
// Шаг 1: Анализ текста
const analysisResponse = await fetch('http://localhost:8001/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Mees peeti kinni' })
});
const { stressedText } = await analysisResponse.json();
console.log(stressedText); // "m<ees p<ee+ti k<in]ni"

// Шаг 2: Синтез речи
const synthesisResponse = await fetch('http://localhost:8002/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: stressedText,
    voice: 'efm_l',
    speed: 1.0,
    returnBase64: true
  })
});
const { audio } = await synthesisResponse.json();

// Шаг 3: Сохранение
const audioBuffer = Buffer.from(audio, 'base64');
fs.writeFileSync('output.wav', audioBuffer);
```

### Диаграмма

```
Эстонский текст → [Vabamorf] → Текст с метками → [Merlin] → WAV аудио
```

---

## 4. Docker управление

### Запуск сервисов

```bash
# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Логи
docker-compose logs -f vabamorf
docker-compose logs -f merlin

# Остановить
docker-compose down
```

### Конфигурация портов

| Сервис | Внешний порт | Внутренний порт | Контейнер |
|--------|--------------|-----------------|-----------|
| Vabamorf | 8001 | 8000 | eki-vabamorf |
| Merlin | 8002 | 8000 | eki-merlin |

---

## 5. Производительность

| Операция | Время |
|----------|-------|
| Vabamorf (слово) | ~50-100 ms |
| Vabamorf (предложение) | ~100-200 ms |
| Merlin (слово) | ~1-3 сек |
| Merlin (предложение) | ~3-10 сек |
| End-to-end | ~5-12 сек |

---

## 6. Тестирование

```bash
# Запуск интеграционных тестов
npm test
```

Тесты в файле `__tests__/integration.test.ts` проверяют:
- Health checks
- Анализ текста (простой и сложный)
- Синтез с разными моделями
- Параметры speed и pitch
- End-to-end пайплайн
- Обработку ошибок

---

## 7. Troubleshooting

**Контейнер не запускается:**
```bash
# Пересобрать
docker-compose build --no-cache
docker-compose up -d
```

**Timeout при синтезе:**
```bash
# Увеличить timeout в docker-compose.yml
# TIMEOUT=120 для Merlin
docker-compose restart merlin
```

**Проверить здоровье сервисов:**
```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
```

---

## Ссылки

- **Vabamorf**: https://github.com/Filosoft/vabamorf
- **Merlin TTS**: https://github.com/CSTR-Edinburgh/merlin
- **Рабочая документация (спринты)**: `sprints/`

---

**Версия**: 1.0.0 | **Sprint**: 01 | **Дата**: 20.10.2025
