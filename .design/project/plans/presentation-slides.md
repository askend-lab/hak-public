# Presentation Plan - AI-First Development

## Slide 1: Team
- Команда из 13 AI-агентов
- Alice, Bob, Kate, Mike, Sam, Boxer, Eve, Sophia, Max, Felicia, Luna, Eidos
- [картинка команды]

## Slide 2: How It Works - Slack
- Как работать с 13 агентами?
- **Проблема:** 13 агентов × каждый что-то делает = перегрузка
- **Решение:** Slack
  - Агенты пишут только когда есть вопрос
  - Снижает когнитивную нагрузку
  - Мобильность: лес, велосипед
  - Стратегически: путь к командной работе агентов

## Slide 3: Project - HAK
- Estonian pronunciation learning platform
- History: prototype → Gherkin → code

**HAK Project Timeline (Lines Changed by Day)**

| Date       | Added    | Deleted  | Net      | What Happened                          |
|------------|----------|----------|----------|----------------------------------------|
| Dec 09     | +3,836   | -9       | +3,827   | DevBox setup                           |
| Dec 10     | +161     | -19      | +142     | DevBox updates                         |
| Dec 11     | +12,697  | -36      | +12,661  | CI/CD + Terraform + SingleTableLambda  |
| Dec 12     | +481     | -151     | +330     | Landing page                           |
| Dec 15     | +27,847  | -16,990  | +10,857  | US-020 setup, Audio API Lambda         |
| Dec 16     | +13,149  | -237     | +12,912  | EKI Audio integration, CI/CD           |
| Dec 17     | +39,463  | -7,891   | +31,572  | Cognito, Gherkin reporter, refactoring |
| Dec 20     | +102     | -207     | -105     | DRY refactoring                        |
| Dec 21     | +1,564   | -291     | +1,273   | ESLint fixes, tests                    |
| Dec 23     | +5,210   | -2,567   | +2,643   | DevBox ESLint config                   |
| Dec 24     | +3,119   | -1,672   | +1,447   | Coverage enforcement                   |
| Dec 25     | +3,040   | -11,740  | -8,700   | Cleanup + first Gherkin spec           |
| **Dec 27** | **+19,494** | **-1,179** | **+18,315** | **🎯 Gherkin specs batch #1 (15 files)** |
| **Dec 29** | **+14,143** | **-1,904** | **+12,239** | **🎯 Gherkin specs batch #2 (18 files)** |
| Dec 30-31  | +4,957   | -899     | +4,058   | Frontend polish, test coverage         |
|------------|----------|----------|----------|----------------------------------------|
| **TOTAL**  | ~150K    | ~46K     | ~104K    | 3 weeks                                |

**Key:** Dec 27 + Dec 29 = main Gherkin → Code generation

## Slide 4: Gherkin Is Not Enough
- Генерация по Gherkin работает (~7 часов, все тесты зелёные)
- НО: визуальный хаос без дизайна
- Нужны: дизайн-система + UX требования + сравнение с прототипом

## Slide 5: Prompts Don't Work (Парадокс)
- Ожидание: накопим библиотеку промптов
- Реальность: накопился только ОДИН промпт
- Почему: сессия 8 часов → агент "забывает" инструкции

## Slide 6: Documentation Doesn't Work (Парадокс)
- Документы в начале сессии → испаряются из памяти
- AI умный: видит устаревший документ → игнорирует

## Slide 7: What DO We Transfer? → DevBox
- Не промпты, не документацию
- DevBox = система контроля разработки с AI
- **Не надо учить AI программировать — надо установить правила**
- Правила ≠ слова. Правила = конкретные проверки

## Slide 8: DevBox Overview
- DevBox в 3 раза больше чем сам проект HAK (по тестам)
- Фреймворк > проект который он строит
- ~18 hooks + ~50 ESLint rules + coverage gates

## Slide 9: Examples - Enforcement
- **TDD Enforcement** - timestamp check: тесты ДО кода
- **Coverage Enforcement** - минимум 80% покрытия

## Slide 10: Sprint Workflow
- Сначала: планируем вместе с агентом (20-25 задач)
- Записываем в документ
- [пример из Boxer - показать сторинки]
- Потом агент САМОСТОЯТЕЛЬНО: коммиты → пуши → PR → тесты → рефакторинг

## Slide 11: Refactoring Philosophy
- Время рефакторинга = 2× время разработки
- Рефакторинг пока агент не заплачет
- "Не найти больше ничего для рефакторинга" = готово

## Slide 12: Quality Standards - NASA/Pentagon Level
- Complexity 8 (как космические исследования)
- Ссылка на Power of 10 Rules
- Код читаемый для людей И понятный для AI
- **Не обучать AI программированию — бросить в проект**
- AI сам найдёт архитектуру

## Slide 13: Philosophy
- Готовим "спецназовца" — сам выкрутится из любой ситуации
- Ограничиваем правилами поведения, не учим
- Claude 4.5 — страшная сила
- Обучать его программированию безнадёжно
- **Он знает больше нас**

## Slide 14: Honest Assessment
- Сейчас: платформа для ОДНОГО разработчика
- Команда на ОДНОГО менеджера
- Пока не скалировано
- Вся функциональность для скейлинга зашита в одном месте: когда агент пишет в Slack
