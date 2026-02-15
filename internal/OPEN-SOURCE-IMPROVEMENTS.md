# HAK Public — План улучшений для Open Source

Репозиторий: [askend-lab/hak-public](https://github.com/askend-lab/hak-public)
Текущий GitHub Community Profile health: **85%**
Дата аудита: 2026-02-15

Все изменения делаются в hak (private), затем синхронизируются в hak-public (mirror).

---

## Фаза 1 — Критичные (блокируют публикацию)

- [ ] **1.1. Убрать docs/internal/ из public repo**
  `docs/internal/HAK-PUBLIC-SECURITY-PLAN.md` и `HAK-SECURITY-REMAINING-TASKS.md` содержат детали архитектуры безопасности — rate limits, IP thresholds, WAF конфигурацию. Это attack surface info, не должно быть в public.
  **Действие:** добавить `docs/internal/` в `scripts/sync-to-public.sh` exclude list, либо переместить в `internal/` (уже gitignored для public).

- [ ] **1.2. Добавить CODE_OF_CONDUCT.md**
  GitHub Community Profile показывает gap. Стандарт для open source — [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
  **Действие:** создать `CODE_OF_CONDUCT.md` в корне репозитория.

- [ ] **1.3. Отключить force push на main**
  Сейчас `allow_force_pushes: true`. Для public repo опасно — любой мейнтейнер может перезаписать историю.
  **Действие:** `gh api repos/askend-lab/hak-public/branches/main/protection -X PUT` с `allow_force_pushes: false`.

- [ ] **1.4. Добавить required status checks**
  Сейчас `required_status_checks: null`. PR можно мерджить без зелёного CI.
  **Действие:** добавить "Lint, Typecheck, Test" как required check для main branch.

- [ ] **1.5. Проверить E2E workflow на совместимость с fork PRs**
  `e2e-tests.yml` использует `secrets.NPM_TOKEN`. Fork PRs не получат секреты → workflow упадёт.
  **Действие:** добавить `if: github.event.pull_request.head.repo.full_name == github.repository` или graceful fallback.

---

## Фаза 2 — Важные (best practices)

- [ ] **2.1. Добавить CHANGELOG.md**
  Contributors и пользователи не могут отследить изменения. Можно автоматизировать через `conventional-changelog` или вести вручную.
  **Действие:** создать `CHANGELOG.md`, описать формат (Keep a Changelog).

- [ ] **2.2. Создать GitHub Release v0.1.0**
  `latestRelease: null`. Releases — основной способ для пользователей OS-проектов следить за версиями.
  **Действие:** `gh release create v0.1.0 --title "v0.1.0 — Initial public release" --notes "..."`.

- [ ] **2.3. Добавить .github/dependabot.yml**
  В отличие от hak (private), hak-public не имеет Dependabot config для автообновления зависимостей.
  **Действие:** создать `.github/dependabot.yml` с npm и github-actions ecosystems.

- [ ] **2.4. Добавить CI status badge в README**
  Есть бейджи License и TypeScript, но нет бейджа CI. Пользователи и contributors не видят статус билда.
  **Действие:** добавить `[![Build & Test](https://github.com/askend-lab/hak-public/actions/workflows/build.yml/badge.svg)](...)`.

- [ ] **2.5. Исправить homepageUrl**
  Сейчас `homepageUrl` = GitHub URL (ссылка на себя). Должен быть URL рабочего продукта, демо или landing page.
  **Действие:** поставить реальный URL продукта или убрать, если демо нет.

- [ ] **2.6. Добавить скриншоты/демо в README**
  README не содержит визуал продукта. Для education platform скриншот резко увеличивает привлекательность и понимание проекта.
  **Действие:** сделать 1-2 скриншота (synthesis page, lesson view), добавить в README секцию "Screenshots".

- [ ] **2.7. Включить enforce_admins на branch protection**
  Сейчас `enforce_admins: false` — админы могут обходить branch protection. Для public OS repo лучше включить.
  **Действие:** обновить branch protection через API.

---

## Фаза 3 — Polish (качество)

- [ ] **3.1. Добавить .github/ISSUE_TEMPLATE/config.yml**
  Настроить contact links (→ Discussions для вопросов) и управление blank issues.
  **Действие:** создать config.yml с `blank_issues_enabled: false` и ссылкой на Discussions.

- [ ] **3.2. Добавить CODEOWNERS**
  Автоматическое назначение ревьюеров на PR. Полезно когда появятся внешние contributors.
  **Действие:** создать `.github/CODEOWNERS` с `* @askend-lab/core`.

- [ ] **3.3. Добавить FUNDING.yml**
  Если планируется принимать спонсорство (GitHub Sponsors, Open Collective).
  **Действие:** создать `.github/FUNDING.yml` (или отложить, если не актуально).

- [ ] **3.4. Добавить SUPPORT.md**
  GitHub рекомендует для направления пользователей: вопросы → Discussions, баги → Issues.
  **Действие:** создать `SUPPORT.md` с инструкциями куда обращаться.

- [ ] **3.5. Дополнить SPDX headers в 8 файлах**
  377 из 385 .ts/.tsx файлов имеют `// SPDX-License-Identifier: MIT` header. 8 пропущено:
  - `coverage-imports.test.ts`
  - 7 `*.generated.ts` файлов в `frontend/src/services/specs/features/`
  **Действие:** добавить headers (для generated — в генератор).

- [ ] **3.6. Дополнить NOTICE файл**
  Указаны 11 runtime deps, но пропущены: `i18next`, `react-i18next`, `@sentry/react`, `sass`, `vite`.
  **Действие:** пройти по `dependencies` всех package.json и обновить NOTICE.

- [ ] **3.7. Перенести полезные docs из internal в public**
  `docs/internal/design-system/` содержит 15 файлов (архитектура компонентов, layout guide, responsive testing). В `docs/02-DESIGN-SYSTEM/` только 4. Если design system публичный — стоит перенести.
  **Действие:** отобрать и перенести полезные гайды, убрав внутреннюю специфику.

- [ ] **3.8. Добавить стикер "Built with AI" или аналогичный badge**
  README упоминает AI-assisted methodology, но нет визуального маркера. Можно добавить бейдж.
  **Действие:** добавить custom badge в README header.

---

## Итого

| Фаза | Пунктов | Приоритет | Оценка времени |
|------|---------|-----------|----------------|
| 1 — Критичные | 5 | Блокер публикации | 2-3 часа |
| 2 — Важные | 7 | До публикации | 3-4 часа |
| 3 — Polish | 8 | После публикации | 4-5 часов |
