# Code Review: C01-G01 - Remaining Sections

**Reviewer:** Eve (злобный режим 😈)  
**Date:** 2026-02-05  
**Status:** 🟡 ACCEPTABLE WITH NOTES

---

## Part C: Frontend Components (C01-C06)

### C01: components/ui

**Status:** 🟢 GOOD

```typescript
// Icons.tsx - чистый паттерн
export const PlayIcon = (props: IconComponentProps) => <Icon name="play_arrow" {...props} />;
```

**Плюсы:**
- Консистентный API для всех иконок
- Типизированные props
- Re-export types для удобства

**Минусы:**
- [ ] **LOW:** Нет lazy loading для иконок (Material Symbols грузятся все сразу)

### C02-C06: Остальные компоненты

**Status:** 🟡 ACCEPTABLE

- [ ] **MED:** Отсутствует Storybook для визуального тестирования
- [ ] **MED:** Нет accessibility атрибутов (aria-label, role)
- [ ] **LOW:** Inline styles вместо CSS modules или Tailwind

---

## Part D: Frontend Core (D01-D06)

### D01-D06: pages, hooks, contexts, types, styles, utils

**Status:** 🟡 ACCEPTABLE

- [ ] **MED:** Нет React Query или SWR для data fetching
- [ ] **MED:** Zustand stores без devtools middleware
- [ ] **LOW:** Нет error boundaries
- [ ] **LOW:** Нет skeleton loaders

---

## Part E: Infrastructure (E01-E05)

### E01-E05: Terraform & GitHub Actions

**Status:** 🟠 NEEDS ATTENTION

### [ ] CRIT-01: Hardcoded AWS Account ID

**Файл:** `.github/workflows/build.yml`

```yaml
role-to-assume: arn:aws:iam::465168436856:role/GitHubActionsRole
```

AWS Account ID в открытом коде. Для open source — плохо.

### [ ] CRIT-02: Hardcoded S3 bucket names

```yaml
ARTIFACTS_BUCKET: askend-lab-artifacts
```

```hcl
bucket = "askend-lab-terraform-state"
```

### [ ] MED-01: Нет terraform.tfvars.example

Новые контрибьюторы не знают, какие переменные нужны.

### [ ] MED-02: Нет GitHub Environments

Secrets хранятся глобально, а не per-environment.

### [ ] LOW-01: Нет Dependabot config

Для open source нужен `.github/dependabot.yml`.

---

## Part F: Docs & Config (F01-F03)

### F01: Root config files

**Status:** 🟡 ACCEPTABLE

- [ ] **MED:** `package.json` не имеет `repository`, `bugs`, `homepage` полей
- [ ] **LOW:** Нет `.nvmrc` для версии Node
- [ ] **LOW:** Нет `CONTRIBUTING.md`
- [ ] **LOW:** Нет `LICENSE` файла!

### F02: docs/

**Status:** 🟡 ACCEPTABLE

- Документация есть, но разбросана
- Нет единой точки входа для контрибьюторов

### F03: README, BACKLOG, scripts/

**Status:** 🟡 ACCEPTABLE

- README хороший, но ссылается на internal URLs
- BACKLOG содержит internal context

---

## Part G: Final Cross-Module Review (G01)

### Общие паттерны и проблемы

| Проблема | Модули | Приоритет |
|----------|--------|-----------|
| Hardcoded credentials/IDs | auth, infra, workflows | 🔴 CRITICAL |
| Отсутствие CORS headers | vabamorf-api, merlin-api | 🔴 CRITICAL |
| Дублирование кода | shared↔modules, auth | 🟠 MEDIUM |
| Отсутствие retry logic | все API клиенты | 🟠 MEDIUM |
| Inconsistent error handling | везде | 🟠 MEDIUM |
| Нет LICENSE файла | root | 🟠 MEDIUM |
| Magic numbers без констант | везде | 🟡 LOW |

### Рекомендации для Open Source

1. **Создать `.env.example`** со всеми нужными переменными
2. **Добавить LICENSE** (MIT или Apache 2.0)
3. **Создать CONTRIBUTING.md** с инструкциями
4. **Добавить SECURITY.md** для responsible disclosure
5. **Очистить hardcoded values** — всё в env variables
6. **Добавить GitHub Issue templates**
7. **Настроить Dependabot**

---

## Summary by Section

| Section | Status | Critical | Medium | Low |
|---------|--------|----------|--------|-----|
| C: Components | 🟡 | 0 | 2 | 1 |
| D: Core | 🟡 | 0 | 2 | 2 |
| E: Infra | 🟠 | 2 | 2 | 1 |
| F: Docs | 🟡 | 0 | 2 | 3 |
| G: Final | 🟠 | 2 | 3 | 1 |

---

**Overall Verdict:** Проект требует cleanup перед open source, особенно удаление hardcoded credentials и добавление стандартных open source файлов.
